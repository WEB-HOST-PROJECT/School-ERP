/**
 * backfill_fees.js
 * Run once to generate fee records for all existing enrollments.
 * Safe to re-run: INSERT OR IGNORE prevents duplicates.
 */
const db = require('./src/database/init');
const { assignFeesForEnrollment } = require('./src/services/feeGeneratorService');

db.all(`SELECT student_id, class_id, academic_year_id, transport_id FROM enrollment`, [], (err, rows) => {
    if (err) { console.error('Failed to fetch enrollments:', err); process.exit(1); }

    console.log(`Found ${rows.length} enrollment(s) to backfill...`);

    rows.forEach((row, i) => {
        // Stagger each call by 200ms to avoid SQLite write contention
        setTimeout(() => {
            assignFeesForEnrollment(row.student_id, row.class_id, row.academic_year_id, row.transport_id);
        }, i * 200);
    });

    // Give enough time for all async DB writes to complete before exiting
    setTimeout(() => {
        console.log('Backfill complete. All fee records generated (duplicates skipped).');
        process.exit(0);
    }, rows.length * 200 + 2000);
});
