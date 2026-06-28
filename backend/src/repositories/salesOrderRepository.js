const prisma = require('../services/prisma');
const { serialize } = require('../utils/serialize');

class SalesOrderRepository {
  async findAll(queryString = {}) {
    const where = {};
    if (queryString.customerId) where.customerId = parseInt(queryString.customerId);
    if (queryString.status) where.status = queryString.status;
    if (queryString.createdBy) where.createdBy = parseInt(queryString.createdBy);
    if (queryString.startDate && queryString.endDate) {
      where.orderDate = { gte: new Date(queryString.startDate), lte: new Date(queryString.endDate) };
    }

    const page = parseInt(queryString.page) || 1;
    const limit = parseInt(queryString.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.salesOrder.findMany({
        where,
        include: {
          customer: true,
          creator: { select: { id: true, fullName: true } },
          items: { include: { product: true } },
          deliveryRequest: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.salesOrder.count({ where }),
    ]);

    return { data: serialize(data), total };
  }

  async findById(id) {
    return serialize(await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        creator: { select: { id: true, fullName: true } },
        items: { include: { product: true } },
        deliveryRequest: true,
        stockOutboundNotes: true,
      },
    }));
  }

  async create(data, items) {
    return serialize(await prisma.salesOrder.create({
      data: { ...data, items: { create: items } },
      include: { customer: true, items: { include: { product: true } } },
    }));
  }

  async update(id, data, items) {
    return serialize(await prisma.$transaction(async (tx) => {
      const updated = await tx.salesOrder.update({
        where: { id },
        data: {
          ...data,
          items: items
            ? {
                deleteMany: {},
                create: items,
              }
            : undefined,
        },
        include: { customer: true, items: { include: { product: true } } },
      });
      return updated;
    }));
  }

  async updateStatus(id, status) {
    return serialize(await prisma.salesOrder.update({ where: { id }, data: { status } }));
  }

  async delete(id) {
    return serialize(await prisma.salesOrder.delete({ where: { id } }));
  }
}

module.exports = new SalesOrderRepository();
