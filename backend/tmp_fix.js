const db = require('./src/database/init');
db.serialize(() => {
    db.run("ALTER TABLE payments ADD COLUMN fee_structure_id INTEGER NOT NULL DEFAULT 0", (err) => {
        if (err) {
            console.log("Alter table failed or column exists:", err.message);
            // Check if column exists
            db.all("PRAGMA table_info(payments)", (err, columns) => {
                const hasCol = columns.some(c => c.name === 'fee_structure_id');
                if (!hasCol) {
                    console.log("Dropping and recreating payments and dependent tables...");
                    db.run("DROP TABLE IF EXISTS receipts");
                    db.run("DROP TABLE IF EXISTS payment_details");
                    db.run("DROP TABLE IF EXISTS payments");
                    console.log("Tables dropped, they will be recreated on next restart.");
                } else {
                    console.log("Column fee_structure_id already exists.");
                }
            });
        } else {
            console.log("Successfully altered payments table.");
        }
    });
});
