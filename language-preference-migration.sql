-- Language Preference Migration
-- Add preferred_language column to users table
-- Run this SQL in your Supabase SQL Editor

-- Add the preferred_language column with CHECK constraint
ALTER TABLE users 
ADD COLUMN preferred_language TEXT 
CHECK (preferred_language IN ('GERMAN', 'FRENCH'));

-- The column defaults to NULL, which means no language preference is assigned
-- CRs will manually assign language preferences through the UI
