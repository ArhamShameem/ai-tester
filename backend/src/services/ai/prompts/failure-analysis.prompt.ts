import { FailureAnalysisInput } from "../../../types/test-case.types";

export function buildFailureAnalysisPrompt(input: FailureAnalysisInput): string {
  const stepsText = input.steps
    .map(
      (s, idx) =>
        `${idx + 1}. [${s.action}] target: "${s.target}"${s.value ? ` value: "${s.value}"` : ""}${
          input.failedStepIndex === idx ? " <--- FAILED HERE" : ""
        }`
    )
    .join("\n");

  return `You are a Principal Software Quality Engineer analyzing a failed Playwright automated browser test.

Test Information:
- Title: ${input.testTitle}
- Description: ${input.testDescription || "None"}
- Target URL: ${input.targetUrl}
- Expected Result: ${input.expectedResult}

Execution Steps:
${stepsText}

Playwright Error Output:
${input.errorMessage}

Your task is to diagnose the root cause of this failure and suggest an actionable fix.
Distinguish between:
1. Application Bug (server 500, broken UI, regression)
2. Selector/Locator Issue (element renamed, wrong placeholder, dynamic ID)
3. Timing/Waiting Issue (page not loaded, element animating, network delay)
4. Environment/Network Issue (target server unreachable, DNS failure)
5. Test Script Definition Issue (invalid action or impossible expectation)

STRICT OUTPUT FORMAT:
Output ONLY valid JSON matching this schema:
{
  "rootCause": "Short title of likely root cause (e.g., Target button locator not found before timeout)",
  "explanation": "Detailed explanation of why the test step failed and what occurred in the browser",
  "suggestedFix": "Precise recommendation on how to fix the web application or adjust the test selector/timeout",
  "confidence": 0.85
}

Confidence must be a number between 0.0 and 1.0. If evidence is ambiguous, use a lower confidence.
Return pure JSON only.`;
}
