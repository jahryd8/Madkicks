const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// MUST use express.raw to preserve raw buffer for signature verification
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.handleStripeWebhook
);

module.exports = router;