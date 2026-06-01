const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use a local path for the database file within the backend directory.
// This works on both local (Windows/Mac) and Render Free Plan (Linux).
const dbPath = path.resolve(__dirname, '../../StudentDatabase.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log(`Connected to the SQLite database at: ${dbPath}`);
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