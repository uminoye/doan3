const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const tables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
  `;
  console.log('Tables in Neon:', tables.map(t => t.table_name).join(', '));

  const userCount = await prisma.user.count();
  console.log('Users count:', userCount);

  const productCount = await prisma.product.count();
  console.log('Products count:', productCount);

  await prisma.$disconnect();
}

check().catch(console.error);
