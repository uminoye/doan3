const prisma = require('../services/prisma');
const { serialize } = require('../utils/serialize');

class ProductionReceiptRepository {
  async findAll(queryString = {}) {
    const where = {};
    if (queryString.warehouseId) where.warehouseId = parseInt(queryString.warehouseId);
    if (queryString.status) where.status = queryString.status;
    if (queryString.startDate && queryString.endDate) {
      where.receiptDate = {
        gte: new Date(queryString.startDate),
        lte: new Date(queryString.endDate),
      };
    }

    const page = parseInt(queryString.page) || 1;
    const limit = parseInt(queryString.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.productionReceipt.findMany({
        where,
        include: {
          warehouse: true,
          creator: { select: { id: true, fullName: true } },
          items: { include: { product: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.productionReceipt.count({ where }),
    ]);

    return { data: serialize(data), total };
  }

  async findById(id) {
    return serialize(await prisma.productionReceipt.findUnique({
      where: { id },
      include: {
        warehouse: true,
        creator: { select: { id: true, fullName: true } },
        items: { include: { product: true } },
      },
    }));
  }

  async create(data, items) {
    return serialize(await prisma.productionReceipt.create({
      data: {
        ...data,
        items: { create: items },
      },
      include: {
        warehouse: true,
        items: { include: { product: true } },
      },
    }));
  }

  async update(id, data, items) {
    return serialize(await prisma.$transaction(async (tx) => {
      const updated = await tx.productionReceipt.update({
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
        include: { warehouse: true, items: { include: { product: true } } },
      });
      return updated;
    }));
  }

  async confirm(id) {
    return serialize(await prisma.$transaction(async (tx) => {
      const receipt = await tx.productionReceipt.update({
        where: { id },
        data: { status: 'confirmed' },
        include: { items: true, warehouse: true },
      });

      for (const item of receipt.items) {
        await tx.inventoryBalance.upsert({
          where: { warehouseId_productId: { warehouseId: receipt.warehouseId, productId: item.productId } },
          create: {
            warehouseId: receipt.warehouseId,
            productId: item.productId,
            onHandQty: item.quantity,
          },
          update: { onHandQty: { increment: item.quantity } },
        });

        await tx.inventoryTransaction.create({
          data: {
            warehouseId: receipt.warehouseId,
            productId: item.productId,
            transactionType: 'IN',
            quantity: item.quantity,
            referenceType: 'production_receipt',
            referenceId: receipt.id,
          },
        });
      }

      return receipt;
    }));
  }

  async delete(id) {
    return serialize(await prisma.productionReceipt.delete({ where: { id } }));
  }
}

module.exports = new ProductionReceiptRepository();
