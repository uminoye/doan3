const express = require('express');
const stockOutboundController = require('../controllers/stockOutboundController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('admin', 'warehouse'), stockOutboundController.getAll);
router.get('/:id', authorize('admin', 'warehouse'), stockOutboundController.getById);
router.post('/', authorize('admin', 'warehouse'), stockOutboundController.create);
router.put('/:id', authorize('admin', 'warehouse'), stockOutboundController.update);
router.post('/:id/confirm', authorize('admin', 'warehouse'), stockOutboundController.confirm);
router.post('/:id/cancel', authorize('admin', 'warehouse'), stockOutboundController.cancel);
router.delete('/:id', authorize('admin', 'warehouse'), stockOutboundController.delete);

module.exports = router;
