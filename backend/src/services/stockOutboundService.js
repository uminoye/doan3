const stockOutboundRepository = require('../repositories/stockOutboundRepository');
const prisma = require('../services/prisma');

class StockOutboundService {
  async findAll(queryString) {
    return stockOutboundRepository.findAll(queryString);
  }

  async findById(id) {
    const note = await stockOutboundRepository.findById(id);
    if (!note) {
      throw Object.assign(new Error('Phiếu xuất không tồn tại'), { statusCode: 404 });
    }
    return note;
  }

  async create(data, items, userId) {
    const latest = await prisma.stockOutboundNote.findFirst({ orderBy: { id: 'desc' } });
    const num = (latest?.id || 0) + 1;
    const noteNo = `PX-${String(num).padStart(4, '0')}`;

    return stockOutboundRepository.create({ ...data, noteNo, createdBy: userId }, items);
  }

  async update(id, data, items) {
    return stockOutboundRepository.update(id, data, items);
  }

  async confirm(id) {
    const note = await stockOutboundRepository.findById(id);
    if (!note) {
      throw Object.assign(new Error('Phiếu xuất không tồn tại'), { statusCode: 404 });
    }
    if (note.status === 'confirmed') {
      throw Object.assign(new Error('Phiếu đã được xác nhận trước đó'), { statusCode: 400 });
    }
    if (note.status === 'cancelled') {
      throw Object.assign(new Error('Phiếu đã bị hủy'), { statusCode: 400 });
    }
    return stockOutboundRepository.confirm(id);
  }

  async cancel(id) {
    return stockOutboundRepository.update(id, { status: 'cancelled' });
  }

  async delete(id) {
    const note = await stockOutboundRepository.findById(id);
    if (!note) {
      throw Object.assign(new Error('Phiếu xuất không tồn tại'), { statusCode: 404 });
    }
    if (note.status === 'confirmed') {
      throw Object.assign(new Error('Không thể xóa phiếu đã xác nhận'), { statusCode: 400 });
    }
    return stockOutboundRepository.delete(id);
  }
}

module.exports = new StockOutboundService();
