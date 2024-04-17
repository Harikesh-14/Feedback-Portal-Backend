import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from 'cors'

import userRoutes from "./routes/user";
import feedbackRoutes from "./routes/feedback";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}))

mongoose.connect(process.env.CLUSTER_URI as string).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error(err);
});

app.use("/user", userRoutes)
app.use("/feedback", feedbackRoutes)

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});