CREATE DATABASE IF NOT EXISTS megaprep_results;
USE megaprep_results;

CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(60) UNIQUE NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE institutes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL
);

CREATE TABLE batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  session_year VARCHAR(20) NOT NULL
);

CREATE TABLE exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  exam_date DATE NOT NULL
);

CREATE TABLE subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  roll VARCHAR(30) UNIQUE NOT NULL,
  registration_number VARCHAR(30) UNIQUE NOT NULL,
  group_name ENUM('Science', 'Engineering', 'Medical') NOT NULL,
  institute_id INT NOT NULL,
  FOREIGN KEY (institute_id) REFERENCES institutes(id)
);

CREATE TABLE results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  exam_id INT NOT NULL,
  batch_id INT NOT NULL,
  physics DECIMAL(5,2) DEFAULT 0,
  chemistry DECIMAL(5,2) DEFAULT 0,
  math DECIMAL(5,2) DEFAULT 0,
  biology_ict DECIMAL(5,2) DEFAULT 0,
  total_marks DECIMAL(6,2) NOT NULL,
  gpa DECIMAL(3,2) DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  merit_position INT,
  status ENUM('Pass', 'Fail') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
);

INSERT INTO admins (username, email, password_hash)
VALUES ('admin', 'admin@megaprep.com', '$2a$10$xQ3cwGnQ1Vd8q3BNo6M8xunnS8CY4xkM8ev8JYfDoPlyP4DBuW9h2');

INSERT INTO institutes (name) VALUES ('MegaPrep Main Campus');
INSERT INTO batches (name, session_year) VALUES ('HSC 2026', '2026'), ('HSC 2027', '2027');
INSERT INTO exams (name, exam_date) VALUES ('Weekly Test', '2026-01-05'), ('Model Test', '2026-02-12'), ('Final Exam', '2026-03-10');
INSERT INTO subjects (name) VALUES ('Physics'), ('Chemistry'), ('Math'), ('Biology/ICT');

INSERT INTO students (full_name, roll, registration_number, group_name, institute_id)
VALUES
('Arafat Hasan', 'MP-1001', 'REG-2026-001', 'Science', 1),
('Sadia Noor', 'MP-1002', 'REG-2026-002', 'Engineering', 1);

INSERT INTO results (student_id, exam_id, batch_id, physics, chemistry, math, biology_ict, total_marks, gpa, percentage, merit_position, status)
VALUES
(1, 2, 1, 88, 90, 86, 84, 348, 5.00, 87.00, 2, 'Pass'),
(2, 2, 1, 80, 83, 78, 0, 241, 4.50, 80.33, 8, 'Pass');
