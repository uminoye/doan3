const deliveryRequestService = require('../services/deliveryRequestService');

class DeliveryRequestController {
  async getAll(req, res, next) {
    try {
      const result = await deliveryRequestService.findAll(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await deliveryRequestService.findById(parseInt(req.params.id));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { salesOrderId, note } = req.body;
      const result = await deliveryRequestService.createFromOrder(salesOrderId, req.user.id, note);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async transferToWarehouse(req, res, next) {
    try {
      const { note } = req.body;
      const result = await deliveryRequestService.transferToWarehouse(parseInt(req.params.id), note);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async cancel(req, res, next) {
    try {
      await deliveryRequestService.cancel(parseInt(req.params.id));
      res.json({ message: 'Hủy yêu cầu giao hàng thành công' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DeliveryRequestController();
