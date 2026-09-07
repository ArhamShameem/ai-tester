import { StructuredAnalysis } from "../../../types/analysis.types";

export function buildTestGenerationPrompt(analysis: StructuredAnalysis): string {
  // Compress analysis to avoid overwhelming context length
  const summary = {
    url: analysis.url,
    title: analysis.title,
    description: analysis.description,
    routes: analysis.discoveredRoutes?.slice(0, 6),
    headings: analysis.headings?.slice(0, 6).map((h) => h.text.trim()).filter(Boolean),
    buttons: analysis.buttons?.slice(0, 8).map((b) => b.text.trim()).filter(Boolean),
    inputs: analysis.inputs?.slice(0, 6).map((i) => ({
      type: i.type,
      name: i.name || i.placeholder,
      label: i.label || i.placeholder
    })),
    forms: analysis.forms?.slice(0, 2).map((f) => ({
      name: f.name,
      inputs: f.inputNames
    }))
  };

  return `You are an expert QA automation engineer generating structured end-to-end test cases for a web application.

Target Web Application Analysis:
${JSON.stringify(summary, null, 2)}

Requirements:
1. Generate realistic, high-value functional test cases based on the discovered interactive elements.
2. Prioritize:
   - Navigation and critical page rendering verification
   - Interactive forms and input validation
   - Button actions and interactive workflows
   - Positive scenarios and edge-cases (e.g. empty required inputs)
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
- Generate between 2 and 4 distinct, high-value functional test cases.
- Respond with pure JSON only.`;
}
