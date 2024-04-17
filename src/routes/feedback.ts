import { Request, Response, Router } from "express";
import FeedbackModel from "../../models/feedback";

const router = Router();

router.post("/submit", async (req: Request, res: Response) => {
  const { feedback, rating, companyName, location } = req.body;

  if (!feedback || !rating || !companyName || !location) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  try {
    const feedbackDoc = await FeedbackModel.create({
      feedback,
      companyName,
      rating,
      location,
    })

    res.status(201).json(feedbackDoc);
  } catch (err) {
    res.status(500).json({ error: err });
  }
})

router.get("/all", async (req: Request, res: Response) => {
  const feedbackDoc = await FeedbackModel.find();

  if (!feedbackDoc) {
    return res.status(404).json({ error: "No feedback found" });
  }

  res.status(200).json(feedbackDoc);
})

export default router;