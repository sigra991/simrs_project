import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import prisma from './src/config/prisma.js';

import authRoutes from './src/routes/authRoutes.js';
import pasienRoutes from './src/routes/pasienRoutes.js';
import pendaftaranRoutes from './src/routes/pendaftaranRoutes.js';
import rekamMedisRoutes from './src/routes/rekamMedisRoutes.js';
import inventoryRoutes from './src/routes/inventoryRoutes.js';
import exportRoutes from './src/routes/exportRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE GLOBAL ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (development)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// ==================== ROUTES ====================
app.use('/api/auth', authRoutes);
app.use('/api/pasien', pasienRoutes);
app.use('/api/pendaftaran', pendaftaranRoutes);
app.use('/api/rekam-medis', rekamMedisRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/export', exportRoutes);

// ==================== HEALTH CHECK ====================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🏥 SIMRS Core MVP API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      pasien: '/api/pasien',
      pendaftaran: '/api/pendaftaran',
      rekamMedis: '/api/rekam-medis',
      inventory: '/api/inventory',
      export: '/api/export',
    },
  });
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan.`,
  });
});

// ==================== GLOBAL ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal server.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ==================== START SERVER ====================
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`\n🏥 ===================================`);
      console.log(`   SIMRS Core MVP API`);
      console.log(`   Running on: http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏥 ===================================\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});
