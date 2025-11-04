-- ============================================
-- Add Profile Fields to Users Table
-- Run this directly on your PostgreSQL database
-- ============================================

-- Add new profile fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin VARCHAR(500);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_users_title ON users(title);

-- Verify the columns were added
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('title', 'instagram', 'linkedin');

-- Sample update to test (replace with actual user email)
-- UPDATE users SET title = 'Full Stack Developer', instagram = '@johndoe', linkedin = 'linkedin.com/in/johndoe' WHERE email = 'your@email.com';

