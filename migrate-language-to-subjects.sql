-- Zorvexra ERP - Migration Script
-- Migrates existing language preference data to new preferred subjects system
-- RUN THIS AFTER: preferred-subjects-schema.sql

-- ============================================
-- PREREQUISITE CHECK
-- ============================================
-- Ensure the new tables exist before running this migration

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'subjects') THEN
    RAISE EXCEPTION 'Table "subjects" does not exist. Run preferred-subjects-schema.sql first!';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'subject_options') THEN
    RAISE EXCEPTION 'Table "subject_options" does not exist. Run preferred-subjects-schema.sql first!';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'student_subject_preferences') THEN
    RAISE EXCEPTION 'Table "student_subject_preferences" does not exist. Run preferred-subjects-schema.sql first!';
  END IF;
END $$;

-- ============================================
-- STEP 1: Create "Language Elective" subject for each class
-- ============================================

INSERT INTO subjects (class_id, name, type)
SELECT DISTINCT class_id, 'Language Elective', 'PREFERRED_GROUP'
FROM users
WHERE class_id IS NOT NULL
ON CONFLICT (class_id, name) DO NOTHING;

-- ============================================
-- STEP 2: Create "German" and "French" options for each Language Elective
-- ============================================

-- Insert German option
INSERT INTO subject_options (subject_id, name)
SELECT id, 'German'
FROM subjects
WHERE name = 'Language Elective' AND type = 'PREFERRED_GROUP'
ON CONFLICT (subject_id, name) DO NOTHING;

-- Insert French option
INSERT INTO subject_options (subject_id, name)
SELECT id, 'French'
FROM subjects
WHERE name = 'Language Elective' AND type = 'PREFERRED_GROUP'
ON CONFLICT (subject_id, name) DO NOTHING;

-- ============================================
-- STEP 3: Migrate student preferred_language to student_subject_preferences
-- ============================================

-- For students with preferred_language = 'GERMAN'
INSERT INTO student_subject_preferences (student_id, subject_id, option_id)
SELECT 
  u.id AS student_id,
  s.id AS subject_id,
  so.id AS option_id
FROM users u
JOIN subjects s ON s.class_id = u.class_id AND s.name = 'Language Elective'
JOIN subject_options so ON so.subject_id = s.id AND so.name = 'German'
WHERE u.preferred_language = 'GERMAN'
ON CONFLICT (student_id, subject_id) DO NOTHING;

-- For students with preferred_language = 'FRENCH'
INSERT INTO student_subject_preferences (student_id, subject_id, option_id)
SELECT 
  u.id AS student_id,
  s.id AS subject_id,
  so.id AS option_id
FROM users u
JOIN subjects s ON s.class_id = u.class_id AND s.name = 'Language Elective'
JOIN subject_options so ON so.subject_id = s.id AND so.name = 'French'
WHERE u.preferred_language = 'FRENCH'
ON CONFLICT (student_id, subject_id) DO NOTHING;

-- ============================================
-- STEP 4: Update timetable_slots with subject_id for German/French
-- ============================================

-- This is more complex because we need to match subject_name to our new subjects
-- We'll create subjects for German and French as separate subjects (for backward compatibility)
-- OR link directly to Language Elective

-- Option A: Link slots directly to Language Elective
UPDATE timetable_slots ts
SET subject_id = s.id
FROM subjects s
WHERE s.name = 'Language Elective'
  AND s.class_id = ts.class_id
  AND (ts.subject_name ILIKE '%german%' OR ts.subject_name ILIKE '%french%');

-- ============================================
-- STEP 5: Create normal subjects from existing timetable (optional)
-- ============================================

-- This creates NORMAL subjects for all unique subject_names in timetable
-- that aren't already migrated

INSERT INTO subjects (class_id, name, type)
SELECT DISTINCT 
  ts.class_id,
  ts.subject_name,
  'NORMAL'
FROM timetable_slots ts
WHERE ts.subject_id IS NULL  -- Not yet migrated
  AND ts.subject_name IS NOT NULL
  AND ts.subject_name != ''
  AND ts.subject_name NOT ILIKE '%german%'
  AND ts.subject_name NOT ILIKE '%french%'
ON CONFLICT (class_id, name) DO NOTHING;

-- Link these newly created subjects to timetable slots
UPDATE timetable_slots ts
SET subject_id = s.id
FROM subjects s
WHERE s.class_id = ts.class_id
  AND s.name = ts.subject_name
  AND ts.subject_id IS NULL;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check migration results:

-- 1. Count Language Elective subjects created:
-- SELECT COUNT(*) as language_elective_count FROM subjects WHERE name = 'Language Elective';

-- 2. Count German/French options created:
-- SELECT s.class_id, s.name as subject_name, so.name as option_name
-- FROM subjects s
-- JOIN subject_options so ON so.subject_id = s.id
-- WHERE s.name = 'Language Elective'
-- ORDER BY s.class_id, so.name;

-- 3. Count migrated student preferences:
-- SELECT COUNT(*) as migrated_preferences FROM student_subject_preferences;

-- 4. Count timetable slots linked to subjects:
-- SELECT 
--   COUNT(*) FILTER (WHERE subject_id IS NOT NULL) as linked_slots,
--   COUNT(*) FILTER (WHERE subject_id IS NULL) as unlinked_slots
-- FROM timetable_slots;

-- 5. Verify student preferences match old preferred_language:
-- SELECT 
--   u.name,
--   u.preferred_language as old_preference,
--   s.name as subject_name,
--   so.name as selected_option
-- FROM users u
-- LEFT JOIN student_subject_preferences ssp ON ssp.student_id = u.id
-- LEFT JOIN subjects s ON s.id = ssp.subject_id
-- LEFT JOIN subject_options so ON so.id = ssp.option_id
-- WHERE u.preferred_language IS NOT NULL
-- ORDER BY u.name;

-- ============================================
-- ROLLBACK (if needed)
-- ============================================

-- CAUTION: Only run this if migration failed and you need to start over

-- DELETE FROM student_subject_preferences;
-- DELETE FROM subject_options;
-- DELETE FROM subjects;
-- UPDATE timetable_slots SET subject_id = NULL;
