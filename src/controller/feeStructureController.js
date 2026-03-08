const e = require("express");
const db = require("../database/init")

exports.addFeeStructure = (req, res) => {
    const { className, session, newAddmissionFee, renewalFee, idReportFee, registrationFee, tuitionFee, transportFee, termFee, examFee, otherFee } = req.body;
    const sql = "INSERT INTO fee_structure (class,session,new_admission_fee,renewal_fee,id_report_fee,registration_fee,tuition_fee,transport_fee,term_fee,exam_fee,other_fee) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
    db.run(sql, [className, session, newAddmissionFee, renewalFee, idReportFee, registrationFee, tuitionFee, transportFee, termFee, examFee, otherFee], (err) => {
        if (err) {
            if (err.code === "SQLITE_CONSTRAINT") {
                console.log("Fee structure for this class and session already exists");
                return res.status(409).json({ err: "Fee structure for this class and session already exists" })
            }
            else {
                console.log(err);
                return res.status(500).json({ err: "Internal Server Error" })
            }
        }
        res.json({ id: this.lastID, message: "Fee Structure Added Successfully" })
        console.log("Fee structure added successfully")
    })
}


exports.getAllFeeStructures = (req, res) => {
    const sql = "SELECT * FROM fee_structure"
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" })
        }
        res.json(rows)
    })
}

exports.getFeeStructureByClassAndSession = (req, res) => {
    const { className } = req.query;
    console.log(className);
    if (!className) {
        return res.status(400).json({
            error: "Class name required"
        })
    }

    const sql = "SELECT * FROM fee_structure WHERE class = ?"

    db.get(sql, [className], (err, feeStructure) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" })
        }
        if (!feeStructure) {
            return res.status(404).json({ message: "Fee Structure Not Found" })
        }
        res.json(feeStructure)
    })
}


exports.updateFeeStructure = (req, res) => {
    feeStructureId = req.params.id
    const { className, session, newAddmissionFee, renewalFee, idReportFee, registrationFee, tuitionFee, transportFee, termFee, examFee, otherFee } = req.body;
    const sql = "UPDATE fee_structure SET class = ?, session = ?, new_admission_fee = ?, renewal_fee = ?, id_report_fee = ?, registration_fee = ?, tuition_fee = ?, transport_fee = ?, term_fee = ?, exam_fee = ?, other_fee = ? WHERE id = ?"
    db.run(sql, [className, session, newAddmissionFee, renewalFee, idReportFee, registrationFee, tuitionFee, transportFee, termFee, examFee, otherFee, feeStructureId], function (err) {
        if (err) {
            console.log(err)
            return res.status(500).json({
                err: "Internal Server Error"
            });
        }
        if (this.changes === 0) {
            return res.status(404).json({
                err: "Fee Structure Not Found"
            });
        }
        res.status(200).json({
            message: "Fee Structure Updated Successfully"
        })
    })
}

exports.deleteFeeStructure = (req, res) => {
    feeStructureId = req.params.id
    const sql = "DELETE FROM fee_structure WHERE id = ?"
    db.run(sql, [feeStructureId], function (err)  {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Internal Server Error" });
        }
        if (this.changes === 0) {
            return res.status(404).json({ err: "Fee Structure Not Found" });
        }
        res.json({ message: "Fee Structure deleted successfully" })
        console.log("Fee structure deleted successfully")
    })
}