const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const paymentController = require('./controllers/paymentController');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. CORS Setup (Sanitizes origins and strips trailing slashes)
const rawOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
  process.env.CLIENT_APP_URL,
].filter(Boolean);

// Strip trailing slashes from allowed origins to match browser Origin headers strictly
const allowedOrigins = rawOrigins.map((origin) => origin.replace(/\/$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy violation: Origin '${origin}' not allowed.`));
    },
    credentials: true,
  })
);

// 2. Stripe Webhook (MUST be defined before express.json() to preserve raw Buffer)
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleStripeWebhook
);

// 3. Global Middleware for Parsing JSON & URL-encoded Bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🔥 Welcome to the MadKicks API!',
  });
});

// 5. 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot find ${req.originalUrl} on this server!`,
  });
});

// 6. Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});