import prisma from "../lib/prisma";
import { TestExecutorService } from "./browser/test-executor.service";
import { AIService } from "./ai/ai.service";
import { TestStep, FailureAnalysisInput } from "../types/test-case.types";
import { Prisma } from "@prisma/client";
import { enqueueFailureAnalysisJob } from "../queues/test.queue";

export class TestExecutionService {
  /**
   * Orchestrates the complete execution of a test run across all its test cases.
   */
  static async processTestRun(testRunId: string, projectId: string): Promise<void> {
    console.log(`[TestExecutionService] Starting test run ${testRunId} for project ${projectId}`);

    // 1. Mark test run as RUNNING
    await prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: "RUNNING",
        startedAt: new Date()
      }
    });

    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      // 2. Fetch all test cases for this project
      const testCases = await prisma.testCase.findMany({
        where: { projectId },
        orderBy: { createdAt: "asc" }
      });

      if (testCases.length === 0) {
        await prisma.testRun.update({
          where: { id: testRunId },
          data: {
            status: "COMPLETED",
            completedAt: new Date()
          }
        });
        return;
      }

      // 3. Sequentially execute each test case (conservative concurrency)
      for (const testCase of testCases) {
        // Idempotency: check if result already exists for this run & test case
        let existingResult = await prisma.testResult.findUnique({
          where: {
            testRunId_testCaseId: {
              testRunId,
              testCaseId: testCase.id
            }
          }
        });

        if (existingResult && existingResult.status !== "FAILED") {
          // Already successfully executed, skip re-execution
          continue;
        }

        // Create or get result placeholder
        const resultRecord =
          existingResult ||
          (await prisma.testResult.create({
            data: {
              testRunId,
              testCaseId: testCase.id,
              status: "SKIPPED"
            }
          }));

        const steps = (testCase.steps as unknown as TestStep[]) || [];

        // Execute via controlled Playwright engine
        const outcome = await TestExecutorService.executeTestCase(
          projectId,
          testRunId,
          resultRecord.id,
          project.url,
          steps
        );

        // Update database with outcome
        const updatedResult = await prisma.testResult.update({
          where: { id: resultRecord.id },
          data: {
            status: outcome.status,
            error: outcome.error || null,
            screenshot: outcome.screenshot || null,
            duration: outcome.durationMs
          }
        });

        // 4. Asynchronously enqueue failure analysis if test failed
        if (outcome.status === "FAILED") {
          try {
            await enqueueFailureAnalysisJob(updatedResult.id);
          } catch (qErr) {
            console.warn(
              `[TestExecutionService] Failed to queue failure analysis for ${updatedResult.id}:`,
              qErr
            );
          }
        }
      }

      // 5. Mark test run as COMPLETED
      await prisma.testRun.update({
        where: { id: testRunId },
        data: {
          status: "COMPLETED",
          completedAt: new Date()
        }
      });

      console.log(`[TestExecutionService] Completed test run ${testRunId}`);
    } catch (err) {
      console.error(`[TestExecutionService] Unrecoverable error in test run ${testRunId}:`, err);
      await prisma.testRun.update({
        where: { id: testRunId },
        data: {
          status: "FAILED",
          completedAt: new Date()
        }
      });
    }
  }

  /**
   * Asynchronously analyzes a failed test result with AI
   */
  static async processFailureAnalysis(testResultId: string): Promise<void> {
    console.log(`[TestExecutionService] Analyzing failure for test result ${testResultId}`);

    const testResult = await prisma.testResult.findUnique({
      where: { id: testResultId },
      include: {
        testCase: true,
        testRun: {
          include: {
            project: true
          }
        }
      }
    });

    if (!testResult || testResult.status !== "FAILED" || !testResult.error) {
      return;
    }

    if (testResult.failureAnalysis) {
      // Already analyzed
      return;
    }

    const input: FailureAnalysisInput = {
      testTitle: testResult.testCase.title,
      testDescription: testResult.testCase.description,
      steps: (testResult.testCase.steps as unknown as TestStep[]) || [],
      expectedResult: testResult.testCase.expectedResult,
      errorMessage: testResult.error,
      targetUrl: testResult.testRun.project.url,
      screenshotPath: testResult.screenshot
    };

    const aiProvider = AIService.getProvider();
    const analysis = await aiProvider.analyzeFailure(input);

    await prisma.testResult.update({
      where: { id: testResultId },
      data: {
        failureAnalysis: analysis as unknown as Prisma.InputJsonValue
      }
    });

    console.log(
      `[TestExecutionService] Completed failure analysis for ${testResultId}: "${analysis.rootCause}"`
    );
  }
}
