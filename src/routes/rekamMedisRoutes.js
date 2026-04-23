import { Router } from 'express';
import { create, createResep, getAll, getById, getByPasien } from '../controllers/rekamMedisControllers.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';

const router = Router();
router.use(verifyToken);

router.post('/', checkRole(['DOKTER']), create);
router.post('/:id/resep', checkRole(['DOKTER']), createResep);
router.get('/', checkRole(['DOKTER', 'ADMIN']), getAll);
router.get('/pasien/:pasienId', checkRole(['DOKTER', 'ADMIN']), getByPasien);
router.get('/:id', checkRole(['DOKTER', 'ADMIN']), getById);

export default router;
