import { StructuredAnalysis } from "../../../types/analysis.types";
import { TestGenerationOptions } from "../../../types/test-case.types";

export function buildTestGenerationPrompt(
  analysis: StructuredAnalysis,
  options?: TestGenerationOptions
): string {
  const targetCount = options?.count ? Math.min(15, Math.max(1, options.count)) : 5;
  const userContext = options?.context?.trim();

  // Compress analysis to avoid overwhelming context length while providing enough interactive elements
  const summary = {
    url: analysis.url,
    title: analysis.title,
    description: analysis.description,
    routes: analysis.discoveredRoutes?.slice(0, 10),
    headings: analysis.headings?.slice(0, 8).map((h) => h.text.trim()).filter(Boolean),
    buttons: analysis.buttons?.slice(0, 12).map((b) => b.text.trim()).filter(Boolean),
    inputs: analysis.inputs?.slice(0, 10).map((i) => ({
      type: i.type,
      name: i.name || i.placeholder,
      label: i.label || i.placeholder
    })),
    forms: analysis.forms?.slice(0, 3).map((f) => ({
      name: f.name,
      inputs: f.inputNames
    }))
  };

  const contextInstruction = userContext
    ? `\nUSER TESTING CONTEXT & FOCUS INSTRUCTIONS:\n"""\n${userContext}\n"""\nIMPORTANT: Prioritize the user's focus instructions above. Tailor the test cases, actions, and assertions to test the specific user journey, feature, or scenarios requested.\n`
    : "";

  return `You are an expert QA automation engineer generating structured end-to-end test cases for a web application.
${contextInstruction}
Target Web Application Telemetry:
${JSON.stringify(summary, null, 2)}

Requirements:
1. Generate realistic, high-value functional test cases based on the discovered interactive elements.
2. Prioritize:${userContext ? "\n   - The user's specified testing context and focus area (highest priority)" : ""}
   - Navigation and critical page rendering verification
   - Interactive forms, input validation, and boundary conditions
   - Button actions and interactive user workflows
   - Positive scenarios and edge-cases (e.g. empty required inputs, invalid formats)
3. Do NOT invent elements or routes not observed in the analysis.
4. For login or authentication forms, use sample placeholders like "test@example.com" or "Password123!".
5. You MUST output ONLY valid JSON matching this exact schema:
{
  "testCases": [
    {
      "title": "Clear concise test title",
      "description": "Short explanation of the test objective",
      "steps": [
        {
          "action": "navigate" | "click" | "fill" | "select" | "check" | "uncheck" | "assertVisible" | "assertText" | "assertURL",
          "target": "Element text, placeholder, aria-label, role, or CSS selector",
          "value": "Optional text to type or option to select"
        }
      ],
      "expectedResult": "Clear expected outcome upon test completion"
    }
  ]
}

STRICT CONSTRAINTS:
- Allowed actions ONLY: "navigate", "click", "fill", "select", "check", "uncheck", "assertVisible", "assertText", "assertURL".
- NEVER output JavaScript code, Playwright code, eval(), or markdown blocks.
- Generate exactly ${targetCount} distinct, high-value functional test cases.
- Respond with pure JSON only.`;
}
