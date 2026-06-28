const prisma = require('../services/prisma');
const ApiFeatures = require('../utils/apiFeatures');

class WarehouseRepository {
  async findAll(queryString) {
    const features = new ApiFeatures(prisma.warehouse.findMany(), queryString);
    features.filter().search(['name', 'warehouseCode', 'location']).sort().paginate().build();

    const [data, total] = await Promise.all([
      features.query,
      prisma.warehouse.count({ where: features.getWhere() }),
    ]);
    return { data, total };
  }

  async findById(id) {
    return prisma.warehouse.findUnique({ where: { id } });
  }

  async findActive() {
    return prisma.warehouse.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  async create(data) {
    return prisma.warehouse.create({ data });
  }

  async update(id, data) {
    return prisma.warehouse.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.warehouse.delete({ where: { id } });
  }
}

module.exports = new WarehouseRepository();
