const db = require('../database/init')

// Add Enrollment
exports.addEnrollment = (req, res) => {
    const { student_id, class_id, section_id, roll_no, academic_year_id, transport, admission_type, transport_id } = req.body
    const query = `INSERT INTO enrollment (student_id, class_id, section_id, roll_no, academic_year_id, transport, admission_type, transport_id, enrollment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    db.run(query, [student_id, class_id, section_id, roll_no, academic_year_id, transport || 'no', admission_type || 'fresh', transport_id || null], function (err) {
        if (err) {
            if (err.code === "SQLITE_CONSTRAINT") {
                console.log(err.message)
                console.log("Enrollment already exists for this student in this class and section for the academic year");
                return res.status(409).json({ err: "Enrollment already exists for this student in this class and section for the academic year" })
            }
            else {
                console.log(err);
                return res.status(500).json({ err: "Internal Server Error" })
            }
        }
        res.json({ message: "Enrollment added successfully" })
        console.log("Enrollment added successfully")
    })
}

// Get all enrollments
exports.getAllEnrollments = (req, res) => {
    const query = "SELECT * FROM enrollment"
    db.all(query, [], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" })
        }
        res.json(rows)
    })
}

// Get enrollment by ID
exports.getEnrollmentById = (req, res) => {
    const { id } = req.params
    const query = "SELECT * FROM enrollment WHERE id = ?"
    db.get(query, [id], (err, enrollment) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" })
        }
        if (!enrollment) {
            return res.status(404).json({ err: "Enrollment not found" })
        }
        res.json(enrollment)
    })
}

// Update enrollment
exports.updateEnrollment = (req, res) => {
    const { id } = req.params
    const { student_id, class_id, section_id, roll_no, academic_year_id, transport, admission_type, transport_id } = req.body
    const query = `UPDATE enrollment SET student_id = ?, class_id = ?, section_id = ?, roll_no = ?, academic_year_id = ?, transport = ?, admission_type = ?, transport_id = ? WHERE id = ?`
    db.run(query, [student_id, class_id, section_id, roll_no, academic_year_id, transport || 'no', admission_type || 'fresh', transport_id || null, id], function (err) {
        if (err) {
            if (err.code === "SQLITE_CONSTRAINT") {
                console.log("Enrollment already exists for this student in this class and section for the academic year");
                return res.status(409).json({ err: "Enrollment already exists for this student in this class and section for the academic year" })
            }
            else {
                console.log(err);
                return res.status(500).json({ err: "Internal Server Error" })
            }
        }
        if (this.changes === 0) {
            return res.status(404).json({ err: "Enrollment not found" })
        }
        res.json({ message: "Enrollment updated successfully" })
        console.log("Enrollment updated successfully")
    })
}

// Delete enrollment    
exports.deleteEnrollment = (req, res) => {
    const { id } = req.params
    const query = `DELETE FROM enrollment WHERE id = ?`
    db.run(query, [id], function (err) {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" })
        }        if (this.changes === 0) {
            return res.status(404).json({ err: "Enrollment not found" })
        }
        res.json({ message: "Enrollment deleted successfully" })
        console.log("Enrollment deleted successfully")
    })
}

// Get enrollment with student, class, section and academic year details by ID
exports.getEnrollmentDetailsById = (req, res) => {
    const { id } = req.params
    const query = `SELECT e.id, s.name AS student_name, c.class_name, sec.section_name, ay.year_name, e.roll_no, e.transport, e.transport_id, e.admission_type, e.enrollment_date` +
        ` FROM enrollment e` +
        ` JOIN students s ON e.student_id = s.id` + 
        ` JOIN classes c ON e.class_id = c.id` +
        ` JOIN sections sec ON e.section_id = sec.id` +
        ` JOIN academic_years ay ON e.academic_year_id = ay.id` +
        ` WHERE e.id = ?`
    db.get(query, [id], (err, enrollment) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" })
        }
        if (!enrollment) {
            return res.status(404).json({ err: "Enrollment not found" })
        }
        res.json(enrollment)
    })
}

