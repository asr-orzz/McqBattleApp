"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const client_1 = __importDefault(require("../prisma/client"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.userRouter = (0, express_1.Router)();
const signupSchema = zod_1.z.object({
    username: zod_1.z.string().min(3),
    password: zod_1.z.string().min(6),
});
const signinSchema = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string(),
});
exports.userRouter.post("/signup", async (req, res) => {
    const verify = signupSchema.safeParse(req.body);
    if (verify.success) {
        try {
            const { username, password } = verify.data;
            const existingUser = await client_1.default.user.findUnique({ where: { username } });
            if (existingUser) {
                res.json({
                    msg: "user already exits"
                });
                return;
            }
            const hashedPassword = await bcrypt_1.default.hash(password, 5);
            const user = await client_1.default.user.create({
                data: {
                    username,
                    password: hashedPassword,
                },
            });
            res.status(201).json({ message: "User created", username: user.username });
            return;
        }
        catch (err) {
            res.json({
                msg: err
            });
            return;
        }
    }
    res.json({
        msg: verify.error
    });
    return;
});
exports.userRouter.post("/signin", async (req, res) => {
    const verify = signinSchema.safeParse(req.body);
    if (verify.success) {
        try {
            const { username, password } = verify.data;
            const user = await client_1.default.user.findUnique({ where: { username } });
            if (!user) {
                res.status(401).json({ msg: "Invalid credentials" });
                return;
            }
            const isMatch = await bcrypt_1.default.compare(password, user.password);
            if (!isMatch) {
                res.status(401).json({ msg: "Invalid credentials" });
                return;
            }
            const token = jsonwebtoken_1.default.sign({ username: user.username, id: user.id }, "your_jwt_secret", { expiresIn: "1d" });
            res.json({
                token,
                username: user.username,
                expiresIn: "1day"
            });
            return;
        }
        catch (err) {
            res.status(500).json({ msg: "Internal server error", error: err });
            return;
        }
    }
    res.status(400).json({ msg: verify.error });
    return;
});
