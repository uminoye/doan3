// Sinh mã tự động
function generateCode(prefix, number) {
  const padded = String(number).padStart(4, '0');
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${prefix}-${month}${String(date.getFullYear()).slice(-2)}-${padded}`;
}

module.exports = { generateCode };
