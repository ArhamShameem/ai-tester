import { Router } from "express";
import {
  register,
  getMe,
  login,
  logout
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);

router.get(
  "/me",
  authMiddleware,
  getMe
);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get(
  "/me",
  authMiddleware,
  getMe
);


export default router;
