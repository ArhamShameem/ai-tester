import { Router } from "express";
import {
  analyzeProject,
  getLatestAnalysis
} from "../controllers/analysis.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/:projectId/analyze", analyzeProject);
router.get("/:projectId/analysis", getLatestAnalysis);

export default router;
