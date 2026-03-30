const db = require('./src/database/init');
db.serialize(() => {
    db.run("DROP TABLE IF EXISTS payment_details", (err) => {
        if(err) console.error("Failed dropping payment_details:", err);
        else console.log("Dropped payment_details.");
        
        require('./src/database/models');
        console.log("Rebuilt schema structurally pushing new payment_details tracking columns cleanly.");
    });
});
