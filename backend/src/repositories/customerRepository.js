const prisma = require('../services/prisma');
const ApiFeatures = require('../utils/apiFeatures');

class CustomerRepository {
  async findAll(queryString) {
    const features = new ApiFeatures(
      prisma.customer.findMany({ include: { creator: { select: { id: true, fullName: true } } } }),
      queryString
    );

    features.filter().search(['name', 'customerCode', 'phone']).sort().paginate().build();

    const [data, total] = await Promise.all([
      features.query,
      prisma.customer.count({ where: features.getWhere() }),
    ]);
    return { data, total };
  }

  async findById(id) {
    return prisma.customer.findUnique({ where: { id }, include: { creator: { select: { fullName: true } } } });
  }

  async create(data) {
    return prisma.customer.create({ data });
  }

  async update(id, data) {
    return prisma.customer.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.customer.delete({ where: { id } });
  }

  async getByCode(code) {
    return prisma.customer.findUnique({ where: { customerCode: code } });
  }
}

module.exports = new CustomerRepository();
