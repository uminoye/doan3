const productionReceiptRepository = require('../repositories/productionReceiptRepository');
const prisma = require('../services/prisma');

class ProductionReceiptService {
  async findAll(queryString) {
    return productionReceiptRepository.findAll(queryString);
  }

  async findById(id) {
    const receipt = await productionReceiptRepository.findById(id);
    if (!receipt) {
      throw Object.assign(new Error('Phiếu nhập không tồn tại'), { statusCode: 404 });
    }
    return receipt;
  }

  async create(data, items, userId) {
    const latest = await prisma.productionReceipt.findFirst({ orderBy: { id: 'desc' } });
    const num = (latest?.id || 0) + 1;
    const receiptNo = `PN-${String(num).padStart(4, '0')}`;

    return productionReceiptRepository.create({ ...data, receiptNo, createdBy: userId }, items);
  }

  async update(id, data, items) {
    return productionReceiptRepository.update(id, data, items);
  }

  async confirm(id, userId) {
    const receipt = await productionReceiptRepository.findById(id);
    if (!receipt) {
      throw Object.assign(new Error('Phiếu nhập không tồn tại'), { statusCode: 404 });
    }
    if (receipt.status === 'confirmed') {
      throw Object.assign(new Error('Phiếu đã được xác nhận trước đó'), { statusCode: 400 });
    }
    if (receipt.status === 'cancelled') {
      throw Object.assign(new Error('Phiếu đã bị hủy'), { statusCode: 400 });
    }
    return productionReceiptRepository.confirm(id);
  }

  async cancel(id) {
    return productionReceiptRepository.update(id, { status: 'cancelled' });
  }

  async delete(id) {
    const receipt = await productionReceiptRepository.findById(id);
    if (!receipt) {
      throw Object.assign(new Error('Phiếu nhập không tồn tại'), { statusCode: 404 });
    }
    if (receipt.status === 'confirmed') {
      throw Object.assign(new Error('Không thể xóa phiếu đã xác nhận'), { statusCode: 400 });
    }
    return productionReceiptRepository.delete(id);
  }
}

module.exports = new ProductionReceiptService();
