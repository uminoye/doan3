const authService = require('../services/authService');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
      }
      const result = await authService.login(email, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req, res, next) {
    try {
      const result = await authService.getProfile(req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
