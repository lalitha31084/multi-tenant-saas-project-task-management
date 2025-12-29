const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // If we are in production (Render), use SSL. If localhost, disable it.
  ssl: isProduction 
    ? { rejectUnauthorized: false } 
    : false
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};