const db = require("../database/init")

// Add a new academic year
exports.addAcademicYear = (req, res) => {
    const { year_name, start_date, end_date } = req.body
    const query = `INSERT INTO academic_years (year_name, start_date, end_date) VALUES (?, ?, ?)`
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
    const query = `SELECT * FROM academic_years`
    db.all(query, [], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" })
        }
        res.json(rows)
    })
}   


// Get an academic year by ID
exports.getAcademicYearById = (req, res) => {
    const { id } = req.params
    const query = `SELECT * FROM academic_years WHERE id = ?`
    db.get(query, [id], (err, row) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" })
        }
        if (!row) {
            return res.status(404).json({ err: "Academic year not found" })
        }
        res.json(row)
    })
}

// Update an academic year
exports.updateAcademicYear = (req, res) => {
    const { id } = req.params
    const { year_name, start_date, end_date, is_active } = req.body
    const query = `UPDATE academic_years SET year_name = ?, start_date = ?, end_date = ?, is_active = ? WHERE id = ?`
    db.run(query, [year_name, start_date, end_date, is_active, id], function (err) {
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
        if (this.changes === 0) {
            return res.status(404).json({ err: "Academic year not found" })
        }
        res.json({ message: "Academic Year Updated Successfully" })
        console.log("Academic year updated successfully")
    })
}

// Delete an academic year
exports.deleteAcademicYear = (req, res) => {
    const { id } = req.params
    const query = `DELETE FROM academic_years WHERE id = ?`
    db.run(query, [id], function (err) {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" })
        }
        if (this.changes === 0) {
            return res.status(404).json({ err: "Academic year not found" })
        }
        res.json({ message: "Academic Year Deleted Successfully" })
        console.log("Academic year deleted successfully")
    })
}
