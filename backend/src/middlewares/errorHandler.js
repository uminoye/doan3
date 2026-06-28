// Middleware xử lý lỗi global
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  // Log chi tiết ra console (Render log)
  if (statusCode >= 500) {
    console.error(`[${req.method} ${req.originalUrl}] ${statusCode} ERROR:`, err.message);
    if (process.env.NODE_ENV !== 'production') {
      console.error(err.stack);
    }
  } else {
    console.warn(`[${req.method} ${req.originalUrl}] ${statusCode} WARN:`, err.message);
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Dữ liệu đã tồn tại (trùng khóa)' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Bản ghi không tồn tại' });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // CORS errors
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  // Default
  const message = err.message || 'Lỗi server nội bộ';
  res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;
