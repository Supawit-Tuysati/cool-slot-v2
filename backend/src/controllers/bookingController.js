import {
  findAllFridgesSlots,
  findBookings,
  findBooking,
  createBooking,
  updateBooking,
  clearOrCancelBooking,
} from "../models/bookingModel.js";

// GET /api/fridges - ดึงข้อมูลตู้เย็นทั้งหมดพร้อมชั้นและช่อง
export const getFridgesSlots = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const fridges = await findAllFridgesSlots(id);
    res.status(200).json(fridges);
  } catch (error) {
    console.error("Error in getFridgesSlots:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลตู้เย็น" });
  }
};

export const getBookings = async (req, res) => {
  try {
    const userId = req.user.id; 
    const role = req.user.role;
    // console.log("userId:", userId, "role:", role);
    
    const bookings = await findBookings(userId, role);

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error in getBookings:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลการจอง" });
  }
};

export const getDataBookings = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const bookings = await findBooking(id);

    console.log(bookings);

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error in getBookings:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลการจอง" });
  }
};

export const createBookingFridge = async (req, res) => {
  try {
    const { slot_id, start_time, end_time, note, items } = req.body;
    const userId = req.user.id; // สมมติได้จาก token decode

    const booking = await createBooking({
      user_id: userId,
      slot_id,
      start_time,
      end_time,
      note,
      items,
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error in createBookingFridge:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการจองตู้เย็น" });
  }
};

export const updateBookingFridge = async (req, res) => {
  try {
    const { booking_id, slot_id, start_time, end_time, note, items } = req.body;
    const userId = req.user.id;

    const booking = await updateBooking({
      booking_id,
      user_id: userId,
      slot_id,
      start_time,
      end_time,
      note,
      items,
    });

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error in updateBookingFridge:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการแก้ไขการจองตู้เย็น" });
  }
};

export const clearOrCancelBookingFridge = async (req, res) => {
  try {
    const { booking_id, slot_id, action } = req.body;
    const userId = req.user.id;
    const booking = await clearOrCancelBooking({
      booking_id,
      slot_id,
      user_id: userId,
      action,
    });

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error in updateBookingFridge:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการแก้ไขการจองตู้เย็น" });
  }
};
