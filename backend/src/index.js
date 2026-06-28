const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const customerRoutes = require('./routes/customerRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const productRoutes = require('./routes/productRoutes');
const productionReceiptRoutes = require('./routes/productionReceiptRoutes');
const salesOrderRoutes = require('./routes/salesOrderRoutes');
const deliveryRequestRoutes = require('./routes/deliveryRequestRoutes');
const stockOutboundRoutes = require('./routes/stockOutboundRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/production-receipts', productionReceiptRoutes);
app.use('/api/sales-orders', salesOrderRoutes);
app.use('/api/delivery-requests', deliveryRequestRoutes);
app.use('/api/stock-outbounds', stockOutboundRoutes);
app.use('/api/inventory', inventoryRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint không tồn tại' });
});

// Error handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

module.exports = app;
