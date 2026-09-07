import { Router } from "express";
import {
  startTestRun,
  getTestRuns,
  getTestRunById,
  getTestResults,
  getArtifact
} from "../controllers/test-run.controller";
import { authMiddleware } from "../middleware/auth.middleware";

// Router mounted on /api/projects
export const projectTestRunRouter = Router();
projectTestRunRouter.use(authMiddleware);
projectTestRunRouter.post("/:projectId/test-runs", startTestRun);
projectTestRunRouter.get("/:projectId/test-runs", getTestRuns);
projectTestRunRouter.get(
  "/:projectId/runs/:testRunId/artifacts/:filename",
  getArtifact
);

// Router mounted on /api/test-runs
export const testRunRouter = Router();
testRunRouter.use(authMiddleware);
testRunRouter.get("/:testRunId", getTestRunById);
testRunRouter.get("/:testRunId/results", getTestResults);
