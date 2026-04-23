import { Router } from 'express';
import { create, getAll, getById, update, remove } from '../controllers/pasienControllers.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';

const router = Router();

// Semua endpoint pasien: RESEPSIONIS & ADMIN
router.use(verifyToken, checkRole(['RESEPSIONIS', 'ADMIN']));

router.post('/', create);
router.get('/', getAll);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
