const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const paymentController = require('./controllers/paymentController');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// 1. Stripe Webhook (MUST be mounted before global express.json middleware)
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleStripeWebhook
);

// 2. Global Middleware for JSON parsing
app.use(express.json());

// 3. Mount Standard API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Root Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🔥 Welcome to the MadKicks API!',
  });
});

// 4. Global 404 Handler for Unmatched Routes
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot find ${req.originalUrl} on this server!`,
  });
});

// 5. Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});