const prisma = require('../services/prisma');
const { serialize } = require('../utils/serialize');

class StockOutboundRepository {
  async findAll(queryString = {}) {
    const where = {};
    if (queryString.warehouseId) where.warehouseId = parseInt(queryString.warehouseId);
    if (queryString.status) where.status = queryString.status;
    if (queryString.startDate && queryString.endDate) {
      where.exportDate = { gte: new Date(queryString.startDate), lte: new Date(queryString.endDate) };
    }

    const page = parseInt(queryString.page) || 1;
    const limit = parseInt(queryString.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.stockOutboundNote.findMany({
        where,
        include: {
          warehouse: true,
          salesOrder: { include: { customer: true } },
          creator: { select: { id: true, fullName: true } },
          items: { include: { product: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.stockOutboundNote.count({ where }),
    ]);

    return { data: serialize(data), total };
  }

  async findById(id) {
    return serialize(await prisma.stockOutboundNote.findUnique({
      where: { id },
      include: {
        warehouse: true,
        salesOrder: { include: { customer: true } },
        creator: { select: { id: true, fullName: true } },
        items: { include: { product: true } },
      },
    }));
  }

  async create(data, items) {
    return serialize(await prisma.stockOutboundNote.create({
      data: { ...data, items: { create: items } },
      include: { warehouse: true, items: { include: { product: true } } },
    }));
  }

  async update(id, data, items) {
    return serialize(await prisma.$transaction(async (tx) => {
      const updated = await tx.stockOutboundNote.update({
        where: { id },
        data: {
          ...data,
          items: items ? { deleteMany: {}, create: items } : undefined,
        },
        include: { warehouse: true, items: { include: { product: true } } },
      });
      return updated;
    }));
  }

  async confirm(id) {
    return serialize(await prisma.$transaction(async (tx) => {
      const note = await tx.stockOutboundNote.update({
        where: { id },
        data: { status: 'confirmed' },
        include: { items: true, warehouse: true, salesOrder: true },
      });

      for (const item of note.items) {
        const balance = await tx.inventoryBalance.findUnique({
          where: { warehouseId_productId: { warehouseId: note.warehouseId, productId: item.productId } },
        });

        if (!balance || Number(balance.onHandQty) < Number(item.quantity)) {
          throw new Error(`Không đủ tồn kho cho sản phẩm ID ${item.productId}`);
        }

        await tx.inventoryBalance.update({
          where: { warehouseId_productId: { warehouseId: note.warehouseId, productId: item.productId } },
          data: { onHandQty: { decrement: item.quantity } },
        });

        await tx.inventoryTransaction.create({
          data: {
            warehouseId: note.warehouseId,
            productId: item.productId,
            transactionType: 'OUT',
            quantity: item.quantity,
            referenceType: 'stock_outbound',
            referenceId: note.id,
          },
        });
      }

      if (note.salesOrderId) {
        await tx.salesOrder.update({
          where: { id: note.salesOrderId },
          data: { status: 'completed' },
        });
      }

      return note;
    }));
  }

  async delete(id) {
    return serialize(await prisma.stockOutboundNote.delete({ where: { id } }));
  }
}

module.exports = new StockOutboundRepository();
