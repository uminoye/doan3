const warehouseService = require('../services/warehouseService');

class WarehouseController {
  async getAll(req, res, next) {
    try {
      const result = await warehouseService.findAll(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await warehouseService.findById(parseInt(req.params.id));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getActive(req, res, next) {
    try {
      const result = await warehouseService.findActive();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const result = await warehouseService.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const result = await warehouseService.update(parseInt(req.params.id), req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await warehouseService.delete(parseInt(req.params.id));
      res.json({ message: 'Xóa kho thành công' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WarehouseController();
