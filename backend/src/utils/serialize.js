// Convert Prisma Decimal → string so JSON.stringify doesn't crash
function serialize(result) {
  return JSON.parse(JSON.stringify(result, (_, value) => {
    if (typeof value === 'object' && value !== null && value.constructor.name === 'Decimal') {
      return value.toString();
    }
    return value;
  }));
}

module.exports = { serialize };
