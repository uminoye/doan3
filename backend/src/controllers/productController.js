const productService = require('../services/productService');

class ProductController {
  async getAll(req, res, next) {
    try {
      console.log('[GET /api/products] query:', req.query);
      const result = await productService.findAll(req.query);
      res.json(result);
    } catch (err) {
      console.error('[GET /api/products] ERROR:', err.message, err.stack);
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await productService.findById(parseInt(req.params.id));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const result = await productService.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const result = await productService.update(parseInt(req.params.id), req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await productService.delete(parseInt(req.params.id));
      res.json({ message: 'Xóa sản phẩm thành công' });
    } catch (err) {
      next(err);
    }
  }

  async getCategories(req, res, next) {
    try {
      const result = await productService.getCategories();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProductController();
