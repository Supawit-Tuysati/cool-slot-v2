import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { getFridgesSlots, getBookings, createBookingFridge } from "../controllers/bookingController.js";

const router = express.Router();

// GET /api/booking - ดึงข้อมูลการจองทั้งหมด (สำหรับ admin)
router.get("/", authenticateToken, getFridgesSlots);

router.get("/list", authenticateToken, getBookings);
router.post("/createBookingFridge", authenticateToken, createBookingFridge);

export default router;
