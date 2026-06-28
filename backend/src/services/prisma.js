const { PrismaClient } = require('@prisma/client');

function serializeDecimal(key, value) {
  if (typeof value === 'object' && value !== null && value.constructor.name === 'Decimal') {
    return value.toString();
  }
  return value;
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Convert Prisma Decimal → string so JSON.stringify never crashes
prisma.$use(async (params, next) => {
  const result = await next(params);
  if (result == null) return result;
  return JSON.parse(JSON.stringify(result, serializeDecimal));
});

module.exports = prisma;
