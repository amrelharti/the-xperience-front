-- Migration V6: Fix Post Delete Cascade
-- This migration enables cascade delete for post-related tables
-- 
-- Problem: Deleting a post fails with foreign key constraint violation
-- Error: "update or delete on table 'posts' violates foreign key constraint 
--        'fk599539lym3mnkbqks0u806eac' on table 'notifications'"
--
-- Solution: Add ON DELETE CASCADE to foreign key constraints

-- Fix notifications foreign key constraint
ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS fk599539lym3mnkbqks0u806eac;

-- Recreate the constraint with ON DELETE CASCADE
ALTER TABLE notifications
ADD CONSTRAINT fk599539lym3mnkbqks0u806eac
FOREIGN KEY (post_id)
REFERENCES posts(id)
ON DELETE CASCADE;

-- Fix comments foreign key constraint (if exists)
ALTER TABLE comments
DROP CONSTRAINT IF EXISTS fk_comments_post;

ALTER TABLE comments
ADD CONSTRAINT fk_comments_post
FOREIGN KEY (post_id)
REFERENCES posts(id)
ON DELETE CASCADE;

-- Fix post_likes foreign key constraint (if exists)
-- Note: Adjust table/column names based on your actual schema
ALTER TABLE post_likes
DROP CONSTRAINT IF EXISTS fk_post_likes_post;

ALTER TABLE post_likes
ADD CONSTRAINT fk_post_likes_post
FOREIGN KEY (post_id)
REFERENCES posts(id)
ON DELETE CASCADE;

-- Fix post_ratings foreign key constraint (if exists)
-- Note: Adjust table/column names based on your actual schema
ALTER TABLE post_ratings
DROP CONSTRAINT IF EXISTS fk_post_ratings_post;

ALTER TABLE post_ratings
ADD CONSTRAINT fk_post_ratings_post
FOREIGN KEY (post_id)
REFERENCES posts(id)
ON DELETE CASCADE;








