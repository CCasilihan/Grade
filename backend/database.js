const { Pool } = require('pg');
require('dotenv').config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Failed to connect to the database', err);
  } else {
    console.log('Connected to the database');
  }
});

// Don't forget to close the pool when you're done
process.on('exit', () => {
  pool.end();
});

module.exports = pool;
