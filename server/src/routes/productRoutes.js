const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// Public Product Endpoints
router.get('/', productController.getAllProducts);
router.get('/:slug', productController.getProductBySlug);

// Admin-Only Endpoint (Protected via JWT)
router.post('/', protect, productController.createProduct);

module.exports = router;