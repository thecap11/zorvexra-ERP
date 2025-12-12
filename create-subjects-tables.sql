-- Zorvexra ERP - Preferred Subjects System Database Schema
-- Creates 3 new tables for flexible subject/elective management
-- Run this in Supabase SQL Editor

-- ============================================
-- TABLE 1: SUBJECTS
-- ============================================
-- Stores all subjects for each class (normal subjects + elective groups)

CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('NORMAL', 'PREFERRED_GROUP')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, name)
);

-- ============================================
-- TABLE 2: SUBJECT_OPTIONS
-- ============================================
-- Stores options for PREFERRED_GROUP subjects
-- Example: For "Language Elective", options would be "German", "French"
-- Example: For "Programming Elective", options would be "C", "Java"

CREATE TABLE IF NOT EXISTS subject_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id, name)
);

-- ============================================
-- TABLE 3: STUDENT_SUBJECT_PREFERENCES
-- ============================================
-- Stores which option each student has chosen for each elective subject

CREATE TABLE IF NOT EXISTS student_subject_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES subject_options(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_subjects_class_id ON subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_subjects_type ON subjects(type);
CREATE INDEX IF NOT EXISTS idx_subject_options_subject_id ON subject_options(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_preferences_student_id ON student_subject_preferences(student_id);
CREATE INDEX IF NOT EXISTS idx_student_preferences_subject_id ON student_subject_preferences(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_preferences_option_id ON student_subject_preferences(option_id);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE subjects IS 'Stores subjects for each class - both normal subjects and elective groups';
COMMENT ON TABLE subject_options IS 'Stores options for elective subjects (e.g., German/French for Language, C/Java for Programming)';
COMMENT ON TABLE student_subject_preferences IS 'Stores which option each student has chosen for each elective subject';

COMMENT ON COLUMN subjects.type IS 'NORMAL = regular subject for all students, PREFERRED_GROUP = elective with multiple options';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables were created:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('subjects', 'subject_options', 'student_subject_preferences');

-- Check indexes:
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('subjects', 'subject_options', 'student_subject_preferences');

-- Count rows in new tables:
-- SELECT 
--   (SELECT COUNT(*) FROM subjects) as subjects_count,
--   (SELECT COUNT(*) FROM subject_options) as options_count,
--   (SELECT COUNT(*) FROM student_subject_preferences) as preferences_count;

-- ============================================
-- ROLLBACK (if needed to undo)
-- ============================================

-- CAUTION: Only run this if you need to completely remove these tables
-- DROP TABLE IF EXISTS student_subject_preferences CASCADE;
-- DROP TABLE IF EXISTS subject_options CASCADE;
-- DROP TABLE IF EXISTS subjects CASCADE;
