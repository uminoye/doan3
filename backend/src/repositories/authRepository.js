const prisma = require('../services/prisma');

class AuthRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }
}

module.exports = new AuthRepository();
