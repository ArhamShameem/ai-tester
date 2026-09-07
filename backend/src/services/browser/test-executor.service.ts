import { Page, Locator } from "playwright";
import { BrowserService, BrowserSession } from "./browser.service";
import { validateTargetUrl } from "../../utils/url-validator";
import { TestStep, TestActionType } from "../../types/test-case.types";
import { StorageService } from "../storage/storage.service";

export interface StepExecutionResult {
  stepIndex: number;
  step: TestStep;
  success: boolean;
  error?: string;
  durationMs: number;
}

export interface TestCaseExecutionOutcome {
  status: "PASSED" | "FAILED";
  error?: string;
  durationMs: number;
  screenshot?: string;
  failedStepIndex?: number;
  stepResults: StepExecutionResult[];
}

export class TestExecutorService {
  /**
   * Executes a single test case step-by-step against an isolated browser session.
   */
  static async executeTestCase(
    projectId: string,
    testRunId: string,
    testResultId: string,
    initialUrl: string,
    steps: TestStep[]
  ): Promise<TestCaseExecutionOutcome> {
    const startTime = Date.now();
    let session: BrowserSession | undefined;
    const stepResults: StepExecutionResult[] = [];

    try {
      session = await BrowserService.createSession();
      const page = session.page;

      // Validate base target URL for SSRF protection
      const validatedBase = validateTargetUrl(initialUrl);

      // Start by loading the target URL if first step isn't explicit navigate
      if (steps.length === 0 || steps[0].action !== "navigate") {
        await page.goto(validatedBase.toString(), {
          waitUntil: "domcontentloaded",
          timeout: 20000
        });
      }

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepStart = Date.now();

        try {
          await this.executeStep(page, step, validatedBase.origin);
          stepResults.push({
            stepIndex: i,
            step,
            success: true,
            durationMs: Date.now() - stepStart
          });
        } catch (stepErr: unknown) {
          const errMsg =
            stepErr instanceof Error ? stepErr.message : String(stepErr);

          stepResults.push({
            stepIndex: i,
            step,
            success: false,
            error: errMsg,
            durationMs: Date.now() - stepStart
          });

          // Capture failure screenshot
          let screenshotUrl: string | undefined;
          try {
            const screenshotBuffer = await page.screenshot({
              type: "png",
              fullPage: false,
              timeout: 5000
            });

            screenshotUrl = await StorageService.getStorage().saveScreenshot(
              projectId,
              testRunId,
              testResultId,
              screenshotBuffer
            );
          } catch (shotErr) {
            console.warn(
              `[TestExecutor] Failed to capture failure screenshot for test ${testResultId}:`,
              shotErr
            );
          }

          return {
            status: "FAILED",
            error: `Step ${i + 1} (${step.action} -> "${step.target}") failed: ${errMsg}`,
            durationMs: Date.now() - startTime,
            screenshot: screenshotUrl,
            failedStepIndex: i,
            stepResults
          };
        }
      }

      return {
        status: "PASSED",
        durationMs: Date.now() - startTime,
        stepResults
      };
    } catch (globalErr: unknown) {
      const errMsg =
        globalErr instanceof Error ? globalErr.message : String(globalErr);

      return {
        status: "FAILED",
        error: `Browser setup or execution failure: ${errMsg}`,
        durationMs: Date.now() - startTime,
        stepResults
      };
    } finally {
      await BrowserService.closeSession(session);
    }
  }

  /**
   * Executes a single deterministic action without eval() or arbitrary script execution.
   */
  private static async executeStep(
    page: Page,
    step: TestStep,
    baseOrigin: string
  ): Promise<void> {
    const actionTimeout = 10000;

    switch (step.action) {
      case "navigate": {
        // Enforce SSRF check on navigation target
        let targetUrl = step.target;
        if (targetUrl.startsWith("/")) {
          targetUrl = `${baseOrigin}${targetUrl}`;
        }
        const validated = validateTargetUrl(targetUrl);
        await page.goto(validated.toString(), {
          waitUntil: "domcontentloaded",
          timeout: 20000
        });
        await page.waitForLoadState("networkidle", { timeout: 3000 }).catch(() => {});
        break;
      }

      case "click": {
        const locator = await this.resolveLocator(page, step.target, "click");
        await locator.first().scrollIntoViewIfNeeded({ timeout: actionTimeout }).catch(() => {});
        await locator.first().click({ timeout: actionTimeout });
        // Give slight breathing room for navigation or state transitions
        await page.waitForTimeout(500);
        break;
      }

      case "fill": {
        const locator = await this.resolveLocator(page, step.target, "fill");
        await locator.first().scrollIntoViewIfNeeded({ timeout: actionTimeout }).catch(() => {});
        await locator.first().fill(step.value || "", { timeout: actionTimeout });
        break;
      }

      case "select": {
        const locator = await this.resolveLocator(page, step.target, "select");
        await locator.first().selectOption(step.value || "", { timeout: actionTimeout });
        break;
      }

      case "check": {
        const locator = await this.resolveLocator(page, step.target, "check");
        await locator.first().check({ timeout: actionTimeout });
        break;
      }

      case "uncheck": {
        const locator = await this.resolveLocator(page, step.target, "uncheck");
        await locator.first().uncheck({ timeout: actionTimeout });
        break;
      }

      case "assertVisible": {
        const locator = await this.resolveLocator(page, step.target, "assertVisible");
        const visible = await locator.first().isVisible();
        if (!visible) {
          // Allow wait for visible state
          await locator.first().waitFor({ state: "visible", timeout: actionTimeout });
        }
        break;
      }

      case "assertText": {
        const expected = (step.value || step.target).trim();
        const locator = await this.resolveLocator(page, step.target, "assertText");
        const textContent = await locator.first().innerText({ timeout: actionTimeout });
        if (!textContent || !textContent.toLowerCase().includes(expected.toLowerCase())) {
          throw new Error(
            `Expected element to contain text "${expected}", but observed "${textContent?.trim()}"`
          );
        }
        break;
      }

      case "assertURL": {
        const expectedPathOrUrl = step.target.trim();
        const currentUrl = page.url();
        if (!currentUrl.includes(expectedPathOrUrl)) {
          throw new Error(
            `Expected current URL to contain "${expectedPathOrUrl}", but current URL is "${currentUrl}"`
          );
        }
        break;
      }

      default: {
        throw new Error(`Unsupported test step action: ${(step as any).action}`);
      }
    }
  }

  /**
   * Resolves element locator with resilient multi-strategy fallback:
   * 1. Explicit prefixes (testid=, label=, placeholder=, role=, text=)
   * 2. Test ID
   * 3. Role + Name
   * 4. Label
   * 5. Placeholder
   * 6. Accessible Text
   * 7. CSS Selector
   */
  private static async resolveLocator(
    page: Page,
    target: string,
    action: TestActionType
  ): Promise<Locator> {
    const cleanTarget = target.trim();

    // 1. Check explicit prefix
    if (cleanTarget.startsWith("testid=")) {
      return page.getByTestId(cleanTarget.replace(/^testid=/, ""));
    }
    if (cleanTarget.startsWith("label=")) {
      return page.getByLabel(cleanTarget.replace(/^label=/, ""));
    }
    if (cleanTarget.startsWith("placeholder=")) {
      return page.getByPlaceholder(cleanTarget.replace(/^placeholder=/, ""));
    }
    if (cleanTarget.startsWith("text=")) {
      return page.getByText(cleanTarget.replace(/^text=/, ""));
    }

    // 2. If target matches standard CSS selector syntax (.class, #id, tag[attr], etc.)
    if (/^[.#\[]/.test(cleanTarget) || cleanTarget === "body" || cleanTarget === "input" || cleanTarget === "button") {
      return page.locator(cleanTarget);
    }

    // 3. Multi-strategy resolution
    // Try testId first
    const testIdLocator = page.getByTestId(cleanTarget);
    if ((await testIdLocator.count().catch(() => 0)) > 0) {
      return testIdLocator;
    }

    // If clicking, try button or link role
    if (action === "click") {
      const buttonLocator = page.getByRole("button", { name: cleanTarget, exact: false });
      if ((await buttonLocator.count().catch(() => 0)) > 0) {
        return buttonLocator;
      }

      const linkLocator = page.getByRole("link", { name: cleanTarget, exact: false });
      if ((await linkLocator.count().catch(() => 0)) > 0) {
        return linkLocator;
      }
    }

    // If filling or selecting, try label or placeholder
    if (action === "fill" || action === "select") {
      const labelLocator = page.getByLabel(cleanTarget, { exact: false });
      if ((await labelLocator.count().catch(() => 0)) > 0) {
        return labelLocator;
      }

      const placeholderLocator = page.getByPlaceholder(cleanTarget, { exact: false });
      if ((await placeholderLocator.count().catch(() => 0)) > 0) {
        return placeholderLocator;
      }

      // Try input with name or id attribute
      const inputAttrLocator = page.locator(
        `input[name="${cleanTarget}"], input[id="${cleanTarget}"], textarea[name="${cleanTarget}"], select[name="${cleanTarget}"]`
      );
      if ((await inputAttrLocator.count().catch(() => 0)) > 0) {
        return inputAttrLocator;
      }
    }

    // Try visible text
    const textLocator = page.getByText(cleanTarget, { exact: false });
    if ((await textLocator.count().catch(() => 0)) > 0) {
      return textLocator;
    }

    // Default back to standard locator query
    return page.locator(cleanTarget);
  }
}
