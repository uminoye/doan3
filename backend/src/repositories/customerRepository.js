const prisma = require('../services/prisma');
const ApiFeatures = require('../utils/apiFeatures');

class CustomerRepository {
  async findAll(queryString) {
    const features = new ApiFeatures(
      prisma.customer.findMany({ include: { creator: { select: { id: true, fullName: true } } } }),
      queryString
    );
    features.filter().search(['name', 'customerCode', 'phone']).sort().paginate();
    return { data: await features.query, total: await prisma.customer.count({ where: features.query._conditions }) };
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
