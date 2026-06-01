const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production';
const dbPath = isProduction 
  ? '/var/data/StudentDatabase.db' 
  : path.resolve(__dirname, '../../StudentDatabase.db');

// Ensure directory exists for production
if (isProduction && !fs.existsSync('/var/data')) {
  try {
    fs.mkdirSync('/var/data', { recursive: true });
  } catch (err) {
    console.error('Error creating directory /var/data:', err);
  }
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log(`Connected to the SQLite database at ${dbPath}`);
  }
});

db.run(`PRAGMA foreign_keys = ON;`, (err) => {
  if (err) {
    console.error('Error enabling foreign keys:', err.message);
  } else {
    console.log('Foreign key support enabled.');
  }
});

module.exports = db;