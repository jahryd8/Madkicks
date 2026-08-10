const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Helper function to generate JWT
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// 1. REGISTER USER
exports.register = async (req, res) => {
  const { email, password, full_name, phone_number } = req.body;

  // Validation
  if (!email || !password || !full_name) {
    return res.status(400).json({ status: 'fail', message: 'Please provide email, password, and full name.' });
  }

  try {
    // Check if user already exists
    const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ status: 'fail', message: 'An account with this email already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user into PostgreSQL
    const newUser = await db.query(
      `INSERT INTO users (email, password_hash, full_name, phone_number)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, phone_number, role, created_at`,
      [email.toLowerCase().trim(), passwordHash, full_name, phone_number || null]
    );

    const user = newUser.rows[0];

    // Generate token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      status: 'success',
      token,
      data: { user },
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ status: 'error', message: 'Internal server error during registration.' });
  }
};

// 2. LOGIN USER
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ status: 'fail', message: 'Please provide both email and password.' });
  }

  try {
    // Fetch user with hashed password
    const result = await db.query(
      `SELECT id, email, password_hash, full_name, phone_number, role 
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ status: 'fail', message: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ status: 'fail', message: 'Invalid email or password.' });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    // Remove password_hash before returning user payload
    delete user.password_hash;

    res.status(200).json({
      status: 'success',
      token,
      data: { user },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ status: 'error', message: 'Internal server error during login.' });
  }
};