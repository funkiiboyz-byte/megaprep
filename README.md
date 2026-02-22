# MegaPrep Result Management System

A modern, responsive IMR-style Result Management Website for **MegaPrep Coaching**.

## Features

### Public Portal
- Result search by Roll/Registration + Batch + Exam
- Subject-wise marks, total, GPA/percentage, merit, pass/fail status
- Notice board
- Print full-page result
- Download result as PDF
- Loading spinner while searching

### Admin Panel
- Secure admin login (session based)
- Add student result manually
- Bulk upload (Excel/CSV)
- Search result by roll
- Delete result
- Dashboard statistics: total students, pass rate, top scorer

## Tech Stack
- Frontend: HTML, CSS, Bootstrap, JavaScript
- Backend: Node.js + Express
- Database: MySQL

## Project Structure

```
megaprep/
├── config/
│   └── db.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── public.js
│   └── admin.js
├── public/
│   ├── index.html
│   ├── admin/
│   │   ├── login.html
│   │   └── dashboard.html
│   └── assets/
│       ├── css/style.css
│       └── js/{main.js,admin.js}
├── database/
│   └── schema.sql
├── server.js
└── .env.example
```

## Setup
1. Create DB and seed data:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
2. Copy env:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies and run:
   ```bash
   npm install
   npm start
   ```
4. Open:
   - Public portal: `http://localhost:3000`
   - Admin login: `http://localhost:3000/admin/login.html`

## Sample Admin Credentials
- Email: `admin@megaprep.com`
- Password: `password`

## Notes
- `subjects` table is included for extensibility.
- `results` are linked with `student_id`, `exam_id`, `batch_id`.
- For production: enable HTTPS secure cookies and stronger session secret.
