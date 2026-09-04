"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters"),
    email: zod_1.z
        .string()
        .trim()
        .email("Invalid email address"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password is too long")
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .trim()
        .email("Invalid email address"),
    password: zod_1.z
        .string()
        .min(1, "Password is required")
});
