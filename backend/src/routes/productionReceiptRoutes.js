const express = require('express');
const productionReceiptController = require('../controllers/productionReceiptController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('admin', 'factory', 'warehouse'), productionReceiptController.getAll);
router.get('/:id', authorize('admin', 'factory', 'warehouse'), productionReceiptController.getById);
router.post('/', authorize('admin', 'factory'), productionReceiptController.create);
router.put('/:id', authorize('admin', 'factory'), productionReceiptController.update);
router.post('/:id/confirm', authorize('admin', 'factory', 'warehouse'), productionReceiptController.confirm);
router.post('/:id/cancel', authorize('admin', 'factory'), productionReceiptController.cancel);
router.delete('/:id', authorize('admin', 'factory'), productionReceiptController.delete);

module.exports = router;
