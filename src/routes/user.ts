import { Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import jwt, { VerifyErrors } from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import UserModel from "../../models/user";

dotenv.config();
const router = Router();
const salt = bcrypt.genSaltSync(10);
const secret = process.env.SECRET as string;

router.use(cookieParser());

router.post("/register", async (req: Request, res: Response) => {
  const { firstName, lastName, email, phone, password } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, salt);
    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });

    res.status(201).json(user);
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findOne({ email: username });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const tokenPayload = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.email,
      phone: user.phone,
    };

    jwt.sign(tokenPayload, secret, {}, (err, token) => {
      if (err) {
        console.error("Error during token generation:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      res.cookie("token", token, { httpOnly: true, secure: process.env.SECRET === "production" });
      res.status(200).json({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.email,
        phone: user.phone,
        message: "Login successful"
      });
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profile", async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log(token);

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    jwt.verify(token, secret, (err: VerifyErrors | null, decoded: any) => {
      if (err) {
        console.error("Error verifying token:", err);
        return res.status(401).json({ error: "Unauthorized" });
      }

      res.status(200).json(decoded);
    });
  } catch (err) {
    console.error("Error verifying token:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


router.post("/logout", async (req: Request, res: Response) => {
  res.clearCookie("token").json({ message: "Logged out" });
});

export default router;
