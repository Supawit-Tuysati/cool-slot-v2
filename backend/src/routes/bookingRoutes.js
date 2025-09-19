import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { getFridgesSlots, getBookings, getDataBookings,createBookingFridge,updateBookingFridge,clearOrCancelBookingFridge } from "../controllers/bookingController.js";

const router = express.Router();

// GET /api/booking - ดึงข้อมูลการจองทั้งหมด (สำหรับ admin)
router.get("/getFridge/:id", authenticateToken, getFridgesSlots);

router.get("/listBookings", authenticateToken, getBookings);
router.get("/getDataBooking/:id", authenticateToken, getDataBookings);
router.post("/createBookingFridge", authenticateToken, createBookingFridge);
router.put("/updateBookingFridge", authenticateToken, updateBookingFridge);
router.put("/clearOrCancelBookingFridge", authenticateToken, clearOrCancelBookingFridge);

export default router;
