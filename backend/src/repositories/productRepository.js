const prisma = require('../services/prisma');
const ApiFeatures = require('../utils/apiFeatures');

class ProductRepository {
  async findAll(queryString) {
    const features = new ApiFeatures(prisma.product.findMany(), queryString);
    features.filter().search(['name', 'sku', 'category']).sort().paginate().build();

    const [data, total] = await Promise.all([
      features.query,
      prisma.product.count({ where: features.getWhere() }),
    ]);
    return { data, total };
  }

  async findById(id) {
    return prisma.product.findUnique({ where: { id } });
  }

  async findBySku(sku) {
    return prisma.product.findUnique({ where: { sku } });
  }

  async create(data) {
    return prisma.product.create({ data });
  }

  async update(id, data) {
    return prisma.product.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.product.delete({ where: { id } });
  }

  async getCategories() {
    return prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { category: { not: null } },
    });
  }
}

module.exports = new ProductRepository();
