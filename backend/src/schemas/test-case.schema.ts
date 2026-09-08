import { z } from "zod";

export const testActionEnum = z.enum([
  "navigate",
  "click",
  "fill",
  "select",
  "check",
  "uncheck",
  "assertVisible",
  "assertText",
  "assertURL"
]);

export const testStepSchema = z.object({
  action: testActionEnum,
  target: z.string().min(1, "Target selector or text is required"),
  value: z.string().optional()
});

export const testCaseDefinitionSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  steps: z.array(testStepSchema).min(1, "At least one step is required"),
  expectedResult: z.string().min(1, "Expected result is required")
});

export const generatedTestCasesSchema = z.object({
  testCases: z.array(testCaseDefinitionSchema).min(1, "At least one test case must be generated")
});

export const failureAnalysisSchema = z.object({
  rootCause: z.string().min(1, "Root cause is required"),
  explanation: z.string().min(1, "Explanation is required"),
  suggestedFix: z.string().min(1, "Suggested fix is required"),
  confidence: z.number().min(0).max(1)
});

export const createManualTestCaseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  steps: z.array(testStepSchema).min(1, "At least one step is required"),
  expectedResult: z.string().min(1, "Expected result is required")
});

export const updateTestCaseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  steps: z.array(testStepSchema).min(1).optional(),
  expectedResult: z.string().min(1).optional()
});

export const generateTestCasesRequestSchema = z.object({
  context: z.string().max(2000).optional(),
  count: z.number().int().min(1).max(15).optional(),
  replaceExisting: z.boolean().optional()
});

