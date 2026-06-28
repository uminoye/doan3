const prisma = require('../services/prisma');
const { serialize } = require('../utils/serialize');

class InventoryRepository {
  async getBalances(queryString = {}) {
    const where = {};
    if (queryString.warehouseId) where.warehouseId = parseInt(queryString.warehouseId);
    if (queryString.productId) where.productId = parseInt(queryString.productId);

    const page = parseInt(queryString.page) || 1;
    const limit = parseInt(queryString.limit) || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.inventoryBalance.findMany({
        where,
        include: {
          warehouse: true,
          product: true,
        },
        orderBy: { product: { name: 'asc' } },
        skip,
        take: limit,
      }),
      prisma.inventoryBalance.count({ where }),
    ]);

    return { data: serialize(data), total };
  }

  async getTransactions(queryString = {}) {
    const where = {};
    if (queryString.warehouseId) where.warehouseId = parseInt(queryString.warehouseId);
    if (queryString.productId) where.productId = parseInt(queryString.productId);
    if (queryString.transactionType) where.transactionType = queryString.transactionType;
    if (queryString.startDate && queryString.endDate) {
      where.transactionDate = {
        gte: new Date(queryString.startDate),
        lte: new Date(queryString.endDate + 'T23:59:59'),
      };
    }

    const page = parseInt(queryString.page) || 1;
    const limit = parseInt(queryString.limit) || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        include: {
          warehouse: true,
          product: true,
          creator: { select: { fullName: true } },
        },
        orderBy: { transactionDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.inventoryTransaction.count({ where }),
    ]);

    return { data: serialize(data), total };
  }

  async getInwardReport(queryString = {}) {
    const where = { transactionType: 'IN' };
    if (queryString.warehouseId) where.warehouseId = parseInt(queryString.warehouseId);
    if (queryString.startDate && queryString.endDate) {
      where.transactionDate = {
        gte: new Date(queryString.startDate),
        lte: new Date(queryString.endDate + 'T23:59:59'),
      };
    }

    const data = await prisma.inventoryTransaction.groupBy({
      by: ['productId', 'warehouseId'],
      where,
      _sum: { quantity: true },
    });

    const enriched = await Promise.all(
      data.map(async (d) => {
        const [product, warehouse] = await Promise.all([
          prisma.product.findUnique({ where: { id: d.productId } }),
          prisma.warehouse.findUnique({ where: { id: d.warehouseId } }),
        ]);
        return { product, warehouse, totalIn: Number(d._sum.quantity) };
      })
    );

    return serialize(enriched);
  }

  async getOutwardReport(queryString = {}) {
    const where = { transactionType: 'OUT' };
    if (queryString.warehouseId) where.warehouseId = parseInt(queryString.warehouseId);
    if (queryString.startDate && queryString.endDate) {
      where.transactionDate = {
        gte: new Date(queryString.startDate),
        lte: new Date(queryString.endDate + 'T23:59:59'),
      };
    }

    const data = await prisma.inventoryTransaction.groupBy({
      by: ['productId', 'warehouseId'],
      where,
      _sum: { quantity: true },
    });

    const enriched = await Promise.all(
      data.map(async (d) => {
        const [product, warehouse] = await Promise.all([
          prisma.product.findUnique({ where: { id: d.productId } }),
          prisma.warehouse.findUnique({ where: { id: d.warehouseId } }),
        ]);
        return { product, warehouse, totalOut: Number(d._sum.quantity) };
      })
    );

    return serialize(enriched);
  }

  async getDashboard() {
    const [totalProducts, totalCustomers, totalOrders, totalReceipts] = await Promise.all([
      prisma.product.count(),
      prisma.customer.count(),
      prisma.salesOrder.count(),
      prisma.productionReceipt.count(),
    ]);

    const recentInward = await prisma.inventoryTransaction.findMany({
      where: { transactionType: 'IN' },
      include: { product: true, warehouse: true },
      orderBy: { transactionDate: 'desc' },
      take: 5,
    });

    const recentOutward = await prisma.inventoryTransaction.findMany({
      where: { transactionType: 'OUT' },
      include: { product: true, warehouse: true },
      orderBy: { transactionDate: 'desc' },
      take: 5,
    });

    const lowStock = await prisma.inventoryBalance.findMany({
      where: { onHandQty: { lt: 50 } },
      include: { product: true, warehouse: true },
      orderBy: { onHandQty: 'asc' },
      take: 10,
    });

    return {
      totalProducts,
      totalCustomers,
      totalOrders,
      totalReceipts,
      recentInward: serialize(recentInward),
      recentOutward: serialize(recentOutward),
      lowStock: serialize(lowStock),
    };
  }
}

module.exports = new InventoryRepository();
