-- ClassHub ERP - Disable RLS (Development/Prototype Solution)
-- Simple fix: Disables all RLS constraints
-- Run this in Supabase SQL Editor if you want to disable RLS completely

-- OPTION 1: Disable RLS on all tables (Simple, no policies needed)

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_statuses DISABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots DISABLE ROW LEVEL SECURITY;

-- If you have these tables, uncomment:
-- ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE cr_messages DISABLE ROW LEVEL SECURITY;

-- Note: This approach is simpler but less secure.
-- Use this for development/prototypes.
-- For production, use timetable-rls-policies.sql instead.

-- After running this, all users can access all data without restrictions.
-- Test with:
-- CR: cr@class.com / password123
-- Student: alice@student.com / password123
