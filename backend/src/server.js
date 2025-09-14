import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import fridgeRoutes from "./routes/fridgeRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/fridge", fridgeRoutes);
app.use("/api/booking", bookingRoutes);

const BACK_HOST = process.env.BACK_HOST
const BACK_PORT = process.env.BACK_PORT
app.listen(BACK_PORT, () => {
  console.log(`Server running on ${BACK_HOST}:${BACK_PORT}`);
});

export default app;