"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.getMe = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const prisma_1 = __importDefault(require("../lib/prisma"));
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const result = await (0, auth_service_1.registerUser)({
            name,
            email,
            password
        });
        res.cookie("token", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(201).json({
            user: result.user
        });
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error
                ? error.message
                : "Registration failed"
        });
    }
};
exports.register = register;
const getMe = async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: {
                id: req.user.id
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        return res.json({
            user
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch user"
        });
    }
};
exports.getMe = getMe;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await (0, auth_service_1.loginUser)({
            email,
            password
        });
        res.cookie("token", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.json({
            user: result.user
        });
    }
    catch (error) {
        return res.status(401).json({
            message: error instanceof Error
                ? error.message
                : "Login failed"
        });
    }
};
exports.login = login;
const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });
    return res.json({
        message: "Logged out successfully"
    });
};
exports.logout = logout;
