const express = require('express');
const multer = require('multer');
const authenticateAdmin = require('../middleware/auth');
const pool = require('../config/db');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.use(authenticateAdmin);

router.get('/dashboard-stats', async (_req, res) => {
  try {
    const [[{ totalStudents }]] = await pool.execute('SELECT COUNT(*) AS totalStudents FROM students');
    const [[{ totalResults }]] = await pool.execute('SELECT COUNT(*) AS totalResults FROM results');
    const [[{ passRate }]] = await pool.execute(
      "SELECT ROUND((SUM(CASE WHEN status = 'Pass' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS passRate FROM results"
    );
    const [topScorers] = await pool.execute(
      `SELECT s.full_name, s.roll, r.total_marks
       FROM results r JOIN students s ON r.student_id = s.id
       ORDER BY r.total_marks DESC LIMIT 5`
    );

    res.json({ totalStudents, totalResults, passRate: passRate || 0, topScorers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load stats.', error: error.message });
  }
});

router.post('/results', async (req, res) => {
  const { studentId, examId, batchId, physics, chemistry, math, biologyIct, totalMarks, gpa, percentage, meritPosition, status } = req.body;

  if (!studentId || !examId || !batchId || !totalMarks || !status) {
    return res.status(400).json({ message: 'Required fields are missing.' });
  }

  try {
    await pool.execute(
      `INSERT INTO results
      (student_id, exam_id, batch_id, physics, chemistry, math, biology_ict, total_marks, gpa, percentage, merit_position, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [studentId, examId, batchId, physics || 0, chemistry || 0, math || 0, biologyIct || 0, totalMarks, gpa || 0, percentage || 0, meritPosition || null, status]
    );

    res.status(201).json({ message: 'Result added successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add result.', error: error.message });
  }
});

router.post('/results/upload-csv', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'CSV file is required.' });
  }

  const rows = req.file.buffer.toString('utf8').trim().split('\n').slice(1);
  let inserted = 0;

  try {
    for (const row of rows) {
      const [studentId, examId, batchId, physics, chemistry, math, biologyIct, totalMarks, gpa, percentage, meritPosition, status] = row.split(',');
      await pool.execute(
        `INSERT INTO results
        (student_id, exam_id, batch_id, physics, chemistry, math, biology_ict, total_marks, gpa, percentage, merit_position, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [studentId, examId, batchId, physics, chemistry, math, biologyIct || 0, totalMarks, gpa, percentage, meritPosition || null, status]
      );
      inserted += 1;
    }

    res.status(201).json({ message: 'Bulk upload complete.', inserted });
  } catch (error) {
    res.status(500).json({ message: 'Bulk upload failed.', error: error.message, inserted });
  }
});

router.delete('/results/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM results WHERE id = ?', [req.params.id]);
    res.json({ message: 'Result deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed.', error: error.message });
  }
});

module.exports = router;
