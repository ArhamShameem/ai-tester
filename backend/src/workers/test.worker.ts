import { Worker, Job } from "bullmq";
import { getBullMQConnectionOptions } from "../lib/redis";
import {
  TEST_RUN_QUEUE_NAME,
  TestRunJobData
} from "../queues/test.queue";
import { TestExecutionService } from "../services/test-execution.service";

export function createTestWorker(): Worker<TestRunJobData> | null {
  const concurrency = parseInt(process.env.TEST_WORKER_CONCURRENCY || "1", 10);
  const connection = getBullMQConnectionOptions();

  const worker = new Worker<TestRunJobData>(
    TEST_RUN_QUEUE_NAME,
    async (job: Job<TestRunJobData>) => {
      const { testRunId, projectId } = job.data;
      console.log(
        `[TestWorker] Processing Job ${job.id} for TestRun ${testRunId}`
      );
      await TestExecutionService.processTestRun(testRunId, projectId);
    },
    {
      connection,
      concurrency
    }
  );

  worker.on("completed", (job) => {
    console.log(`[TestWorker] Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[TestWorker] Job ${job?.id} failed with error:`, err);
  });

  worker.on("error", (err) => {
    // Suppress unhandled redis connection drops
    console.warn(`[TestWorker] Worker connection issue:`, err.message);
  });

  return worker;
}
