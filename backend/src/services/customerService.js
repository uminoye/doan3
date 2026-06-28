const customerRepository = require('../repositories/customerRepository');
const prisma = require('../services/prisma');

function generateCode(prefix) {
  return prefix + Date.now().toString().slice(-6);
}

class CustomerService {
  async findAll(queryString) {
    return customerRepository.findAll(queryString);
  }

  async findById(id) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw Object.assign(new Error('Khách hàng không tồn tại'), { statusCode: 404 });
    }
    return customer;
  }

  async create(data) {
    const customerCode = data.customerCode && data.customerCode.trim()
      ? data.customerCode.trim()
      : generateCode('KH');
    return customerRepository.create({ ...data, customerCode });
  }

  async update(id, data) {
    return customerRepository.update(id, data);
  }

  async delete(id) {
    return customerRepository.delete(id);
  }
}

module.exports = new CustomerService();
