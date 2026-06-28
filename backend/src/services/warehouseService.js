const warehouseRepository = require('../repositories/warehouseRepository');
const prisma = require('../services/prisma');

function generateCode(prefix) {
  return prefix + Date.now().toString().slice(-6);
}

class WarehouseService {
  async findAll(queryString) {
    return warehouseRepository.findAll(queryString);
  }

  async findById(id) {
    const warehouse = await warehouseRepository.findById(id);
    if (!warehouse) {
      throw Object.assign(new Error('Kho không tồn tại'), { statusCode: 404 });
    }
    return warehouse;
  }

  async findActive() {
    return warehouseRepository.findActive();
  }

  async create(data) {
    const warehouseCode = data.warehouseCode && data.warehouseCode.trim()
      ? data.warehouseCode.trim()
      : generateCode('WH');
    return warehouseRepository.create({ ...data, warehouseCode });
  }

  async update(id, data) {
    return warehouseRepository.update(id, data);
  }

  async delete(id) {
    return warehouseRepository.delete(id);
  }
}

module.exports = new WarehouseService();
