const sqlite3 = require('sqlite3').verbose();


const db = new sqlite3.Database('StudentDatabase.db', (err) => {
  if (err) {
    console.error(err.message);
  }
    console.log('Connected to the mydatabase.db SQlite database.');
});

db.run(`PRAGMA foreign_keys = ON;`, (err) => {
  if (err) {
    console.error(err.message);
  } 
  console.log('Foreign key support enabled.');
});

db.all(
  `SELECT name FROM sqlite_master WHERE type='table'`,
  (err, tables) => {
    if (err) console.error(err);
    else console.log(tables);
  }
);


// db.run(`DROP TABLE IF EXISTS students`, (err) => {
//   if (err) console.error(err);
//   else console.log("students table dropped successfully");
// });
// db.run(`DROP TABLE IF EXISTS fee_structure`, (err) => {
//   if (err) console.error(err);
//   else console.log("fee_structure table dropped successfully");
// });


// Uncomment the following code to check the structure of the 'students' table

// db.all("PRAGMA table_info(students)", (err, columns) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log(columns);
//   }
// });


module.exports = db;