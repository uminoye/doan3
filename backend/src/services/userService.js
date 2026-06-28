const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');

class UserService {
  async findAll(queryString) {
    return userRepository.findAll(queryString);
  }

  async findById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw Object.assign(new Error('Người dùng không tồn tại'), { statusCode: 404 });
    }
    return user;
  }

  async create(data) {
    const passwordHash = await bcrypt.hash(data.password || '123456', 10);
    return userRepository.create({ ...data, passwordHash });
  }

  async update(id, data) {
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }
    return userRepository.update(id, data);
  }

  async delete(id) {
    return userRepository.delete(id);
  }

  async getStats() {
    const counts = await userRepository.countByRole();
    return counts;
  }
}

module.exports = new UserService();
