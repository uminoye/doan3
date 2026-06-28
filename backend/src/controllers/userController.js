const userService = require('../services/userService');

class UserController {
  async getAll(req, res, next) {
    try {
      const result = await userService.findAll(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await userService.findById(parseInt(req.params.id));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const result = await userService.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const result = await userService.update(parseInt(req.params.id), req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await userService.delete(parseInt(req.params.id));
      res.json({ message: 'Xóa người dùng thành công' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
