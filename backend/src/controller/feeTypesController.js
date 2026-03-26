const db = require('../database/init')

// Add Fee Type
exports.addFeeType = (req, res) => {
    const { fee_type_name , frequency} = req.body
    const sql = `INSERT INTO fee_types (fee_type_name, frequency) VALUES (?, ?)`
    db.run(sql, [fee_type_name, frequency], function (err) {
        if (err) {
            if (err.code === "SQLITE_CONSTRAINT") {
                console.log("Fee type already exists");
                return res.status(409).json({ err: "Fee type already exists" })
            }
            else {
                console.log(err);
                return res.status(500).json({ err: "Internal Server Error" })
            }
        }
        res.json({ id: this.lastID, message: "Fee Type Added Successfully" })
        console.log("Fee type added successfully")
    }
    )
}

// Get all fee types
exports.getAllFeeTypes = (req, res) => {
    const sql = "SELECT * FROM fee_types"
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" })
        }
        res.json(rows)
    })
}

// Delete fee type
exports.deleteFeeType = (req, res) => {
    const feeTypeId = req.params.id
    const sql = "DELETE FROM fee_types WHERE id = ?"
    db.run(sql, [feeTypeId], function (err) {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" })
        }
        if (this.changes === 0) {
            return res.status(404).json({ err: "Fee type not found" })
        }
        res.json({ message: "Fee type deleted successfully" })
        console.log("Fee type deleted successfully")
    })
}

// get fee type by id
exports.getFeeTypeById = (req, res) => {
    const feeTypeId = req.params.id
    const sql = "SELECT * FROM fee_types WHERE id = ?"
    db.get(sql, [feeTypeId], (err, feeType) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" })
        }
        if (!feeType) {
            return res.status(404).json({ err: "Fee type not found" })
        }
        res.json(feeType)
    })
}

