const jwt = require('jsonwebtoken');

// 1. Protect routes (Ensure user is logged in)
exports.protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ status: 'fail', message: 'You are not logged in. Please log in to get access.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains { id, role }
    next();
  } catch (error) {
    return res.status(401).json({ status: 'fail', message: 'Invalid or expired token.' });
  }
};

// 2. Restrict routes to specific roles (e.g. 'admin')
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user was set by protect middleware
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};