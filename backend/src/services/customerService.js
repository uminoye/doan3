const customerRepository = require('../repositories/customerRepository');

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
    return customerRepository.create(data);
  }

  async update(id, data) {
    return customerRepository.update(id, data);
  }

  async delete(id) {
    return customerRepository.delete(id);
  }
}

module.exports = new CustomerService();
