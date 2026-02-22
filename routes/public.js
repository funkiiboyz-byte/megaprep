const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/filters', async (_req, res) => {
  try {
    const [batches] = await pool.execute('SELECT id, name FROM batches ORDER BY name');
    const [exams] = await pool.execute('SELECT id, name FROM exams ORDER BY exam_date DESC');
    res.json({ batches, exams });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load filters.', error: error.message });
  }
});

router.post('/result', async (req, res) => {
  const { roll, batchId, examId } = req.body;

  if (!roll || !batchId || !examId) {
    return res.status(400).json({ message: 'Roll, batch and exam are required.' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT
        s.id AS student_id, s.full_name, s.roll, s.registration_number, s.group_name,
        b.name AS batch_name, e.name AS exam_name,
        r.physics, r.chemistry, r.math, r.biology_ict,
        r.total_marks, r.gpa, r.percentage, r.merit_position, r.status,
        i.name AS institute_name
      FROM results r
      JOIN students s ON r.student_id = s.id
      JOIN batches b ON r.batch_id = b.id
      JOIN exams e ON r.exam_id = e.id
      JOIN institutes i ON s.institute_id = i.id
      WHERE s.roll = ? AND r.batch_id = ? AND r.exam_id = ?`,
      [roll, batchId, examId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'No result found for provided information.' });
    }

    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch result.', error: error.message });
  }
});

module.exports = router;
