const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Require authentication for all order routes
router.use(protect);

// =========================================================================
// ORDER ROUTES
// =========================================================================

// POST /api/orders - Create a new order with stock validation
// GET  /api/orders - Get all orders for the logged-in user
router
  .route('/')
  .post(orderController.createOrder)
  .get(orderController.getUserOrders);

// GET /api/orders/:id - Get a specific order by ID (belonging to current user)
router
  .route('/:id')
  .get(orderController.getOrderById);

module.exports = router;