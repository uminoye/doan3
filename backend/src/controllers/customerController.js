const customerService = require('../services/customerService');

class CustomerController {
  async getAll(req, res, next) {
    try {
      const result = await customerService.findAll(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await customerService.findById(parseInt(req.params.id));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const result = await customerService.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const result = await customerService.update(parseInt(req.params.id), req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await customerService.delete(parseInt(req.params.id));
      res.json({ message: 'Xóa khách hàng thành công' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CustomerController();
