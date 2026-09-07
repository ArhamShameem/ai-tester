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

export interface TestCaseDefinition {
  title: string;
  description?: string;
  steps: TestStep[];
  expectedResult: string;
}

export interface GeneratedTestCasesOutput {
  testCases: TestCaseDefinition[];
  source: string;
}

export interface FailureAnalysisInput {
  testTitle: string;
  testDescription?: string | null;
  steps: TestStep[];
  expectedResult: string;
  errorMessage: string;
  targetUrl: string;
  failedStepIndex?: number;
  screenshotPath?: string | null;
}

export interface FailureAnalysisResult {
  rootCause: string;
  explanation: string;
  suggestedFix: string;
  confidence: number;
  source?: string;
}
