import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * POST /api/auth/login
 * Login user dan return JWT token
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi.',
      });
    }

    // Cari user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah.',
      });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah.',
      });
    }

    // Generate JWT token (berlaku 24 jam)
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        nama: user.nama,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          nama: user.nama,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
};

/**
 * POST /api/auth/register
 * Register user baru (hanya Admin)
 */
export const register = async (req, res) => {
  try {
    const { username, password, nama, role } = req.body;

    // Validasi input
    if (!username || !password || !nama || !role) {
      return res.status(400).json({
        success: false,
        message: 'Semua field (username, password, nama, role) wajib diisi.',
      });
    }

    // Validasi role
    const validRoles = ['ADMIN', 'RESEPSIONIS', 'DOKTER', 'APOTEKER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role tidak valid. Pilihan: ${validRoles.join(', ')}`,
      });
    }

    // Cek username duplikat
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username sudah digunakan.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        nama,
        role,
      },
      select: {
        id: true,
        username: true,
        nama: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'User berhasil didaftarkan.',
      data: newUser,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
};
