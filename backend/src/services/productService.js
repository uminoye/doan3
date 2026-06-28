const productRepository = require('../repositories/productRepository');
const prisma = require('../services/prisma');

function generateSku() {
  return 'SKU' + Date.now().toString().slice(-8);
}

class ProductService {
  async findAll(queryString) {
    return productRepository.findAll(queryString);
  }

  async findById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw Object.assign(new Error('Sản phẩm không tồn tại'), { statusCode: 404 });
    }
    return product;
  }

  async create(data) {
    const sku = data.sku && data.sku.trim() ? data.sku.trim() : generateSku();
    return productRepository.create({ ...data, sku });
  }

  async update(id, data) {
    return productRepository.update(id, data);
  }

  async delete(id) {
    return productRepository.delete(id);
  }

  async getCategories() {
    return productRepository.getCategories();
  }
}

module.exports = new ProductService();
