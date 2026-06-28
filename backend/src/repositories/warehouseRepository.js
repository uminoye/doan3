const prisma = require('../services/prisma');
const ApiFeatures = require('../utils/apiFeatures');
const { serialize } = require('../utils/serialize');

class WarehouseRepository {
  async findAll(queryString) {
    const features = new ApiFeatures(prisma.warehouse.findMany(), queryString);
    features.filter().search(['name', 'warehouseCode', 'location']).sort().paginate().build();

    const [data, total] = await Promise.all([
      features.query,
      prisma.warehouse.count({ where: features.getWhere() }),
    ]);
    return { data: serialize(data), total };
  }

  async findById(id) {
    return serialize(await prisma.warehouse.findUnique({ where: { id } }));
  }

  async findActive() {
    return serialize(await prisma.warehouse.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }));
  }

  async create(data) {
    return serialize(await prisma.warehouse.create({ data }));
  }

  async update(id, data) {
    return serialize(await prisma.warehouse.update({ where: { id }, data }));
  }

  async delete(id) {
    return serialize(await prisma.warehouse.delete({ where: { id } }));
  }
}

module.exports = new WarehouseRepository();
