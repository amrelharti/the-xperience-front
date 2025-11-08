-- Migration V5: Fix User Delete Cascade
-- This migration enables cascade delete for user-related tables

-- Fix code_usage_log foreign key constraint
-- Drop the existing constraint that's causing the issue
ALTER TABLE code_usage_log
DROP CONSTRAINT IF EXISTS fkiq8mgvc9q0d4p58dfy7e209hk;

-- Recreate the constraint with ON DELETE CASCADE
ALTER TABLE code_usage_log
ADD CONSTRAINT fkiq8mgvc9q0d4p58dfy7e209hk
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- Fix other potential user-related foreign keys
-- (Add more as needed based on your schema)

-- If there's an enrollment table
ALTER TABLE class_enrollment
DROP CONSTRAINT IF EXISTS fk_class_enrollment_user;

ALTER TABLE class_enrollment
ADD CONSTRAINT fk_class_enrollment_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- If there's a course progress table
ALTER TABLE course_progress
DROP CONSTRAINT IF EXISTS fk_course_progress_user;

ALTER TABLE course_progress
ADD CONSTRAINT fk_course_progress_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- If there's a posts table
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS fk_posts_author;

ALTER TABLE posts
ADD CONSTRAINT fk_posts_author
FOREIGN KEY (author_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- If there's a comments table
ALTER TABLE comments
DROP CONSTRAINT IF EXISTS fk_comments_author;

ALTER TABLE comments
ADD CONSTRAINT fk_comments_author
FOREIGN KEY (author_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- If there's a live session attendance table
ALTER TABLE live_session_attendance
DROP CONSTRAINT IF EXISTS fk_live_session_attendance_user;

ALTER TABLE live_session_attendance
ADD CONSTRAINT fk_live_session_attendance_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- If there's a points history table
ALTER TABLE points_history
DROP CONSTRAINT IF EXISTS fk_points_history_user;

ALTER TABLE points_history
ADD CONSTRAINT fk_points_history_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

