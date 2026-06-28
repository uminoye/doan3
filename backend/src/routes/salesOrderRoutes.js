const express = require('express');
const salesOrderController = require('../controllers/salesOrderController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', salesOrderController.getAll);
router.get('/:id', salesOrderController.getById);
router.post('/', authorize('admin', 'sales'), salesOrderController.create);
router.put('/:id', authorize('admin', 'sales'), salesOrderController.update);
router.post('/:id/submit', authorize('admin', 'sales'), salesOrderController.submit);
router.post('/:id/cancel', authorize('admin', 'sales'), salesOrderController.cancel);
router.delete('/:id', authorize('admin', 'sales'), salesOrderController.delete);

module.exports = router;
