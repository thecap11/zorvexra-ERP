-- Migration to add ADMIN role support for multi-class management
-- Run this in Supabase SQL Editor

-- 1. Update users table role constraint to include ADMIN
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('ADMIN', 'CR', 'STUDENT'));

-- 2. Seed admin user (class_id can be NULL for admin)
INSERT INTO users (email, password, name, role, roll_no, class_id)
VALUES (
    'admin@classhub.com',
    'admin123',
    'Admin User',
    'ADMIN',
    NULL,  -- Admin doesn't need roll_no
    NULL   -- Admin doesn't belong to any specific class
)
ON CONFLICT (email) DO NOTHING;

-- 3. Add comment for documentation
COMMENT ON COLUMN users.class_id IS 'Foreign key to classes table. NULL for ADMIN users, required for CR and STUDENT users.';

-- Verify the changes
SELECT email, name, role, class_id FROM users WHERE role = 'ADMIN';
