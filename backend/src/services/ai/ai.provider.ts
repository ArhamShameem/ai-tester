import { StructuredAnalysis } from "../../types/analysis.types";
import {
  GeneratedTestCasesOutput,
  FailureAnalysisInput,
  FailureAnalysisResult,
  TestGenerationOptions
} from "../../types/test-case.types";

export interface AIProvider {
  name: string;
  generateTestCases(
    analysis: StructuredAnalysis,
    options?: TestGenerationOptions
  ): Promise<GeneratedTestCasesOutput>;
  analyzeFailure(input: FailureAnalysisInput): Promise<FailureAnalysisResult>;
}
