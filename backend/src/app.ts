import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route";
import projectRoutes from "./routes/project.route";
import analysisRoutes from "./routes/analysis.route";
import {
  projectTestCaseRouter,
  testCaseRouter
} from "./routes/test-case.route";
import {
  projectTestRunRouter,
  testRunRouter
} from "./routes/test-run.route";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

// Trust reverse proxy (essential on Render, Railway, etc. for secure cookies)
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile, curl) or matching allowed origins
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects", analysisRoutes);
app.use("/api/projects", projectTestCaseRouter);
app.use("/api/test-cases", testCaseRouter);
app.use("/api/projects", projectTestRunRouter);
app.use("/api/test-runs", testRunRouter);
app.use(errorMiddleware);

export default app;
