const stockOutboundService = require('../services/stockOutboundService');

class StockOutboundController {
  async getAll(req, res, next) {
    try {
      const result = await stockOutboundService.findAll(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await stockOutboundService.findById(parseInt(req.params.id));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { items, ...data } = req.body;
      const result = await stockOutboundService.create(data, items, req.user.id);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { items, ...data } = req.body;
      const result = await stockOutboundService.update(parseInt(req.params.id), data, items);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async confirm(req, res, next) {
    try {
      const result = await stockOutboundService.confirm(parseInt(req.params.id));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async cancel(req, res, next) {
    try {
      const result = await stockOutboundService.cancel(parseInt(req.params.id));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await stockOutboundService.delete(parseInt(req.params.id));
      res.json({ message: 'Xóa phiếu xuất thành công' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StockOutboundController();
