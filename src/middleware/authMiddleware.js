import jwt from 'jsonwebtoken';

/**
 * Middleware: Verifikasi JWT Token
 * Mengecek header Authorization: Bearer <token>
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token tidak ditemukan.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Format token tidak valid.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token sudah kadaluarsa. Silakan login ulang.',
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Token tidak valid.',
    });
  }
};

/**
 * Middleware Factory: Cek Role User
 * @param {string[]} roles - Array role yang diperbolehkan
 */
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. User belum terautentikasi.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Role "${req.user.role}" tidak memiliki izin untuk mengakses resource ini. Dibutuhkan: ${roles.join(', ')}.`,
      });
    }

    next();
  };
};
