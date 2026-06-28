const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../services/prisma');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token không tồn tại' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Tài khoản không hợp lệ' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token không hợp lệ' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token đã hết hạn' });
    }
    return res.status(500).json({ error: 'Lỗi xác thực' });
  }
}

// Middleware kiểm tra quyền theo vai trò
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }
    if (!allowedRoles.includes(req.user.role.name)) {
      return res.status(403).json({
        error: 'Bạn không có quyền thực hiện thao tác này',
        required: allowedRoles,
        current: req.user.role.name,
      });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
