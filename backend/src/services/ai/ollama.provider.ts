import { AIProvider } from "./ai.provider";
import { StructuredAnalysis } from "../../types/analysis.types";
import {
  TestCaseDefinition,
  TestStep,
  GeneratedTestCasesOutput,
  FailureAnalysisInput,
  FailureAnalysisResult,
  TestActionType,
  TestGenerationOptions
} from "../../types/test-case.types";
import {
  generatedTestCasesSchema,
  failureAnalysisSchema
} from "../../schemas/test-case.schema";
import { buildTestGenerationPrompt } from "./prompts/test-generation.prompt";
import { buildFailureAnalysisPrompt } from "./prompts/failure-analysis.prompt";

export class OllamaProvider implements AIProvider {
  public readonly name = "Ollama";
  private baseUrl: string;
  private model: string;

  constructor(baseUrl?: string, model?: string) {
    const rawUrl = baseUrl || process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
    this.baseUrl = rawUrl.replace(/\/$/, "").replace("//localhost:", "//127.0.0.1:");
    this.model = model || process.env.OLLAMA_MODEL || "qwen3:4b";
  }

  /**
   * Generates structured functional test cases from application analysis with optional user context.
   */
  async generateTestCases(
    analysis: StructuredAnalysis,
    options?: TestGenerationOptions
  ): Promise<GeneratedTestCasesOutput> {
    const prompt = buildTestGenerationPrompt(analysis, options);
    const targetCount = options?.count ? Math.min(15, Math.max(1, options.count)) : 5;
    const numPredict = Math.min(3072, Math.max(768, targetCount * 240));
    const timeoutMs = Math.min(360000, Math.max(180000, targetCount * 45000));

    try {
      console.log(
        `[OllamaProvider] Calling Ollama (${this.model}) for ${targetCount} tests${
          options?.context ? ` with context: "${options.context.slice(0, 50)}..."` : ""
        }...`
      );
      const rawResponse = await this.callOllamaApi(prompt, timeoutMs, {
        num_predict: numPredict
      });
      const parsedJson = this.extractAndParseJson(rawResponse);
      const sanitizedCases = this.sanitizeTestCases(parsedJson, analysis.url);
      const validated = generatedTestCasesSchema.safeParse({ testCases: sanitizedCases });

      if (validated.success && validated.data.testCases.length > 0) {
        console.log(
          `[OllamaProvider] Successfully generated ${validated.data.testCases.length} tests using Ollama (${this.model})`
        );
        return {
          testCases: validated.data.testCases,
          source: `Ollama (${this.model})`
        };
      }
      console.warn(
        "[OllamaProvider] Response did not conform to test case schema after sanitization. Falling back to heuristic generator.",
        JSON.stringify(validated.error?.issues, null, 2)
      );
    } catch (err) {
      console.warn(
        `[OllamaProvider] Ollama call failed or unreachable (${this.baseUrl}, model: ${this.model}). Using heuristic test generator fallback. Reason:`,
        err instanceof Error ? err.message : String(err)
      );
    }

    // Resilient fallback: Synthesize deterministic high-value test cases from crawled elements
    const fallbackTests = this.generateHeuristicTestCases(analysis, options);
    return {
      testCases: fallbackTests,
      source: "Deterministic Heuristic Engine (Ollama Offline)"
    };
  }

  /**
   * Analyzes a test execution failure and suggests root causes and fixes.
   */
  async analyzeFailure(input: FailureAnalysisInput): Promise<FailureAnalysisResult> {
    const prompt = buildFailureAnalysisPrompt(input);

    try {
      console.log(`[OllamaProvider] Calling Ollama for failure triage at ${this.baseUrl}...`);
      const rawResponse = await this.callOllamaApi(prompt, 60000);
      const parsedJson = this.extractAndParseJson(rawResponse);
      const validated = failureAnalysisSchema.safeParse(parsedJson);

      if (validated.success) {
        return {
          ...validated.data,
          source: `Ollama (${this.model})`
        };
      }
      console.warn(
        "[OllamaProvider] Failure analysis response did not conform to schema. Using heuristic diagnosis.",
        validated.error?.format()
      );
    } catch (err) {
      console.warn(
        `[OllamaProvider] Ollama failure analysis unreachable. Using heuristic diagnosis. Reason:`,
        err instanceof Error ? err.message : String(err)
      );
    }

    const fallbackAnalysis = this.generateHeuristicFailureAnalysis(input);
    return {
      ...fallbackAnalysis,
      source: "Deterministic Heuristic Engine (Ollama Offline)"
    };
  }

