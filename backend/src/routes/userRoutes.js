const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('admin'), userController.getAll);
router.get('/:id', userController.getById);
router.post('/', authorize('admin'), userController.create);
router.put('/:id', authorize('admin'), userController.update);
router.delete('/:id', authorize('admin'), userController.delete);

module.exports = router;
