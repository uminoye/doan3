const express = require('express');
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', productController.getAll);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getById);
router.post('/', authorize('admin'), productController.create);
router.put('/:id', authorize('admin'), productController.update);
router.delete('/:id', authorize('admin'), productController.delete);

module.exports = router;
