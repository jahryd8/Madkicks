const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// =========================================================================
// PROTECTED PAYMENT ROUTES
// (Note: /webhook is handled directly in index.js to apply express.raw())
// =========================================================================

// POST /api/payments/create-checkout-session
// Generates a Stripe Checkout Session URL for a pending order
router.post(
  '/create-checkout-session',
  protect,
  paymentController.createCheckoutSession
);

module.exports = router;