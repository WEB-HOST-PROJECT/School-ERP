const db = require("../database/init")

// Add a new academic year
exports.addAcademicYear = (req, res) => {
    const { year_name, start_date, end_date } = req.body
    const query = `INSERT INTO academics (year_name, start_date, end_date) VALUES (?, ?, ?)`
    db.run(query, [year_name, start_date, end_date], function (err) {
        if (err) {
            if (err.code === "SQLITE_CONSTRAINT") {
                console.log("Academic year already exists");
                return res.status(409).json({ err: "Academic year already exists" })
            }
            else {
                console.log(err);
                return res.status(500).json({ err: "Internal Server Error" })
            }
        }
        res.json({ id: this.lastID, message: "Academic Year Added Successfully" })
        console.log("Academic year added successfully")
    }
    )
}

// Get all academic years
exports.getAllAcademicYears = (req, res) => {
    const query = `SELECT * FROM academics`
    db.all(query, [], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" })
        }
        res.json(rows)
    })
}   
