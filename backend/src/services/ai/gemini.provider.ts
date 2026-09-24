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

export class GeminiProvider implements AIProvider {
  public readonly name = "Gemini";
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
    this.model = model || process.env.GEMINI_MODEL || "gemini-3.8-flash";
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta";
  }

  /**
   * Generates structured functional test cases from application analysis with optional user context.
   */
  async generateTestCases(
    analysis: StructuredAnalysis,
    options?: TestGenerationOptions
  ): Promise<GeneratedTestCasesOutput> {
    if (!this.apiKey) {
      console.warn(
        "[GeminiProvider] GEMINI_API_KEY is not configured in environment. Falling back to deterministic heuristic generator."
      );
      const fallbackTests = this.generateHeuristicTestCases(analysis, options);
      return {
        testCases: fallbackTests,
        source: "Deterministic Heuristic Engine (Gemini API Key Missing)"
      };
    }

    const prompt = buildTestGenerationPrompt(analysis, options);
    const targetCount = options?.count ? Math.min(15, Math.max(1, options.count)) : 5;

    try {
      console.log(
        `[GeminiProvider] Calling Google Gemini (${this.model}) for ${targetCount} tests${
          options?.context ? ` with context: "${options.context.slice(0, 50)}..."` : ""
        }...`
      );

      const rawResponse = await this.callGeminiApi(prompt, 45000);
      const parsedJson = this.extractAndParseJson(rawResponse);
      const sanitizedCases = this.sanitizeTestCases(parsedJson, analysis.url);
      const validated = generatedTestCasesSchema.safeParse({ testCases: sanitizedCases });

      if (validated.success && validated.data.testCases.length > 0) {
        console.log(
          `[GeminiProvider] Successfully generated ${validated.data.testCases.length} tests using Gemini (${this.model})`
        );
        return {
          testCases: validated.data.testCases,
          source: `Google Gemini (${this.model})`
        };
      }

      console.warn(
        "[GeminiProvider] Response did not conform to test case schema after sanitization. Falling back to heuristic generator.",
        JSON.stringify(validated.error?.issues, null, 2)
      );
    } catch (err) {
      console.warn(
        `[GeminiProvider] Gemini API call failed (model: ${this.model}). Using heuristic test generator fallback. Reason:`,
        err instanceof Error ? err.message : String(err)
      );
    }

    // Resilient fallback: Synthesize deterministic high-value test cases from crawled elements
    const fallbackTests = this.generateHeuristicTestCases(analysis, options);
    return {
      testCases: fallbackTests,
      source: "Deterministic Heuristic Engine (Gemini Offline)"
    };
  }

  /**
   * Analyzes a test execution failure and suggests root causes and fixes.
   */
  async analyzeFailure(input: FailureAnalysisInput): Promise<FailureAnalysisResult> {
    if (!this.apiKey) {
      console.warn(
        "[GeminiProvider] GEMINI_API_KEY is not configured in environment. Using heuristic failure diagnosis."
      );
      const fallbackAnalysis = this.generateHeuristicFailureAnalysis(input);
      return {
        ...fallbackAnalysis,
        source: "Deterministic Heuristic Engine (Gemini API Key Missing)"
      };
    }

    const prompt = buildFailureAnalysisPrompt(input);

    try {
      console.log(`[GeminiProvider] Calling Google Gemini (${this.model}) for failure triage...`);
      const rawResponse = await this.callGeminiApi(prompt, 30000);
      const parsedJson = this.extractAndParseJson(rawResponse);
      const validated = failureAnalysisSchema.safeParse(parsedJson);

      if (validated.success) {
        return {
          ...validated.data,
          source: `Google Gemini (${this.model})`
        };
      }

      console.warn(
        "[GeminiProvider] Failure analysis response did not conform to schema. Using heuristic diagnosis.",
        validated.error?.format()
      );
    } catch (err) {
      console.warn(
        `[GeminiProvider] Gemini failure analysis failed. Using heuristic diagnosis. Reason:`,
        err instanceof Error ? err.message : String(err)
      );
    }

    const fallbackAnalysis = this.generateHeuristicFailureAnalysis(input);
    return {
      ...fallbackAnalysis,
      source: "Deterministic Heuristic Engine (Gemini Offline)"
    };
  }

  /**
   * Calls the Google Gemini REST generateContent API with application/json response format and backup model failover.
   */
  private async callGeminiApi(prompt: string, timeoutMs: number = 45000): Promise<string> {
    const modelsToTry = [
      this.model,
      this.model === "gemini-3.8-flash" ? "gemini-3.6-flash" : "gemini-3.8-flash"
    ];

    let lastError: Error | null = null;

    for (const currentModel of modelsToTry) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const url = `${this.baseUrl}/models/${encodeURIComponent(currentModel)}:generateContent?key=${encodeURIComponent(
        this.apiKey
      )}`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json"
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          const isRetryable = response.status === 503 || response.status === 429;
          const err = new Error(
            `Gemini API HTTP ${response.status} ${response.statusText}: ${errorText.slice(0, 300)}`
          );
          lastError = err;
          if (isRetryable && currentModel !== modelsToTry[modelsToTry.length - 1]) {
            console.warn(
              `[GeminiProvider] ${currentModel} returned ${response.status}. Retrying with backup model ${modelsToTry[1]}...`
            );
            continue;
          }
          throw err;
        }

        const data = (await response.json()) as {
          candidates?: Array<{
            content?: {
              parts?: Array<{ text?: string }>;
            };
          }>;
        };

        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

        if (!candidateText) {
          throw new Error("Empty candidate text in Gemini API response");
        }

        return candidateText;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (currentModel !== modelsToTry[modelsToTry.length - 1]) {
          continue;
        }
        throw lastError;
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw lastError || new Error("Gemini API call failed");
  }

  /**
   * Extracts JSON from LLM output even if wrapped with markdown ticks or reasoning tags.
   */
  private extractAndParseJson(raw: string): unknown {
    let text = raw.trim();

    // Strip <think>...</think> if present
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
   * Deterministic test case synthesizer using crawled application analysis.
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
      expectedResult: `Application loads successfully and displays the primary heading "${
        analysis.headings?.[0]?.text || analysis.title
      }".`
    });

    // Test 2: Interactive Form Input Test
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
        description:
          "Verify that user can type valid data into interactive input fields without validation crashes.",
        steps,
        expectedResult: "Form fields accept user input and submit action executes without UI error."
      });

      // Test 3: Form Negative Test - Empty Required Input Submission
      const requiredInput = analysis.inputs.find((i) => i.required);
      if (requiredInput && submitBtn) {
        testCases.push({
          title: "Form Validation: Required Field Enforcement",
          description:
            "Verify that submitting the form without filling required inputs is prevented or prompts validation error.",
          steps: [
            { action: "navigate", target: analysis.url },
            { action: "click", target: submitBtn.text || submitBtn.ariaLabel || "button" },
            { action: "assertURL", target: analysis.url }
          ],
          expectedResult:
            "Form submission is halted and user remains on current page or sees validation prompt."
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

    // Context Prioritization
    if (userContext) {
      const keywords = userContext
        .split(/\W+/)
        .map((k) => k.trim())
        .filter((k) => k.length >= 3);

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
   * Deterministic failure diagnosis when Gemini service is unavailable.
   */
  private generateHeuristicFailureAnalysis(input: FailureAnalysisInput): FailureAnalysisResult {
    const err = input.errorMessage.toLowerCase();

    if (
      err.includes("timeout") &&
      (err.includes("waiting for locator") ||
        err.includes("waiting for selector") ||
        err.includes("getby"))
    ) {
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

    if (
      err.includes("expected") &&
      (err.includes("received") || err.includes("to have text") || err.includes("to have url"))
    ) {
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
      suggestedFix:
        "Inspect application logs and browser screenshots to confirm UI state at the moment of failure.",
      confidence: 0.7
    };
  }
}
