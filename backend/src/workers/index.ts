import dotenv from "dotenv";
dotenv.config();

import { checkRedisHealth } from "../lib/redis";
import { createTestWorker } from "./test.worker";
import { createFailureAnalysisWorker } from "./failure-analysis.worker";

async function startWorkers() {
  console.log("[WorkerEngine] Checking Redis connection...");
  const isOk = await checkRedisHealth();

  if (!isOk) {
    console.warn(
      "[WorkerEngine] Redis is not reachable. Workers will retry connection in background."
    );
  } else {
    console.log("[WorkerEngine] Redis connected successfully.");
  }

  console.log("[WorkerEngine] Starting Test Execution Worker...");
  const testWorker = createTestWorker();

  console.log("[WorkerEngine] Starting AI Failure Analysis Worker...");
  const failureWorker = createFailureAnalysisWorker();

  console.log("[WorkerEngine] BullMQ workers are listening for jobs.");

  const shutdown = async () => {
    console.log("[WorkerEngine] Shutting down workers gracefully...");
    await testWorker?.close();
    await failureWorker?.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startWorkers().catch((err) => {
  console.error("[WorkerEngine] Fatal error starting workers:", err);
  process.exit(1);
});
