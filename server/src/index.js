const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('🔥 Welcome to the MadKicks API!');
});

// Database health check route
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as current_time, COUNT(*) as user_count FROM users;');
    res.json({
      status: 'success',
      db_time: result.rows[0].current_time,
      total_users: result.rows[0].user_count,
    });
  } catch (err) {
    console.error('Database Query Error:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}); 