import { Router } from "express";
import { register, getMe, login, logout } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { validate } from "../middleware/validate.middleware";

const router = Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);

export default router;
