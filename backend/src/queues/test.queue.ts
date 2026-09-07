import { Queue } from "bullmq";
import { getBullMQConnectionOptions, checkRedisHealth } from "../lib/redis";
import { TestExecutionService } from "../services/test-execution.service";

export interface TestRunJobData {
  testRunId: string;
  projectId: string;
}

export interface FailureAnalysisJobData {
  testResultId: string;
}

const connectionOptions = getBullMQConnectionOptions();

export const TEST_RUN_QUEUE_NAME = "test-runs";
export const FAILURE_ANALYSIS_QUEUE_NAME = "failure-analysis";

export const testRunQueue = new Queue<TestRunJobData, void, string>(
  TEST_RUN_QUEUE_NAME,
  {
    connection: connectionOptions,
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 3000
      },
      removeOnComplete: true,
      removeOnFail: false
    }
  }
);

export const failureAnalysisQueue = new Queue<FailureAnalysisJobData, void, string>(
  FAILURE_ANALYSIS_QUEUE_NAME,
  {
    connection: connectionOptions,
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 2000
      },
      removeOnComplete: true,
      removeOnFail: false
    }
  }
);

// Suppress unhandled queue connection errors if Redis server is not started locally
testRunQueue.on("error", () => {});
failureAnalysisQueue.on("error", () => {});

/**
 * Dispatches a test run job to BullMQ if Redis is active,
 * or falls back to background asynchronous execution if Redis is offline.
 */
export async function enqueueTestRunJob(
  testRunId: string,
  projectId: string
): Promise<void> {
  const isRedisOk = await checkRedisHealth();

  if (isRedisOk) {
    try {
      await testRunQueue.add("execute-test-run", { testRunId, projectId });
      console.log(`[Queue] Test run ${testRunId} enqueued to BullMQ`);
      return;
    } catch (err) {
      console.warn(
        `[Queue] Failed to add job to BullMQ despite ping. Falling back to background runner.`,
        err
      );
    }
  } else {
    console.log(
      `[Queue] Redis offline or not configured. Running test run ${testRunId} asynchronously in-process.`
    );
  }

  // Fallback: Run asynchronously in background without blocking HTTP request
  setImmediate(() => {
    TestExecutionService.processTestRun(testRunId, projectId).catch((err) => {
      console.error(
        `[QueueFallback] Background test run ${testRunId} execution error:`,
        err
      );
    });
  });
}

/**
 * Dispatches a failure analysis job to BullMQ if Redis is active,
 * or executes asynchronously in-process.
 */
export async function enqueueFailureAnalysisJob(
  testResultId: string
): Promise<void> {
  const isRedisOk = await checkRedisHealth();

  if (isRedisOk) {
    try {
      await failureAnalysisQueue.add("analyze-failure", { testResultId });
      console.log(
        `[Queue] Failure analysis for ${testResultId} enqueued to BullMQ`
      );
      return;
    } catch (err) {
      console.warn(
        `[Queue] Failed to add failure analysis to BullMQ. Falling back to background runner.`,
        err
      );
    }
  }

  // Fallback
  setImmediate(() => {
    TestExecutionService.processFailureAnalysis(testResultId).catch((err) => {
      console.error(
        `[QueueFallback] Background failure analysis error for ${testResultId}:`,
        err
      );
    });
  });
}
