export type TestActionType =
  | "navigate"
  | "click"
  | "fill"
  | "select"
  | "check"
  | "uncheck"
  | "assertVisible"
  | "assertText"
  | "assertURL";

export interface TestStep {
  action: TestActionType;
  target: string;
  value?: string;
}

export interface TestCase {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  steps: TestStep[];
  expectedResult: string;
  createdAt: string;
}

export interface GenerateTestCasesOptions {
  context?: string;
  count?: number;
  replaceExisting?: boolean;
}

export interface GenerateTestCasesResponse {
  message: string;
  source?: string;
  testCases: TestCase[];
  createdCount: number;
}

export interface TestCasesResponse {
  testCases: TestCase[];
}

export interface TestCaseResponse {
  testCase: TestCase;
}
