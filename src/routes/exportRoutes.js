import { Router } from 'express';
import { exportKunjunganExcel, exportRekamMedisPdf } from '../controllers/exportControllers.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';

const router = Router();
router.use(verifyToken, checkRole(['ADMIN']));

router.get('/excel/kunjungan', exportKunjunganExcel);
router.get('/pdf/rekam-medis/:id', exportRekamMedisPdf);

export default router;
