import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ msg: "Authorization token missing" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token,process.env.USER_JWT_SECRET_KEY!) as { id: string; username: string };
        // @ts-ignore
        req.userid = decoded.id; 
        next();
    } catch (err) {
        res.status(401).json({ msg: "Invalid or expired token" });
        return;
    }
};
