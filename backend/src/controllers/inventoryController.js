const inventoryService = require('../services/inventoryService');

class InventoryController {
  async getBalances(req, res, next) {
    try {
      const result = await inventoryService.getBalances(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const result = await inventoryService.getTransactions(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getInwardReport(req, res, next) {
    try {
      const result = await inventoryService.getInwardReport(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getOutwardReport(req, res, next) {
    try {
      const result = await inventoryService.getOutwardReport(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const result = await inventoryService.getDashboard();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new InventoryController();
