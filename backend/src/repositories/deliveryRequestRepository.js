const prisma = require('../services/prisma');
const { serialize } = require('../utils/serialize');

class DeliveryRequestRepository {
  async findAll(queryString = {}) {
    const where = {};
    if (queryString.status) where.status = queryString.status;
    if (queryString.receivedBy) where.receivedBy = parseInt(queryString.receivedBy);

    const page = parseInt(queryString.page) || 1;
    const limit = parseInt(queryString.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.deliveryRequest.findMany({
        where,
        include: {
          salesOrder: {
            include: { customer: true, items: { include: { product: true } } },
          },
          receiver: { select: { id: true, fullName: true } },
        },
        orderBy: { receivedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.deliveryRequest.count({ where }),
    ]);

    return { data: serialize(data), total };
  }

  async findById(id) {
    return serialize(await prisma.deliveryRequest.findUnique({
      where: { id },
      include: {
        salesOrder: { include: { customer: true, items: { include: { product: true } } } },
        receiver: { select: { id: true, fullName: true } },
      },
    }));
  }

  async create(data) {
    return serialize(await prisma.deliveryRequest.create({
      data,
      include: {
        salesOrder: { include: { customer: true, items: { include: { product: true } } } },
        receiver: { select: { fullName: true } },
      },
    }));
  }

  async updateStatus(id, status, note) {
    return serialize(await prisma.deliveryRequest.update({
      where: { id },
      data: { status, note },
      include: {
        salesOrder: { include: { customer: true } },
        receiver: { select: { fullName: true } },
      },
    }));
  }

  async delete(id) {
    return serialize(await prisma.deliveryRequest.delete({ where: { id } }));
  }
}

module.exports = new DeliveryRequestRepository();
