const express = require('express');
const warehouseController = require('../controllers/warehouseController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', warehouseController.getAll);
router.get('/active', warehouseController.getActive);
router.get('/:id', warehouseController.getById);
router.post('/', authorize('admin'), warehouseController.create);
router.put('/:id', authorize('admin'), warehouseController.update);
router.delete('/:id', authorize('admin'), warehouseController.delete);

module.exports = router;
