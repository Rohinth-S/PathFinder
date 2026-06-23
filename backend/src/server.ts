import express from "express";
import dotenv from "dotenv";
dotenv.config();

import queryRoutes from "./routes/query.routes.js";

const app = express();
app.use(express.json());

app.use("/api", queryRoutes);

app.get("/", (_req, res) => {
  res.send("Backend running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});