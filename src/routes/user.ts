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
    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      phone,
      password: bcrypt.hashSync(password, salt),
    });

    res.status(201).json(user);
  } catch (err) {
    if (err instanceof Error && (err as any).code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: err });
    }
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const userDoc = await UserModel.findOne({ email: username });

  if (!userDoc) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const isPasswordValid = bcrypt.compareSync(password, userDoc.password);

  if (isPasswordValid) {
    const tokenPayload = {
      id: userDoc._id,
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      username: userDoc.email,
      phone: userDoc.phone,
    };

    jwt.sign(tokenPayload, secret, { expiresIn: "1h" }, (err, token) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: err });
      }

      res.cookie("token", token, { httpOnly: true, secure: true });
      res.status(200).json({
        id: userDoc._id,
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        username: userDoc.email,
        phone: userDoc.phone,
        message: "Login successful"
      });
    });
  } else {
    return res.status(400).json({ error: "Invalid credentials" });
  }
});

router.get("/profile", async (req: Request, res: Response) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, secret, (err: VerifyErrors | null, decoded: any) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.status(200).json(decoded);
  })
});

router.post("/logout", async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
});

export default router;