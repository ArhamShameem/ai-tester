import { Router } from "express";
import {
  generateTestCases,
  getTestCases,
  getTestCaseById,
  deleteTestCase,
  clearProjectTestCases
} from "../controllers/test-case.controller";
import { authMiddleware } from "../middleware/auth.middleware";

// Router mounted on /api/projects
export const projectTestCaseRouter = Router();
projectTestCaseRouter.use(authMiddleware);
projectTestCaseRouter.post("/:projectId/test-cases/generate", generateTestCases);
projectTestCaseRouter.get("/:projectId/test-cases", getTestCases);
projectTestCaseRouter.delete("/:projectId/test-cases", clearProjectTestCases);

// Router mounted on /api/test-cases
export const testCaseRouter = Router();
testCaseRouter.use(authMiddleware);
testCaseRouter.get("/:testCaseId", getTestCaseById);
testCaseRouter.delete("/:testCaseId", deleteTestCase);
