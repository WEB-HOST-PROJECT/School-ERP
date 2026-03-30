const db = require("../database/init")

// Add  Class
exports.addClass = (req, res) => {
    const { class_name } = req.body
    const query = `INSERT INTO classes (class_name) VALUES (?)`
    db.run(query, [class_name], function (err) {
        if (err) {
            if (err.code === "SQLITE_CONSTRAINT") {
                console.log("Class already exists");
                return res.status(409).json({ err: "Class already exists" })
            }
            else {
                console.log(err);
                return res.status(500).json({ err: "Internal Server Error" })
            }
        }
        res.json({ id: this.lastID, message: "Class Added Successfully" })
        console.log("Class added successfully")
    }
    )
}

// Delete Class
exports.deleteClass = (req, res) => {
    const { id } = req.params
    const query = `DELETE FROM classes WHERE id = ?`
    db.run(query, [id], function (err) {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" })
        }
        if (this.changes === 0) {
            return res.status(404).json({ err: "Class not found" })
        }
        res.json({ message: "Class deleted successfully" })
        console.log("Class deleted successfully")
    }
    )
}

// Get all classes
exports.getAllClasses = (req, res) => {
    const query = `SELECT * FROM classes`
    db.all(query, [], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" })
        }
        res.json(rows)
    }
    )
}

// Get a class by ID
exports.getClassById = (req, res) => {
    const { id } = req.params
    const query = `SELECT * FROM classes WHERE id = ?`
    db.get(query, [id], (err, row) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" })
        }
        if (!row) {
            return res.status(404).json({ err: "Class not found" })
        }
        res.json(row)
    }
    )
}


// add section
exports.addSection = (req, res) => {
    const { section_name, class_id } = req.body
    const query = `INSERT INTO sections (section_name, class_id) VALUES (?, ?)`
    db.run(query, [section_name, class_id], function (err) {
        if(err){
            if (err.code === "SQLITE_CONSTRAINT") {
                console.log("Section already exists in this class");
                return res.status(409).json({ err: "Section already exists in this class" })
            }
            else {
                console.log(err);
                return res.status(500).json({ err: "Internal Server Error" })
            }

        }
        res.json({ id: this.lastID, message: "Section Added Successfully" })
        console.log("Section added successfully")
    }
    )
}

// Delete section
exports.deleteSection = (req, res) => {
    const { id } = req.params
    const query = `DELETE FROM sections WHERE id = ?`
    db.run(query, [id], function (err) {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" })
        }
        if (this.changes === 0) {
            return res.status(404).json({ err: "Section not found" })
        }
        res.json({ message: "Section deleted successfully" })
        console.log("Section deleted successfully")
    }
    )
}

// Get all sections
exports.getAllSections = (req, res) => {
    const query = `SELECT * FROM sections`
    db.all(query, [], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" })
        }
        res.json(rows)
    }
    )
}

// Get a section by ID
exports.getSectionById = (req, res) => {
    const { id } = req.params
    const query = `SELECT * FROM sections WHERE id = ?`
    db.get(query, [id], (err, row) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" })
        }
        if (!row) {
            return res.status(404).json({ err: "Section not found" })
        }

        res.json(row)
    }
    )
}

