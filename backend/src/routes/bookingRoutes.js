import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { getFridgesSlots, getBookings, getDataBookings,createBookingFridge } from "../controllers/bookingController.js";

const router = express.Router();

// GET /api/booking - ดึงข้อมูลการจองทั้งหมด (สำหรับ admin)
router.get("/getFridge/:id", authenticateToken, getFridgesSlots);

router.get("/listBookings", authenticateToken, getBookings);
router.get("/getDataBooking/:id", authenticateToken, getDataBookings);
router.post("/createBookingFridge", authenticateToken, createBookingFridge);

export default router;
