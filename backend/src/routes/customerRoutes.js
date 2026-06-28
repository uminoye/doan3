const express = require('express');
const customerController = require('../controllers/customerController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', customerController.getAll);
router.get('/:id', customerController.getById);
router.post('/', authorize('admin', 'sales'), customerController.create);
router.put('/:id', authorize('admin', 'sales'), customerController.update);
router.delete('/:id', authorize('admin'), customerController.delete);

module.exports = router;
