-- ClassHub ERP - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor

-- 1. CREATE TABLES

-- Classes Table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  section TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Plain text for prototype (not production!)
  role TEXT CHECK (role IN ('CR', 'STUDENT')) NOT NULL,
  roll_no TEXT,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, roll_no)
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('ASSIGNMENT', 'ATTENDANCE')) NOT NULL,
  start_date DATE,
  due_date DATE,
  attendance_date DATE,
  period_index INTEGER,
  subject TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Statuses Table
CREATE TABLE IF NOT EXISTS task_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('NOT_ASSIGNED', 'NOT_COMPLETED', 'COMPLETED', 'PRESENT', 'ABSENT', 'OTHER')) NOT NULL,
  remarks TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, student_id)
);

-- Timetable Slots Table
CREATE TABLE IF NOT EXISTS timetable_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  day_of_week TEXT CHECK (day_of_week IN ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT')) NOT NULL,
  period_index INTEGER NOT NULL CHECK (period_index >= 1 AND period_index <= 9),
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  subject_name TEXT NOT NULL,
  subject_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, day_of_week, period_index)
);

-- 2. INSERT SEED DATA

-- Insert demo class
INSERT INTO classes (id, name, section) VALUES 
  ('class-demo', 'Computer Science', 'A')
ON CONFLICT (id) DO NOTHING;

-- Insert primary CR
INSERT INTO users (id, name, email, password, role, class_id) VALUES 
  ('cr-primary', 'Primary CR', 'cr@class.com', 'password123', 'CR', 'class-demo')
ON CONFLICT (id) DO NOTHING;

-- Insert demo students
INSERT INTO users (name, email, password, role, roll_no, class_id) VALUES 
  ('Alice Student', 'alice@student.com', 'password123', 'STUDENT', '001', 'class-demo'),
  ('Bob Student', 'bob@student.com', 'password123', 'STUDENT', '002', 'class-demo'),
  ('Charlie Student', 'charlie@student.com', 'password123', 'STUDENT', '003', 'class-demo')
ON CONFLICT (email) DO NOTHING;

-- 3. SUCCESS MESSAGE
-- If no errors appeared, your database is ready!
-- Next, add your Supabase credentials to .env.local in the project root:
-- 
-- VITE_SUPABASE_URL=your_supabase_project_url
-- VITE_SUPABASE_ANON_KEY=your_anon_key
