"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const project_route_1 = __importDefault(require("./routes/project.route"));
const analysis_route_1 = __importDefault(require("./routes/analysis.route"));
const test_case_route_1 = require("./routes/test-case.route");
const test_run_route_1 = require("./routes/test-run.route");
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.FRONTEND_URL
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok"
    });
});
app.use("/api/auth", auth_route_1.default);
app.use("/api/projects", project_route_1.default);
app.use("/api/projects", analysis_route_1.default);
app.use("/api/projects", test_case_route_1.projectTestCaseRouter);
app.use("/api/test-cases", test_case_route_1.testCaseRouter);
app.use("/api/projects", test_run_route_1.projectTestRunRouter);
app.use("/api/test-runs", test_run_route_1.testRunRouter);
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
