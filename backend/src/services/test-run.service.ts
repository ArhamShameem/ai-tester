import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { enqueueTestRunJob } from "../queues/test.queue";

export class TestRunService {
  /**
   * Initiates a new asynchronous test run.
   * Returns immediately with PENDING status.
   */
  static async startTestRun(userId: string, projectId: string) {
    // 1. Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    // 2. Ensure project has test cases
    const testCaseCount = await prisma.testCase.count({
      where: { projectId }
    });

    if (testCaseCount === 0) {
      throw new AppError(
        "No test cases found for this project. Please generate test cases before starting a test run.",
        400
      );
    }

    // 3. Create TestRun record with PENDING state
    const testRun = await prisma.testRun.create({
      data: {
        projectId,
        status: "PENDING"
      }
    });

    // 4. Enqueue background execution job
    await enqueueTestRunJob(testRun.id, projectId);

    return {
      testRun: {
        id: testRun.id,
        status: testRun.status,
        projectId: testRun.projectId,
        createdAt: testRun.createdAt,
        totalTests: testCaseCount
      }
    };
  }

  /**
   * Retrieves test runs history for a project with pass/fail summary aggregates.
   */
  static async getTestRunsForProject(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    const runs = await prisma.testRun.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        results: {
          select: {
            id: true,
            status: true,
            duration: true
          }
        }
      }
    });

    const formattedRuns = runs.map((run) => {
      const total = run.results.length;
      const passed = run.results.filter((r) => r.status === "PASSED").length;
      const failed = run.results.filter((r) => r.status === "FAILED").length;
      const skipped = run.results.filter((r) => r.status === "SKIPPED").length;
      const totalDuration = run.results.reduce(
        (sum, r) => sum + (r.duration || 0),
        0
      );

      return {
        id: run.id,
        projectId: run.projectId,
        status: run.status,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        createdAt: run.createdAt,
        summary: {
          total,
          passed,
          failed,
          skipped,
          durationMs: totalDuration
        }
      };
    });

    return formattedRuns;
  }

  /**
   * Retrieves single test run details including all individual test results and failure analysis.
   */
  static async getTestRunById(userId: string, testRunId: string) {
    const testRun = await prisma.testRun.findFirst({
      where: {
        id: testRunId,
        project: { userId }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            url: true
          }
        },
        results: {
          orderBy: { createdAt: "asc" },
          include: {
            testCase: {
              select: {
                id: true,
                title: true,
                description: true,
                steps: true,
                expectedResult: true
              }
            }
          }
        }
      }
    });

    if (!testRun) {
      throw new AppError("Test run not found", 404);
    }

    const total = testRun.results.length;
    const passed = testRun.results.filter((r) => r.status === "PASSED").length;
    const failed = testRun.results.filter((r) => r.status === "FAILED").length;
    const skipped = testRun.results.filter((r) => r.status === "SKIPPED").length;
    const totalDuration = testRun.results.reduce(
      (sum, r) => sum + (r.duration || 0),
      0
    );

    return {
      id: testRun.id,
      projectId: testRun.projectId,
      status: testRun.status,
      startedAt: testRun.startedAt,
      completedAt: testRun.completedAt,
      createdAt: testRun.createdAt,
      project: testRun.project,
      summary: {
        total,
        passed,
        failed,
        skipped,
        durationMs: totalDuration
      },
      results: testRun.results
    };
  }

  /**
   * Retrieves all test results for a specific test run with ownership verification.
   */
  static async getTestResults(userId: string, testRunId: string) {
    const testRun = await prisma.testRun.findFirst({
      where: {
        id: testRunId,
        project: { userId }
      }
    });

    if (!testRun) {
      throw new AppError("Test run not found", 404);
    }

    const results = await prisma.testResult.findMany({
      where: { testRunId },
      orderBy: { createdAt: "asc" },
      include: {
        testCase: true
      }
    });

    return results;
  }
}
