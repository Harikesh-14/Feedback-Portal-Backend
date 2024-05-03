import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

import FeedbackModel from "../../models/feedback";

const router = Router();
router.use(cookieParser());
const secret = process.env.SECRET as string;

router.post("/submit", async (req: Request, res: Response) => {
  const { token } = req.cookies;
  try {
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) throw err

      const { companyName, location, headquarter, industry, feedback, rating } = req.body;
      const feedbackDoc = await FeedbackModel.create({
        companyName,
        location,
        headquarter,
        industry,
        feedback,
        rating,
        author: (info as { id: string }).id
      });

      res.json(feedbackDoc)
    })
  } catch (err) {
    console.error("Error creating the feedback\n", err);
    res.status(500).json({ error: "Internal server error" });
  }
})

router.get("/all", async (req: Request, res: Response) => {
  const feedbackDoc = await FeedbackModel.find().populate('author', 'firstName lastName email');

  if (!feedbackDoc) {
    return res.status(404).json({ error: "No feedback found" });
  }

  res.status(200).json(feedbackDoc);
})

router.get("/average-rating", async (req: Request, res: Response) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: {companyName: "$companyName", location: "$location"},
          averageRating: { $avg: "$rating" },
        }
      }
    ];

    const averageRating = await FeedbackModel.aggregate(pipeline);

    res.json(averageRating);
  } catch (err) {
    console.error("Error getting the average rating\n", err);
    res.status(500).json({ error: "Internal server error" });
  }
})

router.get("/total-reviews", async (req: Request, res: Response) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: {companyName: "$companyName", location: "$location"},
          totalReviews: { $sum: 1 },
        }
      }
    ];

    const totalReviews = await FeedbackModel.aggregate(pipeline);

    res.json(totalReviews);
  } catch (err) {
    console.error("Error getting the total reviews\n", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/my-feedback", async (req: Request, res: Response) => {
  const { token } = req.cookies;
  try {
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) throw err

      const feedbackDoc = await FeedbackModel.find({ author: (info as { id: string }).id });

      if (!feedbackDoc) {
        return res.status(404).json({ error: "No feedback found" });
      }

      res.status(200).json(feedbackDoc);
    })
  } catch (err) {
    console.error("Error getting the feedback\n", err);
    res.status(500).json({ error: "Internal server error" });
  }
})

router.get("/low-to-high-feedback", async (req: Request, res: Response) => {
  try {
    const feedbackDoc = await FeedbackModel.find().sort({ rating: 1 });

    if (!feedbackDoc) {
      return res.status(404).json({ error: "No feedback found" });
    }

    res.status(200).json(feedbackDoc);
  } catch (err) {
    console.error("Error getting the feedback\n", err);
    res.status(500).json({ error: "Internal server error" });
  }
})

router.get("/high-to-low-feedback", async (req: Request, res: Response) => {
  try {
    const feedbackDoc = await FeedbackModel.find().sort({ rating: -1 });

    if (!feedbackDoc) {
      return res.status(404).json({ error: "No feedback found" });
    }

    res.status(200).json(feedbackDoc);
  } catch (err) {
    console.error("Error getting the feedback\n", err);
    res.status(500).json({ error: "Internal server error" });
  }
})

export default router;