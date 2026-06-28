const deliveryRequestRepository = require('../repositories/deliveryRequestRepository');
const salesOrderRepository = require('../repositories/salesOrderRepository');

class DeliveryRequestService {
  async findAll(queryString) {
    return deliveryRequestRepository.findAll(queryString);
  }

  async findById(id) {
    const request = await deliveryRequestRepository.findById(id);
    if (!request) {
      throw Object.assign(new Error('Yêu cầu giao hàng không tồn tại'), { statusCode: 404 });
    }
    return request;
  }

  async createFromOrder(salesOrderId, userId, note) {
    const order = await salesOrderRepository.findById(salesOrderId);
    if (!order) {
      throw Object.assign(new Error('Đơn hàng không tồn tại'), { statusCode: 404 });
    }
    if (order.status !== 'submitted') {
      throw Object.assign(new Error('Đơn hàng phải ở trạng thái đã gửi'), { statusCode: 400 });
    }

    return deliveryRequestRepository.create({
      salesOrderId,
      receivedBy: userId,
      note,
      status: 'confirmed',
    });
  }

  async transferToWarehouse(id, note) {
    const request = await deliveryRequestRepository.findById(id);
    if (!request) {
      throw Object.assign(new Error('Yêu cầu không tồn tại'), { statusCode: 404 });
    }
    if (request.status !== 'confirmed') {
      throw Object.assign(new Error('Yêu cầu phải đã được xác nhận'), { statusCode: 400 });
    }

    const updated = await deliveryRequestRepository.updateStatus(id, 'transferred', note);
    await salesOrderRepository.updateStatus(request.salesOrderId, 'warehouse_processing');
    return updated;
  }

  async cancel(id) {
    const request = await deliveryRequestRepository.findById(id);
    if (request.salesOrderId) {
      await salesOrderRepository.updateStatus(request.salesOrderId, 'submitted');
    }
    return deliveryRequestRepository.delete(id);
  }
}

module.exports = new DeliveryRequestService();
