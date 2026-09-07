import { Worker, Job } from "bullmq";
import { getBullMQConnectionOptions } from "../lib/redis";
import {
  FAILURE_ANALYSIS_QUEUE_NAME,
  FailureAnalysisJobData
} from "../queues/test.queue";
import { TestExecutionService } from "../services/test-execution.service";

export function createFailureAnalysisWorker(): Worker<FailureAnalysisJobData> | null {
  const connection = getBullMQConnectionOptions();

  const worker = new Worker<FailureAnalysisJobData>(
    FAILURE_ANALYSIS_QUEUE_NAME,
    async (job: Job<FailureAnalysisJobData>) => {
      const { testResultId } = job.data;
      console.log(
        `[FailureWorker] Processing AI Failure Analysis for Result ${testResultId}`
      );
      await TestExecutionService.processFailureAnalysis(testResultId);
    },
    {
      connection,
      concurrency: 2
    }
  );

  worker.on("completed", (job) => {
    console.log(`[FailureWorker] Failure analysis Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[FailureWorker] Failure analysis Job ${job?.id} failed:`, err);
  });

  worker.on("error", (err) => {
    console.warn(`[FailureWorker] Worker connection issue:`, err.message);
  });

  return worker;
}
