const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu seed...');

  // 1. ROLES
  const roles = await Promise.all([
    prisma.role.create({ data: { name: 'admin', description: 'Quản trị hệ thống' } }),
    prisma.role.create({ data: { name: 'sales', description: 'Nhân viên kinh doanh' } }),
    prisma.role.create({ data: { name: 'logistics', description: 'Nhân viên logistics' } }),
    prisma.role.create({ data: { name: 'warehouse', description: 'Nhân viên kho' } }),
    prisma.role.create({ data: { name: 'factory', description: 'Nhân viên nhà máy' } }),
  ]);
  console.log('Đã tạo roles');

  const passwordHash = await bcrypt.hash('123456', 10);

  // 2. USERS
  await Promise.all([
    prisma.user.create({ data: { fullName: 'Nguyễn Văn Admin', email: 'admin@company.com', passwordHash, roleId: roles[0].id } }),
    prisma.user.create({ data: { fullName: 'Trần Thị Sales', email: 'sales1@company.com', passwordHash, roleId: roles[1].id } }),
    prisma.user.create({ data: { fullName: 'Lê Hoàng Sales', email: 'sales2@company.com', passwordHash, roleId: roles[1].id } }),
    prisma.user.create({ data: { fullName: 'Phạm Đình Logistics', email: 'logistics@company.com', passwordHash, roleId: roles[2].id } }),
    prisma.user.create({ data: { fullName: 'Hoàng Văn Kho', email: 'warehouse@company.com', passwordHash, roleId: roles[3].id } }),
    prisma.user.create({ data: { fullName: 'Ngô Thị Nhà Máy', email: 'factory@company.com', passwordHash, roleId: roles[4].id } }),
  ]);
  console.log('Đã tạo users');

  // 3. WAREHOUSES
  const warehouses = await Promise.all([
    prisma.warehouse.create({ data: { warehouseCode: 'WH001', name: 'Kho Tổng Hà Nội', location: 'Quận Long Biên, Hà Nội' } }),
    prisma.warehouse.create({ data: { warehouseCode: 'WH002', name: 'Kho Chi Nhánh Đà Nẵng', location: 'Quận Hải Châu, Đà Nẵng' } }),
  ]);
  console.log('Đã tạo warehouses');

  // 4. PRODUCTS
  const products = await Promise.all([
    prisma.product.create({ data: { sku: 'SKU001', name: 'Bánh Trung Thu Truyền Thống', unit: 'hộp', category: 'Bánh Trung Thu', salePrice: 85000 } }),
    prisma.product.create({ data: { sku: 'SKU002', name: 'Bánh Trung Thu Thập Cẩm', unit: 'hộp', category: 'Bánh Trung Thu', salePrice: 95000 } }),
    prisma.product.create({ data: { sku: 'SKU003', name: 'Bánh Trung Thu Đặc Biệt', unit: 'hộp', category: 'Bánh Trung Thu', salePrice: 120000 } }),
    prisma.product.create({ data: { sku: 'SKU004', name: 'Bánh Pía Sóc Trăng', unit: 'hộp', category: 'Bánh Pía', salePrice: 75000 } }),
    prisma.product.create({ data: { sku: 'SKU005', name: 'Bánh Pía Đặc Biệt', unit: 'hộp', category: 'Bánh Pía', salePrice: 98000 } }),
    prisma.product.create({ data: { sku: 'SKU006', name: 'Bánh Gai Nhài', unit: 'hộp', category: 'Bánh Gai', salePrice: 68000 } }),
    prisma.product.create({ data: { sku: 'SKU007', name: 'Bánh Cống Sóc Trăng', unit: 'hộp', category: 'Bánh Đặc Sản', salePrice: 88000 } }),
    prisma.product.create({ data: { sku: 'SKU008', name: 'Bánh Pía Mini', unit: 'hộp', category: 'Bánh Pía', salePrice: 45000 } }),
  ]);
  console.log('Đã tạo products');

  // 5. CUSTOMERS
  await Promise.all([
    prisma.customer.create({ data: { customerCode: 'KH001', name: 'Cửa Hàng Bánh Ngọt Sài Gòn', phone: '0901234567', address: '123 Nguyễn Trãi, Quận 1, TP.HCM', contactPerson: 'Chị Lan', createdBy: 2 } }),
    prisma.customer.create({ data: { customerCode: 'KH002', name: 'Siêu Thị Miền Bắc', phone: '0912345678', address: '456 Trần Duy Hưng, Cầu Giấy, Hà Nội', contactPerson: 'Anh Tuấn', createdBy: 2 } }),
    prisma.customer.create({ data: { customerCode: 'KH003', name: 'Đại Lý Bánh Tân Phú', phone: '0934567890', address: '78 Lê Văn Sỹ, Quận Tân Phú, TP.HCM', contactPerson: 'Chị Hương', createdBy: 3 } }),
    prisma.customer.create({ data: { customerCode: 'KH004', name: 'Cửa Hàng Đặc Sản Miền Trung', phone: '0945678901', address: '32 Trần Phú, Đà Nẵng', contactPerson: 'Anh Hùng', createdBy: 2 } }),
    prisma.customer.create({ data: { customerCode: 'KH005', name: 'Chuỗi Bánh Ngon Việt', phone: '0956789012', address: '88 Nguyễn Huệ, Quận 1, TP.HCM', contactPerson: 'Chị Mai', createdBy: 3 } }),
  ]);
  console.log('Đã tạo customers');

  // 6. PRODUCTION RECEIPTS (đã xác nhận - tự động cộng tồn)
  const receipt1 = await prisma.productionReceipt.create({
    data: {
      receiptNo: 'PN-0001',
      warehouseId: warehouses[0].id,
      receiptDate: new Date(Date.now() - 10 * 86400000),
      status: 'confirmed',
      createdBy: 6,
      items: {
        create: [
          { productId: products[0].id, quantity: 500 },
          { productId: products[1].id, quantity: 400 },
          { productId: products[2].id, quantity: 200 },
        ],
      },
    },
  });

  // Tự động cập nhật tồn kho
  for (const item of [{ pid: products[0].id, qty: 500 }, { pid: products[1].id, qty: 400 }, { pid: products[2].id, qty: 200 }]) {
    await prisma.inventoryBalance.upsert({
      where: { warehouseId_productId: { warehouseId: warehouses[0].id, productId: item.pid } },
      create: { warehouseId: warehouses[0].id, productId: item.pid, onHandQty: item.qty },
      update: { onHandQty: { increment: item.qty } },
    });
    await prisma.inventoryTransaction.create({
      data: { warehouseId: warehouses[0].id, productId: item.pid, transactionType: 'IN', quantity: item.qty, referenceType: 'production_receipt', referenceId: receipt1.id },
    });
  }

  const receipt2 = await prisma.productionReceipt.create({
    data: {
      receiptNo: 'PN-0002',
      warehouseId: warehouses[0].id,
      receiptDate: new Date(Date.now() - 7 * 86400000),
      status: 'confirmed',
      createdBy: 6,
      items: {
        create: [
          { productId: products[0].id, quantity: 300 },
          { productId: products[3].id, quantity: 250 },
          { productId: products[4].id, quantity: 150 },
        ],
      },
    },
  });

  for (const item of [{ pid: products[0].id, qty: 300 }, { pid: products[3].id, qty: 250 }, { pid: products[4].id, qty: 150 }]) {
    await prisma.inventoryBalance.upsert({
      where: { warehouseId_productId: { warehouseId: warehouses[0].id, productId: item.pid } },
      create: { warehouseId: warehouses[0].id, productId: item.pid, onHandQty: item.qty },
      update: { onHandQty: { increment: item.qty } },
    });
    await prisma.inventoryTransaction.create({
      data: { warehouseId: warehouses[0].id, productId: item.pid, transactionType: 'IN', quantity: item.qty, referenceType: 'production_receipt', referenceId: receipt2.id },
    });
  }

  const receipt3 = await prisma.productionReceipt.create({
    data: {
      receiptNo: 'PN-0003',
      warehouseId: warehouses[0].id,
      receiptDate: new Date(Date.now() - 3 * 86400000),
      status: 'confirmed',
      createdBy: 6,
      items: {
        create: [
          { productId: products[0].id, quantity: 600 },
          { productId: products[1].id, quantity: 500 },
          { productId: products[2].id, quantity: 300 },
          { productId: products[5].id, quantity: 400 },
        ],
      },
    },
  });

  for (const item of [{ pid: products[0].id, qty: 600 }, { pid: products[1].id, qty: 500 }, { pid: products[2].id, qty: 300 }, { pid: products[5].id, qty: 400 }]) {
    await prisma.inventoryBalance.upsert({
      where: { warehouseId_productId: { warehouseId: warehouses[0].id, productId: item.pid } },
      create: { warehouseId: warehouses[0].id, productId: item.pid, onHandQty: item.qty },
      update: { onHandQty: { increment: item.qty } },
    });
    await prisma.inventoryTransaction.create({
      data: { warehouseId: warehouses[0].id, productId: item.pid, transactionType: 'IN', quantity: item.qty, referenceType: 'production_receipt', referenceId: receipt3.id },
    });
  }

  const receipt4 = await prisma.productionReceipt.create({
    data: {
      receiptNo: 'PN-0004',
      warehouseId: warehouses[1].id,
      receiptDate: new Date(Date.now() - 5 * 86400000),
      status: 'confirmed',
      createdBy: 6,
      items: {
        create: [
          { productId: products[0].id, quantity: 200 },
          { productId: products[1].id, quantity: 200 },
          { productId: products[6].id, quantity: 150 },
          { productId: products[7].id, quantity: 300 },
        ],
      },
    },
  });

  for (const item of [{ pid: products[0].id, qty: 200 }, { pid: products[1].id, qty: 200 }, { pid: products[6].id, qty: 150 }, { pid: products[7].id, qty: 300 }]) {
    await prisma.inventoryBalance.upsert({
      where: { warehouseId_productId: { warehouseId: warehouses[1].id, productId: item.pid } },
      create: { warehouseId: warehouses[1].id, productId: item.pid, onHandQty: item.qty },
      update: { onHandQty: { increment: item.qty } },
    });
    await prisma.inventoryTransaction.create({
      data: { warehouseId: warehouses[1].id, productId: item.pid, transactionType: 'IN', quantity: item.qty, referenceType: 'production_receipt', referenceId: receipt4.id },
    });
  }

  // 7. SALES ORDERS
  const order1 = await prisma.salesOrder.create({
    data: {
      orderNo: 'DH-0001', customerId: 1, orderDate: new Date(Date.now() - 5 * 86400000),
      deliveryDate: new Date(Date.now() - 2 * 86400000), status: 'completed', createdBy: 2,
      items: { create: [{ productId: products[0].id, quantity: 100, unitPrice: 85000 }, { productId: products[1].id, quantity: 80, unitPrice: 95000 }] },
    },
  });

  const order2 = await prisma.salesOrder.create({
    data: {
      orderNo: 'DH-0002', customerId: 2, orderDate: new Date(Date.now() - 4 * 86400000),
      deliveryDate: new Date(Date.now() - 1 * 86400000), status: 'completed', createdBy: 2,
      items: { create: [{ productId: products[0].id, quantity: 200, unitPrice: 85000 }, { productId: products[2].id, quantity: 100, unitPrice: 120000 }, { productId: products[3].id, quantity: 150, unitPrice: 75000 }] },
    },
  });

  const order3 = await prisma.salesOrder.create({
    data: {
      orderNo: 'DH-0003', customerId: 3, orderDate: new Date(Date.now() - 3 * 86400000),
      deliveryDate: new Date(Date.now() + 2 * 86400000), status: 'logistics_received', createdBy: 3,
      items: { create: [{ productId: products[1].id, quantity: 120, unitPrice: 95000 }, { productId: products[4].id, quantity: 60, unitPrice: 98000 }] },
    },
  });

  const order4 = await prisma.salesOrder.create({
    data: {
      orderNo: 'DH-0004', customerId: 4, orderDate: new Date(Date.now() - 2 * 86400000),
      deliveryDate: new Date(Date.now() + 3 * 86400000), status: 'submitted', createdBy: 2,
      items: { create: [{ productId: products[0].id, quantity: 80, unitPrice: 85000 }, { productId: products[5].id, quantity: 100, unitPrice: 68000 }, { productId: products[6].id, quantity: 50, unitPrice: 88000 }] },
    },
  });

  const order5 = await prisma.salesOrder.create({
    data: {
      orderNo: 'DH-0005', customerId: 5, orderDate: new Date(Date.now() - 1 * 86400000),
      deliveryDate: new Date(Date.now() + 1 * 86400000), status: 'draft', createdBy: 3,
      items: { create: [{ productId: products[0].id, quantity: 50, unitPrice: 85000 }, { productId: products[7].id, quantity: 100, unitPrice: 45000 }] },
    },
  });

  // 8. DELIVERY REQUESTS
  await prisma.deliveryRequest.create({
    data: { salesOrderId: order1.id, receivedBy: 4, status: 'confirmed', note: 'Đơn ổn định' },
  });
  await prisma.deliveryRequest.create({
    data: { salesOrderId: order2.id, receivedBy: 4, status: 'confirmed', note: 'Đơn lớn, cần xe lớn' },
  });
  await prisma.deliveryRequest.create({
    data: { salesOrderId: order3.id, receivedBy: 4, status: 'transferred', note: 'Khách gần, giao nhanh' },
  });

  // 9. STOCK OUTBOUND NOTES (đã xác nhận - tự động trừ tồn)
  const outbound1 = await prisma.stockOutboundNote.create({
    data: {
      noteNo: 'PX-0001', salesOrderId: order1.id, warehouseId: warehouses[0].id,
      exportDate: new Date(Date.now() - 2 * 86400000), status: 'confirmed', createdBy: 5,
      items: {
        create: [
          { productId: products[0].id, quantity: 100 },
          { productId: products[1].id, quantity: 80 },
        ],
      },
    },
  });

  for (const item of [{ pid: products[0].id, qty: 100 }, { pid: products[1].id, qty: 80 }]) {
    await prisma.inventoryBalance.update({
      where: { warehouseId_productId: { warehouseId: warehouses[0].id, productId: item.pid } },
      data: { onHandQty: { decrement: item.qty } },
    });
    await prisma.inventoryTransaction.create({
      data: { warehouseId: warehouses[0].id, productId: item.pid, transactionType: 'OUT', quantity: item.qty, referenceType: 'stock_outbound', referenceId: outbound1.id },
    });
  }

  const outbound2 = await prisma.stockOutboundNote.create({
    data: {
      noteNo: 'PX-0002', salesOrderId: order2.id, warehouseId: warehouses[0].id,
      exportDate: new Date(Date.now() - 1 * 86400000), status: 'confirmed', createdBy: 5,
      items: {
        create: [
          { productId: products[0].id, quantity: 200 },
          { productId: products[2].id, quantity: 100 },
          { productId: products[3].id, quantity: 150 },
        ],
      },
    },
  });

  for (const item of [{ pid: products[0].id, qty: 200 }, { pid: products[2].id, qty: 100 }, { pid: products[3].id, qty: 150 }]) {
    await prisma.inventoryBalance.update({
      where: { warehouseId_productId: { warehouseId: warehouses[0].id, productId: item.pid } },
      data: { onHandQty: { decrement: item.qty } },
    });
    await prisma.inventoryTransaction.create({
      data: { warehouseId: warehouses[0].id, productId: item.pid, transactionType: 'OUT', quantity: item.qty, referenceType: 'stock_outbound', referenceId: outbound2.id },
    });
  }

  console.log('Seed hoàn tất!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
