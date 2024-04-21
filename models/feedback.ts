import { Schema, model } from "mongoose";
import type { FeedbackDBProps } from "../src/types";

const FeedbackSchema = new Schema({
  companyName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  headquarter: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  feedback: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
}, {
  timestamps: true
})

const FeedbackModel = model<FeedbackDBProps>("Feedback", FeedbackSchema);

export default FeedbackModel;