import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { 
  getFridges, 
  getFridgeController, 
  createFridgeController, 
  updateFridgeController, 
  deleteFridgeController 
} from '../controllers/fridgeController.js';

const router = express.Router();

router.get('/', authenticateToken, getFridges);

// GET /api/fridge/:id - ดึงข้อมูลตู้เย็นตัวเดียวพร้อมชั้นและช่อง
router.get('/editFridge/:id', authenticateToken, getFridgeController);

// POST /api/fridge/createFridge - สร้างตู้เย็นใหม่พร้อมชั้นและช่อง
router.post('/createFridge', authenticateToken, createFridgeController);

// PUT /api/fridge/:id - แก้ไขตู้เย็นพร้อมชั้นและช่อง
router.put('/updateFridge/:id', authenticateToken, updateFridgeController);

// DELETE /api/fridge/:id - ลบตู้เย็น
router.delete('/deleteFridge/:id', authenticateToken, deleteFridgeController);

export default router;