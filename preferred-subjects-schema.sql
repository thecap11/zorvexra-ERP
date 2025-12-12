-- Zorvexra ERP - Preferred Subjects System Schema
-- This creates tables for flexible elective/subject management

-- ============================================
-- SUBJECTS TABLE
-- ============================================
-- Stores all subjects for a class (normal + elective groups)

CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('NORMAL', 'PREFERRED_GROUP')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, name)
);

-- ============================================
-- SUBJECT OPTIONS TABLE
-- ============================================
-- Stores options for PREFERRED_GROUP subjects
-- Example: For "Language Elective", options would be "German", "French"

CREATE TABLE IF NOT EXISTS subject_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id, name)
);

-- ============================================
-- STUDENT SUBJECT PREFERENCES TABLE
-- ============================================
-- Stores which option each student has chosen for each elective

CREATE TABLE IF NOT EXISTS student_subject_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES subject_options(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);

-- ============================================
-- ALTER TIMETABLE_SLOTS
-- ============================================
-- Add subject_id to link timetable slots to subjects table

ALTER TABLE timetable_slots 
ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_subjects_class_id ON subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_subject_options_subject_id ON subject_options(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_preferences_student_id ON student_subject_preferences(student_id);
CREATE INDEX IF NOT EXISTS idx_student_preferences_subject_id ON student_subject_preferences(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_preferences_option_id ON student_subject_preferences(option_id);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_subject_id ON timetable_slots(subject_id);

-- ============================================
-- RLS POLICIES (if RLS is enabled)
-- ============================================

-- Allow users to view subjects for their class
CREATE POLICY IF NOT EXISTS "Users can view subjects for their class" 
ON subjects FOR SELECT 
USING (
  class_id IN (
    SELECT class_id FROM users WHERE id = auth.uid()
  )
);

-- Only CRs can manage subjects
CREATE POLICY IF NOT EXISTS "CRs can manage subjects for their class" 
ON subjects FOR ALL 
USING (
  class_id IN (
    SELECT class_id FROM users 
    WHERE id = auth.uid() AND role = 'CR'
  )
);

-- Similar policies for subject_options
CREATE POLICY IF NOT EXISTS "Users can view subject options" 
ON subject_options FOR SELECT 
USING (
  subject_id IN (
    SELECT id FROM subjects WHERE class_id IN (
      SELECT class_id FROM users WHERE id = auth.uid()
    )
  )
);

CREATE POLICY IF NOT EXISTS "CRs can manage subject options" 
ON subject_options FOR ALL 
USING (
  subject_id IN (
    SELECT id FROM subjects WHERE class_id IN (
      SELECT class_id FROM users WHERE id = auth.uid() AND role = 'CR'
    )
  )
);

-- Policies for student_subject_preferences
CREATE POLICY IF NOT EXISTS "Users can view all preferences in their class" 
ON student_subject_preferences FOR SELECT 
USING (
  student_id IN (
    SELECT id FROM users WHERE class_id IN (
      SELECT class_id FROM users WHERE id = auth.uid()
    )
  )
);

CREATE POLICY IF NOT EXISTS "CRs can manage preferences for their class" 
ON student_subject_preferences FOR ALL 
USING (
  student_id IN (
    SELECT id FROM users WHERE class_id IN (
      SELECT class_id FROM users WHERE id = auth.uid() AND role = 'CR'
    )
  )
);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE subjects IS 'Stores subjects for each class - both normal subjects and elective groups';
COMMENT ON TABLE subject_options IS 'Stores options for elective subjects (e.g., German, French for Language Elective)';
COMMENT ON TABLE student_subject_preferences IS 'Stores which option each student has chosen for each elective';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables were created:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('subjects', 'subject_options', 'student_subject_preferences');

-- Check indexes:
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('subjects', 'subject_options', 'student_subject_preferences', 'timetable_slots');

-- Check RLS policies:
-- SELECT * FROM pg_policies WHERE tablename IN ('subjects', 'subject_options', 'student_subject_preferences');
