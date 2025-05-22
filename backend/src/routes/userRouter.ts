import { Router } from "express";
import prisma from "../prisma/client";
import jwt from "jsonwebtoken";
import { z } from "zod";
import bcrypt from "bcrypt";

export const userRouter = Router();

const signupSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

const signinSchema = z.object({
  username: z.string(),
  password: z.string(),
});

userRouter.post("/signup",async(req,res)=>{
    const verify = signupSchema.safeParse(req.body);
    
    if(verify.success){
        try{
            const { username, password } = verify.data;
            const existingUser = await prisma.user.findUnique({ where: { username } });
            if(existingUser){
                res.json({
                    msg: "user already exits"
                })
                return
            }
            const hashedPassword = await bcrypt.hash(password, 5);
            const user = await prisma.user.create({
                data: {
                    username,
                    password: hashedPassword,
                },
            });
            res.status(201).json({ message: "User created", username: user.username });
            return
        }
        catch(err){
            res.json({
                msg: err
            })
            return
        }
    }
    res.json({
        msg : verify.error
    })
    return
})

userRouter.post("/signin", async (req, res) => {
    const verify = signinSchema.safeParse(req.body);

    if (verify.success) {
        try {
            const { username, password } = verify.data;
            const user = await prisma.user.findUnique({ where: { username } });

            if (!user) {
                res.status(401).json({ msg: "Invalid credentials" });
                return;
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                res.status(401).json({ msg: "Invalid credentials" });
                return;
            }

            const token = jwt.sign(
                { username: user.username, id: user.id },
                process.env.USER_JWT_SECRET_KEY!, 
                { expiresIn: "1d" }
            );

            res.json({ 
                token, 
                username: user.username,
                expiresIn: "1day"
            });
            return;
        } catch (err) {
            res.status(500).json({ msg: "Internal server error", error: err });
            return;
        }
    }

    res.status(400).json({ msg: verify.error });
    return;
});
