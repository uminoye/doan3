const salesOrderService = require('../services/salesOrderService');

class SalesOrderController {
  async getAll(req, res, next) {
    try {
      const result = await salesOrderService.findAll(req.query, req.user);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await salesOrderService.findById(parseInt(req.params.id));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { items, ...data } = req.body;
      const result = await salesOrderService.create(data, items, req.user.id);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { items, ...data } = req.body;
      const result = await salesOrderService.update(parseInt(req.params.id), data, items);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async submit(req, res, next) {
    try {
      const result = await salesOrderService.submit(parseInt(req.params.id));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async cancel(req, res, next) {
    try {
      const result = await salesOrderService.cancel(parseInt(req.params.id));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await salesOrderService.delete(parseInt(req.params.id));
      res.json({ message: 'Xóa đơn hàng thành công' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SalesOrderController();
