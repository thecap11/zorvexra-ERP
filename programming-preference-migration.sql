-- Zorvexra ERP - Add Programming Preference
-- Simple addition: C vs Java elective preference (similar to German/French)
-- Run this in Supabase SQL Editor

-- Add programming_preference column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS programming_preference TEXT 
CHECK (programming_preference IN ('C', 'JAVA'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_programming_preference ON users(programming_preference);

-- Verification query:
-- SELECT name, programming_preference FROM users WHERE programming_preference IS NOT NULL;

-- To rollback (if needed):
-- ALTER TABLE users DROP COLUMN IF EXISTS programming_preference;
