const warehouseRepository = require('../repositories/warehouseRepository');

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
    return warehouseRepository.create(data);
  }

  async update(id, data) {
    return warehouseRepository.update(id, data);
  }

  async delete(id) {
    return warehouseRepository.delete(id);
  }
}

module.exports = new WarehouseService();
