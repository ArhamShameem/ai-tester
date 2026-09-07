import { TestCase } from "./test-case";

export type TestRunStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
export type TestResultStatus = "PASSED" | "FAILED" | "SKIPPED";

export interface FailureAnalysis {
  rootCause: string;
  explanation: string;
  suggestedFix: string;
  confidence: number;
  source?: string;
}

export interface TestResult {
  id: string;
  testRunId: string;
  testCaseId: string;
  status: TestResultStatus;
  error?: string | null;
  screenshot?: string | null;
  duration?: number | null;
  failureAnalysis?: FailureAnalysis | null;
  createdAt: string;
  testCase?: TestCase;
}

export interface TestRunSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
}

export interface TestRun {
  id: string;
  projectId: string;
  status: TestRunStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  summary?: TestRunSummary;
  results?: TestResult[];
  project?: {
    id: string;
    name: string;
    url: string;
  };
}

export interface StartTestRunResponse {
  testRun: {
    id: string;
    status: TestRunStatus;
    projectId: string;
    createdAt: string;
    totalTests: number;
  };
}

export interface TestRunsResponse {
  testRuns: TestRun[];
}

export interface TestRunResponse {
  testRun: TestRun;
}

export interface TestResultsResponse {
  results: TestResult[];
}