  /**
   * Sanitizes and standardizes LLM-generated test cases against minor format deviations.
   */
  private sanitizeTestCases(raw: any, defaultUrl: string): TestCaseDefinition[] {
    if (!raw || typeof raw !== "object") return [];

    const rawList = Array.isArray(raw.testCases)
      ? raw.testCases
      : Array.isArray(raw)
      ? raw
      : [];

    const sanitizedCases: TestCaseDefinition[] = [];

    const actionMap: Record<string, TestActionType> = {
      navigate: "navigate",
      goto: "navigate",
      open: "navigate",
      browse: "navigate",
      visit: "navigate",
      click: "click",
      press: "click",
      tap: "click",
      submit: "click",
      fill: "fill",
      type: "fill",
      input: "fill",
      enter: "fill",
      write: "fill",
      select: "select",
      choose: "select",
      check: "check",
      uncheck: "uncheck",
      assertvisible: "assertVisible",
      asserttext: "assertText",
      asserturl: "assertURL",
      asserttitle: "assertVisible"
    };

    for (const tc of rawList) {
      if (!tc || typeof tc !== "object") continue;

      const title = String(tc.title || "").trim();
      if (!title) continue;

      const description = tc.description ? String(tc.description).trim() : undefined;
      const expectedResult = String(
        tc.expectedResult || "Application behaves as expected with no uncaught errors."
      ).trim();

      const rawSteps = Array.isArray(tc.steps) ? tc.steps : [];
      const steps: TestStep[] = [];

      for (const st of rawSteps) {
        if (!st || typeof st !== "object") continue;

        const rawAction = String(st.action || "").toLowerCase().replace(/[^a-z]/g, "");
        const resolvedAction = actionMap[rawAction];
        if (!resolvedAction) continue;

        let target = String(st.target || "").trim();
        // If navigate has an empty target, default to the analyzed URL
        if (resolvedAction === "navigate" && !target) {
          target = defaultUrl;
        }

        if (!target) continue;

        const value =
          st.value !== undefined && st.value !== null && String(st.value).trim() !== ""
            ? String(st.value).trim()
            : undefined;

        steps.push({
          action: resolvedAction,
          target,
          ...(value !== undefined ? { value } : {})
        });
      }

      if (steps.length > 0) {
        sanitizedCases.push({
          title,
          description,
          steps,
          expectedResult
        });
      }
    }

    return sanitizedCases;
  }

