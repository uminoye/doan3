const productionReceiptService = require('../services/productionReceiptService');

class ProductionReceiptController {
  async getAll(req, res, next) {
    try {
      const result = await productionReceiptService.findAll(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await productionReceiptService.findById(parseInt(req.params.id));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { items, ...data } = req.body;
      const result = await productionReceiptService.create(data, items, req.user.id);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { items, ...data } = req.body;
      const result = await productionReceiptService.update(parseInt(req.params.id), data, items);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async confirm(req, res, next) {
    try {
      const result = await productionReceiptService.confirm(parseInt(req.params.id), req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async cancel(req, res, next) {
    try {
      const result = await productionReceiptService.cancel(parseInt(req.params.id));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await productionReceiptService.delete(parseInt(req.params.id));
      res.json({ message: 'Xóa phiếu nhập thành công' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProductionReceiptController();
