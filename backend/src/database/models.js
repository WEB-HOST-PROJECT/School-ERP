const db = require('./init')
// Academic years, classes, sections, students, fee structures, fee types, payments, payment details, receipts tables creation
db.run(`
  CREATE TABLE IF NOT EXISTS academic_years (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year_name TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    UNIQUE(year_name)
  )
`)

db.run(`
  CREATE TABLE IF NOT EXISTS enrollment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    section_id INTEGER NOT NULL,
    roll_no INTEGER NOT NULL,
    academic_year_id INTEGER NOT NULL,
    enrollment_date TEXT NOT NULL,
    transport TEXT DEFAULT 'no',
    admission_type TEXT DEFAULT 'fresh',
    transport_id INTEGER,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (transport_id) REFERENCES transport(id) ON DELETE SET NULL,
    UNIQUE(class_id, student_id, academic_year_id)
  )
`)

db.run(`
  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_name TEXT NOT NULL, 
    UNIQUE(class_name)
  )
`)

db.run(`
  CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    class_id INTEGER NOT NULL,
    section_name TEXT NOT NULL,
    UNIQUE(class_id, section_name),
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
  )
`)


db.run(`
 
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    gender TEXT NOT NULL,
    dob TEXT,
    category TEXT,
    father_name TEXT NOT NULL,
    mother_name TEXT,
    address TEXT,
    house_name TEXT,
    pen_no TEXT,
    certificate TEXT,
    contact_no TEXT,
    aadhar_no TEXT,
    email TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(aadhar_no)
  )
`);


db.run(`
  
  CREATE TABLE IF NOT EXISTS fee_structure (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER,
    fee_type_id INTEGER,
    academic_year_id INTEGER,
    amount REAL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_type_id) REFERENCES fee_types(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    UNIQUE(class_id, fee_type_id, academic_year_id)
    
    )
  `);


db.run(`
    CREATE TABLE IF NOT EXISTS fee_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fee_type_name TEXT NOT NULL UNIQUE,
      frequency TEXT NOT NULL
    )
  `);


db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      payment_date TEXT NOT NULL,
      total_amount REAL NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (fee_structure_id) REFERENCES fee_structure(id) ON DELETE CASCADE
    )
  `);

db.run(`
    CREATE TABLE IF NOT EXISTS payment_details(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_id INTEGER NOT NULL,
      fee_structure_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
      FOREIGN KEY (fee_structure_id) REFERENCES fee_structure(id) ON DELETE CASCADE
    )
  `)


db.run(`
    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_id INTEGER NOT NULL,
      receipt_no TEXT NOT NULL UNIQUE,
      receipt_date TEXT NOT NULL,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      remarks TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
    )
  `)

db.run(`
    CREATE TABLE IF NOT EXISTS transport (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      route_no TEXT NOT NULL UNIQUE,
      route_name TEXT NOT NULL,
      amount REAL NOT NULL
    )
  `)