  /**
   * Auto-resolves model name against installed models in Ollama
   */
  private async resolveModelName(): Promise<string> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      if (res.ok) {
        const data = (await res.json()) as { models?: Array<{ name: string }> };
        const available = data.models?.map((m) => m.name) || [];
        if (available.length > 0) {
          const match = available.find(
            (m) =>
              m === this.model ||
              m.startsWith(`${this.model}:`) ||
              this.model.startsWith(`${m}:`)
          );
          if (match) {
            this.model = match;
            return this.model;
          }
          console.log(
            `[OllamaProvider] Model "${this.model}" not found in local tags. Auto-switching to available model "${available[0]}".`
          );
          this.model = available[0];
          return this.model;
        }
      }
    } catch {}
    return this.model;
  }

  /**
   * Performs an HTTP request to Ollama with AbortController timeout.
   */
  private async callOllamaApi(
    prompt: string,
    timeoutMs: number,
    customOptions?: Record<string, any>
  ): Promise<string> {
    await this.resolveModelName();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          format: "json",
          options: {
            temperature: 0.1,
            num_ctx: 4096,
            num_predict: 1024,
            ...customOptions
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          `Ollama HTTP ${response.status} ${response.statusText}: ${errorText.slice(0, 200)}`
        );
      }

      const data = (await response.json()) as {
        response?: string;
        thinking?: string;
      };

      const text =
        (data.response && data.response.trim()) ||
        (data.thinking && data.thinking.trim()) ||
        "";

      if (!text) {
        throw new Error("Empty response envelope from Ollama");
      }

      return text;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Extracts JSON from LLM output even if wrapped with markdown ticks or reasoning tags.
   */
  private extractAndParseJson(raw: string): unknown {
    let text = raw.trim();

    // Strip <think>...</think> emitted by reasoning models like Qwen/DeepSeek
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    // Strip possible ```json ... ``` code fence
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      text = codeBlockMatch[1].trim();
    } else {
      // Find outermost JSON object { ... }
      const firstBrace = text.indexOf("{");
      const lastBrace = text.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        text = text.substring(firstBrace, lastBrace + 1);
      }
    }

    return JSON.parse(text);
  }

  /**
   * Deterministic test case synthesizer using crawled application analysis.
   * Generates up to targetCount tests and prioritizes user context if provided.
   */
  private generateHeuristicTestCases(
    analysis: StructuredAnalysis,
    options?: TestGenerationOptions
  ): TestCaseDefinition[] {
    const targetCount = options?.count ? Math.min(15, Math.max(1, options.count)) : 5;
    const userContext = options?.context?.toLowerCase().trim() || "";
    const testCases: TestCaseDefinition[] = [];

    // Test 1: Critical Landing and URL Verification
    testCases.push({
      title: "Landing Page Render & Title Verification",
      description: `Verify that ${analysis.url} renders properly with valid HTTP status and expected page title.`,
      steps: [
        { action: "navigate", target: analysis.url },
        { action: "assertURL", target: analysis.url },
        {
          action: "assertVisible",
          target: analysis.headings?.[0]?.text || "body"
        }
      ],
      expectedResult: `Application loads successfully and displays the primary heading "${analysis.headings?.[0]?.text || analysis.title}".`
    });

    // Test 2: Interactive Form Input Test (valid inputs)
    if (analysis.inputs && analysis.inputs.length > 0) {
      const inputSteps = analysis.inputs.slice(0, 4).map((inp) => {
        let sampleVal = "test-input";
        if (inp.type === "email" || inp.name?.toLowerCase().includes("email")) {
          sampleVal = "test@example.com";
        } else if (inp.type === "password" || inp.name?.toLowerCase().includes("password")) {
          sampleVal = "SecretPassword123!";
        } else if (inp.type === "number") {
          sampleVal = "10";
        }
        return {
          action: "fill" as const,
          target: inp.label || inp.placeholder || inp.name || inp.id || "input",
          value: sampleVal
        };
      });

      const submitBtn = analysis.buttons?.find(
        (b) =>
          b.type === "submit" ||
          b.text.toLowerCase().includes("submit") ||
          b.text.toLowerCase().includes("login") ||
          b.text.toLowerCase().includes("sign in") ||
          b.text.toLowerCase().includes("save")
      );

      const steps: TestStep[] = [
        { action: "navigate", target: analysis.url },
        ...inputSteps
      ];

      if (submitBtn) {
        steps.push({
          action: "click" as const,
          target: submitBtn.text || submitBtn.ariaLabel || "button"
        });
      }

      testCases.push({
        title: "Form Input & Interactive Field Entry",
        description: "Verify that user can type valid data into interactive input fields without validation crashes.",
        steps,
        expectedResult: "Form fields accept user input and submit action executes without UI error."
      });

      // Test 3: Form Negative Test - Empty Required Input Submission
      const requiredInput = analysis.inputs.find((i) => i.required);
      if (requiredInput && submitBtn) {
        testCases.push({
          title: "Form Validation: Required Field Enforcement",
          description: "Verify that submitting the form without filling required inputs is prevented or prompts validation error.",
          steps: [
            { action: "navigate", target: analysis.url },
            { action: "click", target: submitBtn.text || submitBtn.ariaLabel || "button" },
            { action: "assertURL", target: analysis.url }
          ],
          expectedResult: "Form submission is halted and user remains on current page or sees validation prompt."
        });
      }
    }

    // Test 4-6: Multiple Discovered Routes Navigation
    if (analysis.discoveredRoutes && analysis.discoveredRoutes.length > 0) {
      const routesToTest = analysis.discoveredRoutes.slice(0, 4);
      for (const route of routesToTest) {
        testCases.push({
          title: `Internal Route Navigation: ${route}`,
          description: `Verify that navigating to the internal route ${route} loads the designated page view.`,
          steps: [
            { action: "navigate", target: analysis.url },
            { action: "click", target: route },
            { action: "assertURL", target: route }
          ],
          expectedResult: `User is successfully routed to ${route} and the page contents are rendered.`
        });
      }
    }

    // Test 7-10: Multiple Interactive Button Actions
    if (analysis.buttons && analysis.buttons.length > 0) {
      const distinctButtons = analysis.buttons
        .filter((b) => b.text && b.text.trim().length > 1)
        .slice(0, 5);

      for (const button of distinctButtons) {
        const btnText = button.text.trim();
        // Avoid duplicate title
        if (testCases.some((tc) => tc.title.includes(`"${btnText}"`))) continue;

        testCases.push({
          title: `Action Button Trigger: "${btnText}"`,
          description: `Verify clicking the "${btnText}" button triggers expected UI interaction without throwing exceptions.`,
          steps: [
            { action: "navigate", target: analysis.url },
            { action: "assertVisible", target: btnText },
            { action: "click", target: btnText }
          ],
          expectedResult: `Button "${btnText}" responds to click event and application state remains stable.`
        });
      }
    }

    // Test: Heading & Content Verification
    if (analysis.headings && analysis.headings.length > 1) {
      const secondaryHeading = analysis.headings[1].text.trim();
      testCases.push({
        title: `Content Hierarchy: "${secondaryHeading.slice(0, 40)}"`,
        description: `Verify that secondary content section "${secondaryHeading}" is visible on the page.`,
        steps: [
          { action: "navigate", target: analysis.url },
          { action: "assertVisible", target: secondaryHeading }
        ],
        expectedResult: `Page renders secondary section heading "${secondaryHeading}".`
      });
    }

    // Prioritize test cases matching user context keywords
    if (userContext) {
      const keywords = userContext.split(/\s+/).filter((k) => k.length > 2);
      testCases.sort((a, b) => {
        const aMatch = keywords.some(
          (k) =>
            a.title.toLowerCase().includes(k) ||
            a.description?.toLowerCase().includes(k) ||
            a.steps.some((s) => s.target.toLowerCase().includes(k))
        );
        const bMatch = keywords.some(
          (k) =>
            b.title.toLowerCase().includes(k) ||
            b.description?.toLowerCase().includes(k) ||
            b.steps.some((s) => s.target.toLowerCase().includes(k))
        );
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }

    return testCases.slice(0, targetCount);
  }

  /**
   * Deterministic failure diagnosis when Ollama service is unavailable.
   */
  private generateHeuristicFailureAnalysis(
    input: FailureAnalysisInput
  ): FailureAnalysisResult {
    const err = input.errorMessage.toLowerCase();

    if (err.includes("timeout") && (err.includes("waiting for locator") || err.includes("waiting for selector") || err.includes("getby"))) {
      return {
        rootCause: "Target Element Locator Timeout",
        explanation: `The browser timed out waiting for the target element to appear in the DOM. The selector or accessible name may have changed or the element rendered after an asynchronous delay.`,
        suggestedFix: `Check that the target locator matches the active DOM element, or verify the page has fully loaded before executing the action.`,
        confidence: 0.88
      };
    }

    if (err.includes("net::err") || err.includes("econnrefused") || err.includes("enotfound")) {
      return {
        rootCause: "Target Web Application Unreachable",
        explanation: `Playwright encountered a network connection error when trying to reach ${input.targetUrl}. The target server may be down, misconfigured, or refusing connections.`,
        suggestedFix: `Verify that the target server is active and accessible from the testing environment.`,
        confidence: 0.95
      };
    }

    if (err.includes("navigating to") && err.includes("timeout")) {
      return {
        rootCause: "Page Navigation Timeout",
        explanation: `The page took longer than the allocated timeout to reach the required load state. Heavy assets or blocking scripts may be slowing down the initial response.`,
        suggestedFix: `Optimize page load performance or configure Playwright navigation timeout to allow longer hydration times.`,
        confidence: 0.82
      };
    }

    if (err.includes("expected") && (err.includes("received") || err.includes("to have text") || err.includes("to have url"))) {
      return {
        rootCause: "Assertion Mismatch",
        explanation: `The observed application state did not match the expected assertion value. Either the feature behavior changed or the expected value in the test definition was inaccurate.`,
        suggestedFix: `Inspect the actual value returned by the application and update the test expectation if the new behavior is intended.`,
        confidence: 0.9
      };
    }

    return {
      rootCause: "Test Execution Step Interruption",
      explanation: `The test failed with the following message: ${input.errorMessage.slice(0, 150)}`,
      suggestedFix: "Inspect application logs and browser screenshots to confirm UI state at the moment of failure.",
      confidence: 0.7
    };
  }
}
