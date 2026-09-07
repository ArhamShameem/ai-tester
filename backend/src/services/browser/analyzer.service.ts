import { Page } from "playwright";
import { BrowserService, BrowserSession } from "./browser.service";
import { validateTargetUrl } from "../../utils/url-validator";
import { AppError } from "../../utils/AppError";
import prisma from "../../lib/prisma";
import { StructuredAnalysis } from "../../types/analysis.types";

export class AnalyzerService {
  /**
   * Navigates to the target application URL, extracts structured metadata,
   * stores the result in PostgreSQL, and returns the analysis.
   */
  static async analyzeProject(
    userId: string,
    projectId: string
  ): Promise<StructuredAnalysis> {
    // 1. Verify project exists and belongs to the user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId
      }
    });

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    // 2. Validate URL & prevent SSRF
    const validatedUrl = validateTargetUrl(project.url);
    const targetUrlString = validatedUrl.toString();

    let session: BrowserSession | undefined;

    try {
      // 3. Launch isolated Playwright browser session
      session = await BrowserService.createSession();
      const page = session.page;

      // 4. Navigate to URL with configurable timeout
      const navigationTimeout = 25000;
      try {
        await page.goto(targetUrlString, {
          waitUntil: "domcontentloaded",
          timeout: navigationTimeout
        });

        // Give the page a brief window to settle network/hydration
        await page
          .waitForLoadState("networkidle", { timeout: 5000 })
          .catch(() => {});
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : String(err);

        if (errorMsg.includes("Timeout") || errorMsg.includes("timed out")) {
          throw new AppError(
            `Navigation timed out after ${navigationTimeout / 1000}s while loading ${targetUrlString}`,
            504
          );
        } else if (
          errorMsg.includes("ERR_NAME_NOT_RESOLVED") ||
          errorMsg.includes("ENOTFOUND")
        ) {
          throw new AppError(
            `DNS failure: Unable to resolve hostname for ${targetUrlString}`,
            400
          );
        } else if (
          errorMsg.includes("ERR_CONNECTION_REFUSED") ||
          errorMsg.includes("ECONNREFUSED")
        ) {
          throw new AppError(
            `Connection refused: The target server at ${targetUrlString} is not reachable`,
            502
          );
        } else {
          throw new AppError(
            `Failed to navigate to target URL: ${errorMsg.slice(0, 150)}`,
            400
          );
        }
      }

      // 5. Extract structured DOM representation
      const extracted = await this.extractPageMetadata(page, validatedUrl);

      const analysisResult: StructuredAnalysis = {
        url: targetUrlString,
        title: extracted.title,
        description: extracted.description,
        headings: extracted.headings,
        links: extracted.links,
        discoveredRoutes: extracted.discoveredRoutes,
        buttons: extracted.buttons,
        inputs: extracted.inputs,
        forms: extracted.forms,
        selects: extracted.selects,
        checkboxes: extracted.checkboxes,
        radioButtons: extracted.radioButtons,
        navigation: extracted.navigation,
        visibleTextSummary: extracted.visibleTextSummary,
        scannedAt: new Date().toISOString()
      };

      // 6. Save analysis to database
      await prisma.applicationAnalysis.create({
        data: {
          projectId: project.id,
          data: analysisResult as unknown as object
        }
      });

      return analysisResult;
    } finally {
      // 7. Always ensure browser resources are closed cleanly
      if (session) {
        await BrowserService.closeSession(session);
      }
    }
  }

  /**
   * In-browser DOM evaluation to extract structured elements
   */
  private static async extractPageMetadata(
    page: Page,
    originUrl: URL
  ): Promise<{
    title: string;
    description: string;
    headings: StructuredAnalysis["headings"];
    links: StructuredAnalysis["links"];
    discoveredRoutes: string[];
    buttons: StructuredAnalysis["buttons"];
    inputs: StructuredAnalysis["inputs"];
    forms: StructuredAnalysis["forms"];
    selects: StructuredAnalysis["selects"];
    checkboxes: StructuredAnalysis["checkboxes"];
    radioButtons: StructuredAnalysis["radioButtons"];
    navigation: StructuredAnalysis["navigation"];
    visibleTextSummary: string;
  }> {
    const originHost = originUrl.origin;

    // Define esbuild __name shim in page environment before function evaluation
    await page.evaluate(
      "window.__name = (fn) => fn; globalThis.__name = (fn) => fn;"
    );

    return await page.evaluate(
      ({ originHost }: { originHost: string }) => {
        // Page title & meta description
        const title = document.title || "";
        const metaDescEl = document.querySelector('meta[name="description"]');
        const description = metaDescEl?.getAttribute("content") || "";

        // Helper to get text or aria-label
        const cleanText = (str?: string | null) =>
          str ? str.replace(/\s+/g, " ").trim() : "";

        // Helper to find associated label for an input
        const findLabel = (inputEl: HTMLElement): string => {
          // 1. Check aria-labelledby
          const labelledBy = inputEl.getAttribute("aria-labelledby");
          if (labelledBy) {
            const labelEl = document.getElementById(labelledBy);
            if (labelEl) return cleanText(labelEl.textContent);
          }

          // 2. Check id match with <label for="...">
          if (inputEl.id) {
            const labelFor = document.querySelector(`label[for="${inputEl.id}"]`);
            if (labelFor) return cleanText(labelFor.textContent);
          }

          // 3. Check enclosing label
          const parentLabel = inputEl.closest("label");
          if (parentLabel) {
            return cleanText(parentLabel.textContent);
          }

          return "";
        };

        // 1. Headings (h1, h2, h3)
        const headings: Array<{ level: number; text: string }> = [];
        document.querySelectorAll("h1, h2, h3").forEach((el) => {
          const text = cleanText(el.textContent);
          if (text) {
            const level = parseInt(el.tagName.replace("H", ""), 10) || 1;
            headings.push({ level, text });
          }
        });

        // 2. Links & Route Discovery
        const links: Array<{ text: string; href: string; isExternal: boolean }> = [];
        const internalRoutes = new Set<string>();

        document.querySelectorAll("a[href]").forEach((el) => {
          const hrefAttr = el.getAttribute("href");
          if (!hrefAttr) return;

          const trimmed = hrefAttr.trim();
          if (
            trimmed.startsWith("mailto:") ||
            trimmed.startsWith("tel:") ||
            trimmed.startsWith("javascript:") ||
            trimmed === "#" ||
            trimmed.startsWith("#")
          ) {
            return;
          }

          let isExternal = false;
          let normalizedHref = trimmed;

          try {
            const parsed = new URL(trimmed, document.baseURI);
            normalizedHref = parsed.href;
            if (parsed.origin !== originHost) {
              isExternal = true;
            } else {
              // Collect internal path route
              const pathRoute = parsed.pathname + parsed.search;
              internalRoutes.add(pathRoute);
            }
          } catch {
            isExternal = true;
          }

          const text = cleanText(el.textContent) || el.getAttribute("aria-label") || "";
          links.push({
            text: text.slice(0, 80),
            href: normalizedHref,
            isExternal
          });
        });

        // 3. Buttons
        const buttons: Array<{
          text: string;
          ariaLabel?: string;
          type?: string;
          id?: string;
          role?: string;
          testId?: string;
        }> = [];

        document
          .querySelectorAll("button, [role='button'], input[type='button'], input[type='submit']")
          .forEach((el) => {
            const text = cleanText(el.textContent) || el.getAttribute("value") || "";
            const ariaLabel = el.getAttribute("aria-label") || undefined;
            const type = el.getAttribute("type") || "button";
            const id = el.id || undefined;
            const role = el.getAttribute("role") || (el.tagName === "BUTTON" ? "button" : undefined);
            const testId =
              el.getAttribute("data-testid") ||
              el.getAttribute("data-test") ||
              undefined;

            if (text || ariaLabel || id) {
              buttons.push({
                text: text.slice(0, 60),
                ariaLabel,
                type,
                id,
                role,
                testId
              });
            }
          });

        // 4. Inputs
        const inputs: Array<{
          type: string;
          name?: string;
          placeholder?: string;
          ariaLabel?: string;
          label?: string;
          required: boolean;
          id?: string;
          testId?: string;
        }> = [];

        const checkboxes: Array<{
          type: "checkbox";
          name?: string;
          id?: string;
          label?: string;
          checked: boolean;
        }> = [];

        const radioButtons: Array<{
          type: "radio";
          name?: string;
          id?: string;
          label?: string;
          checked: boolean;
        }> = [];

        document.querySelectorAll("input, textarea").forEach((el) => {
          const inputEl = el as HTMLInputElement;
          const type = (inputEl.getAttribute("type") || "text").toLowerCase();

          if (type === "checkbox") {
            checkboxes.push({
              type: "checkbox",
              name: inputEl.name || undefined,
              id: inputEl.id || undefined,
              label: findLabel(inputEl) || undefined,
              checked: inputEl.checked
            });
            return;
          }

          if (type === "radio") {
            radioButtons.push({
              type: "radio",
              name: inputEl.name || undefined,
              id: inputEl.id || undefined,
              label: findLabel(inputEl) || undefined,
              checked: inputEl.checked
            });
            return;
          }

          if (type === "submit" || type === "button" || type === "hidden") {
            return;
          }

          inputs.push({
            type,
            name: inputEl.name || undefined,
            placeholder: inputEl.placeholder || undefined,
            ariaLabel: inputEl.getAttribute("aria-label") || undefined,
            label: findLabel(inputEl) || undefined,
            required: inputEl.required || inputEl.hasAttribute("required"),
            id: inputEl.id || undefined,
            testId:
              inputEl.getAttribute("data-testid") ||
              inputEl.getAttribute("data-test") ||
              undefined
          });
        });

        // 5. Forms
        const forms: Array<{
          id?: string;
          name?: string;
          action?: string;
          method?: string;
          inputsCount: number;
          inputNames: string[];
        }> = [];

        document.querySelectorAll("form").forEach((form) => {
          const formInputs = form.querySelectorAll("input, select, textarea");
          const inputNames: string[] = [];
          formInputs.forEach((inp) => {
            const name = (inp as HTMLInputElement).name;
            if (name) inputNames.push(name);
          });

          forms.push({
            id: form.id || undefined,
            name: form.getAttribute("name") || undefined,
            action: form.getAttribute("action") || undefined,
            method: (form.getAttribute("method") || "GET").toUpperCase(),
            inputsCount: formInputs.length,
            inputNames: inputNames.slice(0, 10)
          });
        });

        // 6. Select dropdowns
        const selects: Array<{
          name?: string;
          id?: string;
          label?: string;
          options: Array<{ value: string; text: string }>;
        }> = [];

        document.querySelectorAll("select").forEach((sel) => {
          const options: Array<{ value: string; text: string }> = [];
          sel.querySelectorAll("option").forEach((opt) => {
            options.push({
              value: opt.value || "",
              text: cleanText(opt.textContent)
            });
          });

          selects.push({
            name: sel.name || undefined,
            id: sel.id || undefined,
            label: findLabel(sel) || undefined,
            options: options.slice(0, 20)
          });
        });

        // 7. Navigation elements
        const navigation: Array<{ text: string; href: string }> = [];
        document.querySelectorAll("nav a[href], [role='navigation'] a[href]").forEach((el) => {
          const href = el.getAttribute("href");
          const text = cleanText(el.textContent);
          if (href && text) {
            navigation.push({ text: text.slice(0, 40), href });
          }
        });

        // 8. Visible text summary (first 1500 characters, no raw HTML)
        const bodyClone = document.body.cloneNode(true) as HTMLElement;
        bodyClone.querySelectorAll("script, style, noscript, svg").forEach((s) => s.remove());
        const visibleTextSummary = cleanText(bodyClone.innerText || bodyClone.textContent).slice(0, 1500);

        return {
          title,
          description,
          headings: headings.slice(0, 25),
          links: links.slice(0, 50),
          discoveredRoutes: Array.from(internalRoutes).slice(0, 30),
          buttons: buttons.slice(0, 30),
          inputs: inputs.slice(0, 30),
          forms: forms.slice(0, 10),
          selects: selects.slice(0, 15),
          checkboxes: checkboxes.slice(0, 20),
          radioButtons: radioButtons.slice(0, 20),
          navigation: navigation.slice(0, 20),
          visibleTextSummary
        };
      },
      { originHost }
    );
  }
}
