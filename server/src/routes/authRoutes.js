const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public Auth Endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected Test Route (Returns current logged-in user payload)
router.get('/me', protect, (req, res) => {
  res.json({ status: 'success', user: req.user });
});

module.exports = router;