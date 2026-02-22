CREATE DATABASE IF NOT EXISTS megaprep_result_db;
USE megaprep_result_db;

CREATE TABLE admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE institutes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  institute_name VARCHAR(180) NOT NULL
);

CREATE TABLE batches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE exams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_name VARCHAR(100) NOT NULL,
  session_name VARCHAR(60) NOT NULL,
  exam_date DATE
);

CREATE TABLE subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subject_name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  roll_number VARCHAR(40) UNIQUE NOT NULL,
  registration_number VARCHAR(40) UNIQUE NOT NULL,
  student_group ENUM('Science','Engineering','Medical') NOT NULL,
  batch_id INT NOT NULL,
  institute_id INT NOT NULL,
  FOREIGN KEY (batch_id) REFERENCES batches(id),
  FOREIGN KEY (institute_id) REFERENCES institutes(id)
);

CREATE TABLE results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  exam_id INT NOT NULL,
  batch_id INT NOT NULL,
  physics DECIMAL(5,2) NOT NULL,
  chemistry DECIMAL(5,2) NOT NULL,
  math DECIMAL(5,2) NOT NULL,
  biology_ict DECIMAL(5,2),
  total_marks DECIMAL(6,2) NOT NULL,
  gpa_percentage DECIMAL(5,2) NOT NULL,
  grade VARCHAR(8) NOT NULL,
  merit_position INT,
  status ENUM('Pass','Fail') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (batch_id) REFERENCES batches(id)
);

INSERT INTO admins (full_name, email, password_hash) VALUES
('Super Admin', 'admin@megaprep.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5cV9fX4f6M7l9Y6wQ0jNenE2no0RvrK');

INSERT INTO institutes (institute_name) VALUES ('MegaPrep Coaching Center');
INSERT INTO batches (name) VALUES ('HSC 2026'), ('HSC 2027');
INSERT INTO exams (exam_name, session_name, exam_date) VALUES
('Weekly Test', '2026 Session', '2026-01-10'),
('Model Test', '2026 Session', '2026-02-15'),
('Final Exam', '2026 Session', '2026-03-20');
INSERT INTO subjects (subject_name) VALUES ('Physics'), ('Chemistry'), ('Math'), ('Biology'), ('ICT');

INSERT INTO students (full_name, roll_number, registration_number, student_group, batch_id, institute_id) VALUES
('Fahim Hasan', 'MP1001', 'REG1001', 'Science', 1, 1),
('Nusrat Jahan', 'MP1002', 'REG1002', 'Medical', 1, 1);

INSERT INTO results (student_id, exam_id, batch_id, physics, chemistry, math, biology_ict, total_marks, gpa_percentage, grade, merit_position, status) VALUES
(1, 2, 1, 85, 82, 88, 80, 335, 83.75, 'A+', 3, 'Pass'),
(2, 2, 1, 78, 75, 70, 82, 305, 76.25, 'A', 8, 'Pass');
