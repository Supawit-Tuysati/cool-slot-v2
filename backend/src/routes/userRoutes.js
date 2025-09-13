import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { getUser,getUserData, getUsers,updateUser, deleteUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/getUser', authenticateToken, getUser);
router.get('/getUserData/:id', authenticateToken, getUserData);
router.get('/getUsers', authenticateToken, getUsers);
router.put('/updateUser/:id', authenticateToken, updateUser);
router.put('/deleteUser/:id', authenticateToken, deleteUser);

export default router;
