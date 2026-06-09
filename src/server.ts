import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/", (_req, res) => {
  res.send("Backend running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});