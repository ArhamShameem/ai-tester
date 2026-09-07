import { Router } from "express";
import {
  create,
  getAll,
  getById,
  update,
  remove
} from "../controllers/project.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createProjectSchema,
  updateProjectSchema
} from "../schemas/project.schema";

const router = Router();

// Protect all project routes with authentication middleware
router.use(authMiddleware);

router.post("/", validate(createProjectSchema), create);
router.get("/", getAll);
router.get("/:id", getById);
router.patch("/:id", validate(updateProjectSchema), update);
router.delete("/:id", remove);

export default router;
