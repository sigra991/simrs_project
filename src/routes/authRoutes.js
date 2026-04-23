import { Router } from 'express';
import { login, register } from '../controllers/authControllers.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/auth/login - Login (public)
router.post('/login', login);

// POST /api/auth/register - Register user baru (hanya ADMIN)
router.post('/register', verifyToken, checkRole(['ADMIN']), register);

export default router;
