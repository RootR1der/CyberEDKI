-- Database Schema for CyberEDKI

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL,
  group_name VARCHAR(100),
  email VARCHAR(255),
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  department VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS academic_groups (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  course INT NOT NULL,
  specialty VARCHAR(255) NOT NULL,
  student_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS subjects (
  id INT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_name VARCHAR(100),
  is_official BOOLEAN DEFAULT TRUE,
  cluster_id INT NOT NULL,
  topics JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS questions (
  id VARCHAR(100) PRIMARY KEY,
  text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer VARCHAR(10) NOT NULL,
  cluster_id INT,
  subject_id INT NOT NULL,
  topic_id VARCHAR(100) NOT NULL,
  subtopic TEXT,
  year INT,
  type VARCHAR(50) NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  explanation TEXT,
  option_explanations JSONB,
  source JSONB,
  status VARCHAR(50) NOT NULL,
  created_by_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_attempts (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100),
  student_name VARCHAR(255),
  group_name VARCHAR(100),
  date VARCHAR(100),
  mode VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  subject_id INT,
  cluster_id INT,
  total_questions INT NOT NULL,
  correct_count INT NOT NULL,
  score_percentage NUMERIC(5,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  duration_seconds INT NOT NULL,
  answers JSONB DEFAULT '[]'::jsonb,
  violations JSONB DEFAULT '[]'::jsonb,
  disqualified BOOLEAN DEFAULT FALSE,
  termination_reason TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(100) PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(100),
  user_name VARCHAR(255),
  user_role VARCHAR(50),
  action VARCHAR(255) NOT NULL,
  details TEXT
);

CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_mode ON test_attempts(mode);
