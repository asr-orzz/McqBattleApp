import { Router } from "express";
import prisma from "../prisma/client"
import { userMiddleware } from "../middleware/userMiddleware";

export const questionRouter = Router();

