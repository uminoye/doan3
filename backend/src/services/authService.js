const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/authRepository');
const config = require('../config');

class AuthService {
  async login(email, password) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw Object.assign(new Error('Email hoặc mật khẩu không đúng'), { statusCode: 401 });
    }
    if (user.status !== 'active') {
      throw Object.assign(new Error('Tài khoản đã bị vô hiệu hóa'), { statusCode: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw Object.assign(new Error('Email hoặc mật khẩu không đúng'), { statusCode: 401 });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getProfile(id) {
    const user = await authRepository.findById(id);
    if (!user) {
      throw Object.assign(new Error('Không tìm thấy người dùng'), { statusCode: 404 });
    }
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }
}

module.exports = new AuthService();
