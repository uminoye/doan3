const prisma = require('../services/prisma');
const ApiFeatures = require('../utils/apiFeatures');

class CustomerRepository {
  async findAll(queryString) {
    const features = new ApiFeatures(
      prisma.customer.findMany({ include: { creator: { select: { id: true, fullName: true } } } }),
      queryString
    );

    const excludes = ['page', 'sort', 'limit', 'fields', 'search'];
    const filterWhere = {};
    for (const key of Object.keys(queryString)) {
      if (!excludes.includes(key) && queryString[key] !== '' && queryString[key] !== undefined) {
        filterWhere[key] = queryString[key];
      }
    }
    const search = queryString.search;
    const searchWhere = (search)
      ? { OR: ['name', 'customerCode', 'phone'].map((field) => ({ [field]: { contains: search, mode: 'insensitive' } })) }
      : {};

    features.filter().search(['name', 'customerCode', 'phone']).sort().paginate();

    const [data, total] = await Promise.all([
      features.query,
      prisma.customer.count({ where: { ...filterWhere, ...searchWhere } }),
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
