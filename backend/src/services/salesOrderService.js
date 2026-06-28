const salesOrderRepository = require('../repositories/salesOrderRepository');
const prisma = require('../services/prisma');

class SalesOrderService {
  async findAll(queryString, user) {
    if (user.role.name === 'sales') {
      queryString.createdBy = String(user.id);
    }
    return salesOrderRepository.findAll(queryString);
  }

  async findById(id) {
    const order = await salesOrderRepository.findById(id);
    if (!order) {
      throw Object.assign(new Error('Đơn hàng không tồn tại'), { statusCode: 404 });
    }
    return order;
  }

  async create(data, items, userId) {
    const latest = await prisma.salesOrder.findFirst({ orderBy: { id: 'desc' } });
    const num = (latest?.id || 0) + 1;
    const orderNo = `DH-${String(num).padStart(4, '0')}`;

    return salesOrderRepository.create({ ...data, orderNo, createdBy: userId }, items);
  }

  async update(id, data, items) {
    return salesOrderRepository.update(id, data, items);
  }

  async submit(id) {
    const order = await salesOrderRepository.findById(id);
    if (!order) {
      throw Object.assign(new Error('Đơn hàng không tồn tại'), { statusCode: 404 });
    }
    if (order.status !== 'draft') {
      throw Object.assign(new Error('Chỉ đơn ở trạng thái nháp mới có thể gửi'), { statusCode: 400 });
    }
    return salesOrderRepository.updateStatus(id, 'submitted');
  }

  async cancel(id) {
    return salesOrderRepository.updateStatus(id, 'cancelled');
  }

  async delete(id) {
    const order = await salesOrderRepository.findById(id);
    if (!order) {
      throw Object.assign(new Error('Đơn hàng không tồn tại'), { statusCode: 404 });
    }
    if (order.status !== 'draft') {
      throw Object.assign(new Error('Chỉ đơn ở trạng thái nháp mới có thể xóa'), { statusCode: 400 });
    }
    return salesOrderRepository.delete(id);
  }
}

module.exports = new SalesOrderService();
