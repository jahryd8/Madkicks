const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// ==========================
// PUBLIC ROUTES
// ==========================

// GET /api/products - Fetch all products (supports ?category= & ?brand= filters)
router.get('/', productController.getAllProducts);

// GET /api/products/search - Search products by title/query (Must be before :slug/:id)
// router.get('/search', productController.searchProducts);

// GET /api/products/:id - Fetch single product with its size variants
router.get('/:id', productController.getProductById);

// GET /api/products/slug/:slug - Fetch product by URL slug
router.get('/slug/:slug', productController.getProductBySlug);

// ==========================
// PROTECTED / ADMIN ROUTES
// ==========================

// Apply auth + admin restriction to all routes below
router.use(protect);
router.use(restrictTo('admin'));

// POST /api/products - Create a new base product
router.post('/', productController.createProduct);

// PUT /api/products/:id - Update product details
router.put('/:id', productController.updateProduct);

// DELETE /api/products/:id - Soft delete or remove product
router.delete('/:id', productController.deleteProduct);

// POST /api/products/:id/variants - Add sizes/stock to a specific product
router.post('/:id/variants', productController.addVariant);

module.exports = router;