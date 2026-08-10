const { Pool } = require('pg');
require('dotenv').config();

// Use DATABASE_URL if available (for Neon/Render production), otherwise fall back to local config
const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
      }
);

// Log successful connection
pool.on('connect', () => {
  console.log('🐘 Connected to PostgreSQL database');
});

// Catch pool errors
pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

// Export helper query function
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};