const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/balances', authorize('admin', 'warehouse', 'factory'), inventoryController.getBalances);
router.get('/transactions', authorize('admin', 'warehouse', 'factory'), inventoryController.getTransactions);
router.get('/reports/inward', authorize('admin', 'warehouse', 'factory'), inventoryController.getInwardReport);
router.get('/reports/outward', authorize('admin', 'warehouse', 'factory'), inventoryController.getOutwardReport);
router.get('/dashboard', inventoryController.getDashboard);

module.exports = router;
