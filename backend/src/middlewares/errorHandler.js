// Middleware xử lý lỗi global
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

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
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi server nội bộ';
  res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;
