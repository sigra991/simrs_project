import { Router } from 'express';
import { create, getAll, getById, update, remove, getResepHariIni } from '../controllers/inventoryControllers.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';

const router = Router();
router.use(verifyToken, checkRole(['APOTEKER', 'ADMIN']));

router.get('/resep-hari-ini', getResepHariIni);
router.post('/', create);
router.get('/', getAll);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
