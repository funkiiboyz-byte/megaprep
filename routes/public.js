const express = require('express');
const { query } = require('../config/db');

const router = express.Router();

router.get('/batches', async (_req, res) => {
  try {
    const rows = await query('SELECT id, name FROM batches ORDER BY name');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch batches', error: error.message });
  }
});

router.get('/exams', async (_req, res) => {
  try {
    const rows = await query('SELECT id, exam_name FROM exams ORDER BY exam_date DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch exams', error: error.message });
  }
});

router.post('/result/search', async (req, res) => {
  try {
    const { roll, batchId, examId } = req.body;
    if (!roll || !batchId || !examId) {
      return res.status(400).json({ message: 'Roll, batch and exam are required.' });
    }

    const rows = await query(
      `SELECT s.full_name, s.roll_number, s.registration_number, b.name AS batch_name, s.student_group,
              r.physics, r.chemistry, r.math, r.biology_ict, r.total_marks, r.gpa_percentage,
              r.grade, r.merit_position, r.status, e.exam_name, e.session_name, i.institute_name
       FROM results r
       JOIN students s ON r.student_id = s.id
       JOIN batches b ON r.batch_id = b.id
       JOIN exams e ON r.exam_id = e.id
       JOIN institutes i ON s.institute_id = i.id
       WHERE (s.roll_number = ? OR s.registration_number = ?) AND r.batch_id = ? AND r.exam_id = ?`,
      [roll, roll, Number(batchId), Number(examId)]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'No result found with the given information.' });
    }

    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to search result', error: error.message });
  }
});

module.exports = router;
