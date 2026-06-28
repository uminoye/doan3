const prisma = require('../services/prisma');
const ApiFeatures = require('../utils/apiFeatures');

class UserRepository {
  async findAll(queryString) {
    const features = new ApiFeatures(prisma.user.findMany({ include: { role: true } }), queryString);

    const excludes = ['page', 'sort', 'limit', 'fields', 'search'];
    const filterWhere = {};
    for (const key of Object.keys(queryString)) {
      if (!excludes.includes(key) && queryString[key] !== '' && queryString[key] !== undefined) {
        filterWhere[key] = queryString[key];
      }
    }
    const search = queryString.search;
    const searchWhere = (search)
      ? { OR: ['fullName', 'email'].map((field) => ({ [field]: { contains: search, mode: 'insensitive' } })) }
      : {};

    features.filter().search(['fullName', 'email']).sort().paginate();

    const [data, total] = await Promise.all([
      features.query,
      prisma.user.count({ where: { ...filterWhere, ...searchWhere } }),
    ]);
    return { data, total };
  }

  async findById(id) {
    return prisma.user.findUnique({ where: { id }, include: { role: true } });
  }

  async create(data) {
    return prisma.user.create({ data, include: { role: true } });
  }

  async update(id, data) {
    return prisma.user.update({ where: { id }, data, include: { role: true } });
  }

  async delete(id) {
    return prisma.user.delete({ where: { id } });
  }

  async countByRole() {
    return prisma.user.groupBy({
      by: ['roleId'],
      _count: { id: true },
    });
  }
}

module.exports = new UserRepository();
