import { Router } from "express";
import prisma from "../prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {z} from"zod"
import dayjs from "dayjs";
import { generateOtp } from "../utils/generateOtp";
import { sendOtpEmail } from "../utils/mailer";

export const userRouter = Router();

userRouter.post("/request-otp", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
     res.status(400).json({ msg: "All fields are required." });
     return
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });

  if (existingUser) {
     res.status(409).json({ msg: "Username or email already exists." });
     return
  }

  const otp = generateOtp();
  const otpExpiry = dayjs().add(10, "minutes").toISOString();
  const passwordHash = await bcrypt.hash(password, 10);

  await sendOtpEmail(email, otp, username);

  const tempToken = jwt.sign(
    { username, email, passwordHash, otp, otpExpiry },
    process.env.OTP_SECRET!,
    { expiresIn: "10m" }
  );

   res.json({ msg: "OTP sent to email.", token: tempToken });
   return
});

userRouter.post("/verify-otp", async (req, res) => {
  const { token, otp: userOtp } = req.body;
  if (!token || !userOtp) {
     res.status(400).json({ msg: "Token and OTP are required." });
     return
  }
  try {
    const data = jwt.verify(token, process.env.OTP_SECRET!) as {
      username: string;
      email: string;
      passwordHash: string;
      otp: string;
      otpExpiry: string;
    };

    if (userOtp !== data.otp) {
       res.status(400).json({ msg: "Invalid OTP." });
       return
    }

    if (dayjs().isAfter(data.otpExpiry)) {
       res.status(400).json({ msg: "OTP expired." });
       return
    }

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.passwordHash
      },
    });

     res.json({ msg: "User created successfully.", username: user.username });
     return
  } catch (err) {
     res.status(400).json({ msg: "Invalid or expired token." });
     return
  }
});

const signinSchema = z.object({
  username: z.string(),
  password: z.string(),
});

userRouter.post("/signin", async (req, res) => {
  const verify = signinSchema.safeParse(req.body);

  if (!verify.success) {
     res.status(400).json({ msg: verify.error });
     return
  }

  const { username, password } = verify.data;

  try {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      res.status(401).json({ msg: "Invalid credentials or user not verified." });
      return
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
       res.status(401).json({ msg: "Invalid credentials." });
       return
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.USER_JWT_SECRET_KEY!,
      { expiresIn: "1d" }
    );

     res.json({
      msg: "Signin successful.",
      token,
      username: user.username,
      expiresIn: "1d",
    });
    return
  } catch (err) {
     res.status(500).json({ msg: "Internal server error.", error: err });
     return
  }
});
