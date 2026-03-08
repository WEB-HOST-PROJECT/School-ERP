const db = require('./init')


db.run(`
 
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class TEXT,
    section TEXT,
    session TEXT,
    roll_no INTEGER,
    sr_no INTEGER,
    name TEXT,
    gender TEXT,
    dob TEXT,
    category TEXT,
    father_name TEXT,
    mother_name TEXT,
    address TEXT,
    house_name TEXT,
    pen_no TEXT,
    certificate TEXT,
    contact_no TEXT,
    aadhar_no TEXT,
    transport TEXT,
    fee_id INTEGER,
    FOREIGN KEY (fee_id) REFERENCES fee_structure(id),
    UNIQUE(class, section, session, roll_no)
  )
`);


db.run(`
  
  CREATE TABLE IF NOT EXISTS fee_structure (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class TEXT NOT NULL,
    session TEXT NOT NULL, 
    new_admission_fee REAL DEFAULT 0.0,
    renewal_fee REAL DEFAULT 0.0,
    id_report_fee REAL DEFAULT 0.0,
    registration_fee REAL DEFAULT 0.0,
    tuition_fee REAL DEFAULT 0.0,
    transport_fee REAL DEFAULT 0.0,
    term_fee REAL DEFAULT 0.0,
    exam_fee REAL DEFAULT 0.0,
    other_fee REAL DEFAULT 0.0,
    UNIQUE(class, session)
    )
  `)
