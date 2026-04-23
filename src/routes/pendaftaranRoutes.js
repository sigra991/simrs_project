import { Router } from 'express';
import { create, getAntreanHariIni, getAll, getById, updateStatus, updateBiaya } from '../controllers/pendaftaranControllers.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';

const router = Router();
router.use(verifyToken);

router.post('/', checkRole(['RESEPSIONIS', 'ADMIN']), create);
router.get('/antrean-hari-ini', getAntreanHariIni);
router.get('/', getAll);
router.get('/:id', getById);
router.patch('/:id/status', checkRole(['DOKTER', 'RESEPSIONIS', 'ADMIN']), updateStatus);
router.patch('/:id/biaya', checkRole(['RESEPSIONIS', 'ADMIN']), updateBiaya);

export default router;
