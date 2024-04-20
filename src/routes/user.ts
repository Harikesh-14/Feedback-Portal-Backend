import { Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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
  const userDoc = await UserModel.findOne({ email: username });

  if (!userDoc) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const passOk = bcrypt.compareSync(password, userDoc.password)

  if (!passOk) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const tokenPayload = {
    username,
    firstName: userDoc.firstName,
    lastName: userDoc.lastName,
    phone: userDoc.phone,
    id: userDoc._id,
    message: 'Logged in',
  }

  try {
    const token = jwt.sign(tokenPayload, secret, {});
    res.cookie('token', token, { httpOnly: true, secure: true }).json({
      message: 'Logged in',
      username,
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      phone: userDoc.phone,
      id: userDoc._id,
    });
  } catch (err) {
    console.error('JWT signing error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get("/profile", async (req: Request, res: Response) => {
  const { token } = req.cookies

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json(info)
  })
});


router.post("/logout", async (req: Request, res: Response) => {
  res.clearCookie("token").json({ message: "Logged out" });
});

export default router;
