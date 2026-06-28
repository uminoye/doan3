require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function markMigrated() {
  try {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES (gen_random_uuid(), '', NOW(), '20260101000000_init', '', NULL, NOW(), 1)
      ON CONFLICT DO NOTHING
    `);
    console.log('Migration marked as applied!');
  } catch (e) {
    // Bảng _prisma_migrations có thể chưa tồn tại nếu db được tạo bằng cách khác
    console.error('Lỗi:', e.message);
  }
}

markMigrated().finally(() => prisma.$disconnect());
