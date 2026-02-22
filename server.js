const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const publicRoutes = require('./routes/public');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/login.html'));
});

app.get('/admin/dashboard', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/dashboard.html'));
});

app.listen(port, () => {
  console.log(`MegaPrep Result System running on http://localhost:${port}`);
});
