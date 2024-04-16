import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = 3000;

import UserModel from "../models/user";

mongoose.connect(process.env.CLUSTER_URI as string).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error(err);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});