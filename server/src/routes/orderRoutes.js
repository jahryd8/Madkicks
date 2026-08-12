const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { validateParamUuid } = require('../middleware/validateUuid');

// Require authentication for all order routes
router.use(protect);

// =========================================================================
// ORDER ROUTES
// =========================================================================

// POST /api/orders - Create new order (with stock locking & Stripe session generation)
// GET  /api/orders - Get all orders for the logged-in user
router
  .route('/')
  .post(orderController.createOrder)
  .get(orderController.getUserOrders);

// GET /api/orders/my-orders - Alias endpoint for logged-in user orders
// MUST be defined before /:id to prevent Express from treating "my-orders" as a UUID parameter
router
  .route('/my-orders')
  .get(orderController.getUserOrders);

// GET /api/orders/:id - Get a specific order by ID (belonging to current user)
// Param 'id' is pre-validated to ensure it is a valid UUID before hitting the DB query
router
  .route('/:id')
  .get(validateParamUuid('id'), orderController.getOrderById);

// PATCH /api/orders/:id/cancel - Cancel a pending order & restock inventory
router
  .route('/:id/cancel')
  .patch(validateParamUuid('id'), orderController.cancelOrder);

module.exports = router;