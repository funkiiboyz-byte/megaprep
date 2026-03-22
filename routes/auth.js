const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const admins = await query('SELECT id, full_name, email, password_hash FROM admins WHERE email = ?', [email]);
    if (!admins.length) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isValid = await bcrypt.compare(password, admins[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    req.session.admin = { id: admins[0].id, name: admins[0].full_name, email: admins[0].email };
    return res.json({ message: 'Login successful', admin: req.session.admin });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/me', (req, res) => {
  if (!req.session?.admin) {
    return res.status(401).json({ authenticated: false });
  }

  return res.json({ authenticated: true, admin: req.session.admin });
});

module.exports = router;
