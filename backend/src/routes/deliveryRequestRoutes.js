const express = require('express');
const deliveryRequestController = require('../controllers/deliveryRequestController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('admin', 'logistics'), deliveryRequestController.getAll);
router.get('/:id', authorize('admin', 'logistics'), deliveryRequestController.getById);
router.post('/', authorize('admin', 'logistics'), deliveryRequestController.create);
router.post('/:id/transfer', authorize('admin', 'logistics'), deliveryRequestController.transferToWarehouse);
router.delete('/:id', authorize('admin', 'logistics'), deliveryRequestController.cancel);

module.exports = router;
