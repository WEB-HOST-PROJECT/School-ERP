const db = require('../database/init')

// Add Transport Route
exports.addRoute = (req, res) => {
    const { route_no, route_name, amount } = req.body
    const query = `INSERT INTO transport (route_no, route_name, amount) VALUES (?, ?, ?)`
    db.run(query, [route_no, route_name, amount], function (err) {
        if (err) {
            if (err.code === "SQLITE_CONSTRAINT") return res.status(409).json({ err: "Route Number already exists" })
            return res.status(500).json({ err: "Internal Server Error" })
        }
        res.json({ message: "Transport Route added successfully", id: this.lastID })
    })
}

// Get all Routes
exports.getRoutes = (req, res) => {
    const query = "SELECT * FROM transport"
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ err: "Internal Server Error" })
        res.json(rows)
    })
}

// Update Route
exports.updateRoute = (req, res) => {
    const { id } = req.params
    const { route_no, route_name, amount } = req.body
    const query = `UPDATE transport SET route_no = ?, route_name = ?, amount = ? WHERE id = ?`
    db.run(query, [route_no, route_name, amount, id], function (err) {
        if (err) {
            if (err.code === "SQLITE_CONSTRAINT") return res.status(409).json({ err: "Route Number already exists" })
            return res.status(500).json({ err: "Internal Server Error" })
        }
        if (this.changes === 0) return res.status(404).json({ err: "Transport Route not found" })
        res.json({ message: "Transport Route updated successfully" })
    })
}

// Delete Route
exports.deleteRoute = (req, res) => {
    const { id } = req.params
    const query = `DELETE FROM transport WHERE id = ?`
    db.run(query, [id], function (err) {
        if (err) return res.status(500).json({ err: "Internal Server Error" })
        if (this.changes === 0) return res.status(404).json({ err: "Transport Route not found" })
        res.json({ message: "Transport Route deleted successfully" })
    })
}
