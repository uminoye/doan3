const prisma = require('../services/prisma');
const ApiFeatures = require('../utils/apiFeatures');
const { serialize } = require('../utils/serialize');

class UserRepository {
  async findAll(queryString) {
    const features = new ApiFeatures(prisma.user.findMany({ include: { role: true } }), queryString);
    features.filter().search(['fullName', 'email']).sort().paginate().build();

    const [data, total] = await Promise.all([
      features.query,
      prisma.user.count({ where: features.getWhere() }),
    ]);
    return { data: serialize(data), total };
  }

  async findById(id) {
    return serialize(await prisma.user.findUnique({ where: { id }, include: { role: true } }));
  }

  async create(data) {
    return serialize(await prisma.user.create({ data, include: { role: true } }));
  }

  async update(id, data) {
    return serialize(await prisma.user.update({ where: { id }, data, include: { role: true } }));
  }

  async delete(id) {
    return serialize(await prisma.user.delete({ where: { id } }));
  }

  async countByRole() {
    return serialize(await prisma.user.groupBy({
      by: ['roleId'],
      _count: { id: true },
    }));
  }
}

module.exports = new UserRepository();
