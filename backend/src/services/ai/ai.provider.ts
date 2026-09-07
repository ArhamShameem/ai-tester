import { StructuredAnalysis } from "../../types/analysis.types";
import {
  GeneratedTestCasesOutput,
  FailureAnalysisInput,
  FailureAnalysisResult
} from "../../types/test-case.types";

export interface AIProvider {
  name: string;
  generateTestCases(analysis: StructuredAnalysis): Promise<GeneratedTestCasesOutput>;
  analyzeFailure(input: FailureAnalysisInput): Promise<FailureAnalysisResult>;
}
