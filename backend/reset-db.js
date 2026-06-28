require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function reset() {
  console.log('Bắt đầu reset database...');

  await prisma.$transaction([
    // Xóa bảng con trước (theo thứ tự không phụ thuộc lẫn nhau)
    prisma.deliveryRequest.deleteMany(),
    prisma.stockOutboundNoteItem.deleteMany(),
    prisma.productionReceiptItem.deleteMany(),
    prisma.salesOrderItem.deleteMany(),
    prisma.inventoryTransaction.deleteMany(),
    prisma.inventoryBalance.deleteMany(),

    // Xóa bảng cha
    prisma.stockOutboundNote.deleteMany(),
    prisma.productionReceipt.deleteMany(),
    prisma.salesOrder.deleteMany(),

    // Xóa bảng độc lập
    prisma.product.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.warehouse.deleteMany(),
    prisma.user.deleteMany(),
    prisma.role.deleteMany(),
  ]);

  // Reset sequences về 1
  await prisma.$executeRawUnsafe(`
    SELECT 'reset' FROM pg_catalog.pg_class
    WHERE relkind IN ('r', 'S') AND relname IN (
      'roles','users','customers','warehouses','products',
      'production_receipts','production_receipt_items',
      'sales_orders','sales_order_items',
      'delivery_requests',
      'stock_outbound_notes','stock_outbound_note_items',
      'inventory_balances','inventory_transactions'
    );
  `);

  const sequences = [
    'roles_id_seq', 'users_id_seq', 'customers_id_seq', 'warehouses_id_seq',
    'products_id_seq', 'production_receipts_id_seq', 'production_receipt_items_id_seq',
    'sales_orders_id_seq', 'sales_order_items_id_seq', 'delivery_requests_id_seq',
    'stock_outbound_notes_id_seq', 'stock_outbound_note_items_id_seq',
    'inventory_balances_id_seq', 'inventory_transactions_id_seq',
  ];

  for (const seq of sequences) {
    try {
      await prisma.$executeRawUnsafe(`SELECT setval('${seq}', 1, false);`);
    } catch (e) {
      // bỏ qua nếu sequence không tồn tại
    }
  }

  console.log('Reset thành công!');
}

reset()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
