import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);

const BACK_HOST = process.env.BACK_HOST
const BACK_PORT = process.env.BACK_PORT
app.listen(BACK_PORT, () => {
  console.log(`Server running on ${BACK_HOST}:${BACK_PORT}`);
});

export default app;