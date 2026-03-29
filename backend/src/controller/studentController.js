
const db = require("../database/init")

exports.addStudent = (req, res) => {
  const {name, gender, dob, category, father_name, mother_name, address, house_name, pen_no, certificate, contact_no, aadhar_no, email, fee_id, status } = req.body;
  const sql = "INSERT INTO students (name, gender, dob, category, father_name, mother_name, address, house_name, pen_no, certificate, contact_no, aadhar_no, email, fee_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  db.run(sql, [name, gender, dob, category, father_name, mother_name, address, house_name, pen_no, certificate, contact_no, aadhar_no, email, fee_id, status || 'active'], (err) => {
    if (err) {

      if (err.code === "SQLITE_CONSTRAINT") {
        console.log("Pen number already exists in this class");
        return res.status(409).json({ err: "Pen number already exists in this class" });
      } else {
        console.log(err);
        return res.status(500).json({ err: "Internal Server Error" });
      }
    }
    res.json({ id: this.lastID, message: "Student Register Seccessfully" })
    console.log("ha sab sahi hai")
  })

}

exports.getAllStudents = (req, res) => {
  const sql = "SELECT * FROM students"
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ err: "Internal Server Error" });
    }
    res.json(rows)
  })
};


exports.getStudentById = (req, res) => {
  studentId = req.params.id
  const sql = "SELECT * FROM students WHERE id = ?"
  db.get(sql, [studentId], (err, student) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ err: "Internal Server Error" });
    }
    if (!student) {
      return res.status(404).json({ err: "Student Not Found" });
    }
    res.json(student)
  })
}

exports.updateStudent = (req, res) => {
  const studentId = req.params.id
  const {name, gender, dob, category, father_name, mother_name, address, house_name, pen_no, certificate, contact_no, aadhar_no, email, fee_id, status } = req.body;
  const sql = "UPDATE students SET name = ?, gender = ?, dob = ?, category = ?, father_name = ?, mother_name = ?, address = ?, house_name = ?, pen_no = ?, certificate = ?, contact_no = ?, aadhar_no = ?, email = ?, fee_id = ?, status = ? WHERE id = ?"
  db.run(sql, [name, gender, dob, category, father_name, mother_name, address, house_name, pen_no, certificate, contact_no, aadhar_no, email, fee_id, status || 'active', studentId], function (err) {
    if (err) {
      console.log(err);
      return res.status(500).json({ err: "Internal Server Error" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ err: "Student Not Found" });
    }
    res.json({ message: "Student updated successfully" })
  })
}

exports.deleteStudent = (req, res) => {
  const studentId = req.params.id
  const sql = "DELETE FROM students WHERE id = ?"
  db.run(sql, [studentId], function (err) {
    if (err) {
      console.log(err);
      return res.status(500).json({ err: "Internal Server Error" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ err: "Student Not Found" });
    }
    res.json({ message: "Student deleted successfully" })
  })
}



// Get student with fee details by ID


exports.studentdWithFeeStructureById = (req, res) => {
  const studentId = req.params.id;
  const sql = `SELECT studentsColumns.*, feeColumns.* 
               FROM students studentsColumns
               LEFT JOIN fee_structure feeColumns ON studentsColumns.class = feeColumns.class AND studentsColumns.session = feeColumns.session
               WHERE studentsColumns.id = ?`;
  db.get(sql, [studentId], (err, student) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ err: "Internal Server Error" });
    }
    if (!student) {
      return res.status(404).json({ err: "Student Not Found" });
    }
    res.json(student)
  })  
}