# MegaPrep Result Management System

A modern, responsive Result Management Website for MegaPrep Coaching.

## Tech Stack
- Frontend: HTML, CSS, Bootstrap, JavaScript
- Backend: Node.js + Express
- Database: MySQL
- Auth: JWT + bcrypt password hashing

## Project Structure

```
megaprep/
├── config/
│   └── db.js
├── db/
│   └── schema.sql
├── middleware/
│   └── auth.js
├── public/
│   ├── admin/
│   │   ├── dashboard.html
│   │   └── login.html
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── admin.js
│   │   ├── dashboard.js
│   │   └── main.js
│   └── index.html
├── routes/
│   ├── admin.js
│   ├── auth.js
│   └── public.js
├── .env.example
├── package.json
└── server.js
```

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment:
   ```bash
   cp .env.example .env
   ```
3. Create DB and seed data:
   ```bash
   mysql -u root -p < db/schema.sql
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## Demo Credentials
- Username: `admin`
- Password: `admin123`

## Features Implemented
- Public result search by roll + batch + exam.
- Loading animation during search.
- Result details with print-friendly format.
- Admin login with JWT authentication.
- Admin dashboard with:
  - Manual result entry
  - Bulk CSV upload
  - Dashboard statistics
  - Delete API for results
- MySQL relational schema for all required tables.
