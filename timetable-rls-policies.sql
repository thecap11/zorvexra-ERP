-- ClassHub ERP - Timetable RLS Policies
-- Production-Ready Solution: Enable RLS with proper policies
-- Run this in Supabase SQL Editor

-- Step 1: Enable Row Level Security on timetable_slots
ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view timetable for their class" ON timetable_slots;
DROP POLICY IF EXISTS "CRs can manage timetable for their class" ON timetable_slots;

-- Step 3: Create policy - All users can SELECT timetable for their class
CREATE POLICY "Users can view timetable for their class" 
ON timetable_slots FOR SELECT 
USING (
  class_id IN (
    SELECT class_id FROM users WHERE id = auth.uid()
  )
);

-- Step 4: Create policy - Only CRs can INSERT/UPDATE/DELETE timetable for their class
CREATE POLICY "CRs can manage timetable for their class" 
ON timetable_slots FOR ALL 
USING (
  class_id IN (
    SELECT class_id FROM users 
    WHERE id = auth.uid() AND role = 'CR'
  )
);

-- Verification queries (run these to test):
-- 1. Check if RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'timetable_slots';

-- 2. List all policies:
-- SELECT * FROM pg_policies WHERE tablename = 'timetable_slots';

-- Expected result:
-- - Students can view (SELECT) timetable for their class
-- - Only CRs can create/update/delete timetable
-- - Both see the same data based on class_id
