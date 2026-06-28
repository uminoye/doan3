const prisma = require('../services/prisma');
const ApiFeatures = require('../utils/apiFeatures');
const { serialize } = require('../utils/serialize');

class ProductRepository {
  async findAll(queryString) {
    const features = new ApiFeatures(prisma.product.findMany(), queryString);
    features.filter().search(['name', 'sku', 'category']).sort().paginate().build();

    const [data, total] = await Promise.all([
      features.query,
      prisma.product.count({ where: features.getWhere() }),
    ]);
    return { data: serialize(data), total };
  }

  async findById(id) {
    return serialize(await prisma.product.findUnique({ where: { id } }));
  }

  async findBySku(sku) {
    return serialize(await prisma.product.findUnique({ where: { sku } }));
  }

  async create(data) {
    return serialize(await prisma.product.create({ data }));
  }

  async update(id, data) {
    return serialize(await prisma.product.update({ where: { id }, data }));
  }

  async delete(id) {
    return serialize(await prisma.product.delete({ where: { id } }));
  }

  async getCategories() {
    return serialize(await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { category: { not: null } },
    }));
  }
}

module.exports = new ProductRepository();
