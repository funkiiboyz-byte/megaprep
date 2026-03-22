const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const { parse } = require('csv-parse/sync');
const { query, pool } = require('../config/db');
const { ensureAdmin } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(ensureAdmin);

router.get('/stats', async (_req, res) => {
  try {
    const [[totalStudents]] = await pool.query('SELECT COUNT(*) AS total FROM students');
    const [[passStats]] = await pool.query("SELECT ROUND((SUM(status='Pass') / COUNT(*)) * 100, 2) AS pass_rate FROM results");
    const topScorers = await query(
      `SELECT s.full_name, s.roll_number, r.total_marks
       FROM results r
       JOIN students s ON r.student_id = s.id
       ORDER BY r.total_marks DESC LIMIT 5`
    );
    res.json({ totalStudents: totalStudents.total, passRate: passStats.pass_rate || 0, topScorers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load stats', error: error.message });
  }
});


router.get('/batches', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM batches ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch batches', error: error.message });
  }
});

router.post('/batches', async (req, res) => {
  try {
    await query('INSERT INTO batches (name) VALUES (?)', [req.body.name]);
    res.status(201).json({ message: 'Batch created' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create batch', error: error.message });
  }
});

router.get('/exams', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM exams ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch exams', error: error.message });
  }
});

router.post('/exams', async (req, res) => {
  try {
    await query('INSERT INTO exams (exam_name, session_name, exam_date) VALUES (?, ?, ?)', [req.body.exam_name, req.body.session_name, req.body.exam_date || null]);
    res.status(201).json({ message: 'Exam created' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create exam', error: error.message });
  }
});

router.get('/results', async (req, res) => {
  try {
    const { roll } = req.query;
    let sql = `SELECT r.id, s.full_name, s.roll_number, b.name AS batch_name, e.exam_name, r.total_marks, r.gpa_percentage, r.status
               FROM results r
               JOIN students s ON r.student_id = s.id
               JOIN batches b ON r.batch_id = b.id
               JOIN exams e ON r.exam_id = e.id`;
    const params = [];
    if (roll) {
      sql += ' WHERE s.roll_number = ?';
      params.push(roll);
    }
    sql += ' ORDER BY r.id DESC';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch results', error: error.message });
  }
});

router.post('/results', async (req, res) => {
  try {
    const data = req.body;
    const required = ['student_id', 'batch_id', 'exam_id', 'physics', 'chemistry', 'math', 'total_marks', 'gpa_percentage', 'grade', 'status'];
    for (const key of required) {
      if (data[key] === undefined || data[key] === '') {
        return res.status(400).json({ message: `${key} is required` });
      }
    }

    const sql = `INSERT INTO results (student_id, batch_id, exam_id, physics, chemistry, math, biology_ict, total_marks, gpa_percentage, grade, merit_position, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await query(sql, [
      data.student_id,
      data.batch_id,
      data.exam_id,
      data.physics,
      data.chemistry,
      data.math,
      data.biology_ict || null,
      data.total_marks,
      data.gpa_percentage,
      data.grade,
      data.merit_position || null,
      data.status
    ]);
    res.status(201).json({ message: 'Result added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add result', error: error.message });
  }
});

router.put('/results/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await query(
      `UPDATE results SET physics=?, chemistry=?, math=?, biology_ict=?, total_marks=?, gpa_percentage=?, grade=?, merit_position=?, status=? WHERE id=?`,
      [req.body.physics, req.body.chemistry, req.body.math, req.body.biology_ict || null, req.body.total_marks, req.body.gpa_percentage, req.body.grade, req.body.merit_position || null, req.body.status, id]
    );
    res.json({ message: 'Result updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update result', error: error.message });
  }
});

router.delete('/results/:id', async (req, res) => {
  try {
    await query('DELETE FROM results WHERE id = ?', [Number(req.params.id)]);
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete result', error: error.message });
  }
});

router.post('/results/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV or XLSX file' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    let rows = XLSX.utils.sheet_to_json(firstSheet);

    if (!rows.length && req.file.mimetype.includes('csv')) {
      const fs = require('fs');
      const fileData = fs.readFileSync(req.file.path, 'utf8');
      rows = parse(fileData, { columns: true, skip_empty_lines: true });
    }

    for (const row of rows) {
      await query(
        `INSERT INTO results (student_id, batch_id, exam_id, physics, chemistry, math, biology_ict, total_marks, gpa_percentage, grade, merit_position, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [row.student_id, row.batch_id, row.exam_id, row.physics, row.chemistry, row.math, row.biology_ict || null, row.total_marks, row.gpa_percentage, row.grade, row.merit_position || null, row.status]
      );
    }

    return res.json({ message: `${rows.length} results uploaded successfully` });
  } catch (error) {
    return res.status(500).json({ message: 'Bulk upload failed', error: error.message });
  }
});

module.exports = router;
