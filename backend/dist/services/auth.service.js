"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const registerUser = async ({ name, email, password }) => {
    const existingUser = await prisma_1.default.user.findUnique({
        where: {
            email
        }
    });
    if (existingUser) {
        throw new Error("User already exists");
    }
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    const user = await prisma_1.default.user.create({
        data: {
            name,
            email,
            passwordHash
        }
    });
    const token = jsonwebtoken_1.default.sign({
        userId: user.id
    }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        },
        token
    };
};
exports.registerUser = registerUser;
