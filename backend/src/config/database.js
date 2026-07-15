const { Pool } = require('pg');

// This creates a "pool" of connections to PostgreSQL
// Think of it like having multiple phone lines open to the database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Test the connection when server starts
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error:', err);
});

module.exports = pool;