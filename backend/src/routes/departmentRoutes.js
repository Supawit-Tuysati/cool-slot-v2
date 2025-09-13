import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment} from '../controllers/departmentController.js';

const router = express.Router();

router.get('/getDepartments', authenticateToken, getDepartments);
router.post('/createDepartment', authenticateToken, createDepartment);
router.put('/updateDepartment/:id', authenticateToken, updateDepartment);
router.delete('/deleteDepartment/:id', authenticateToken, deleteDepartment);

export default router;
