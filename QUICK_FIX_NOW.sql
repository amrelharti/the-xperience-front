-- ⚡ QUICK FIX - Run this ONE command to fix WEEKLY_SUMMARY posts RIGHT NOW
-- This bypasses the migration queue and directly fixes the constraint issue

-- Drop the old constraint that blocks WEEKLY_SUMMARY and FEEDBACK
ALTER TABLE posts DROP CONSTRAINT IF EXISTS chk_posts_post_type;

-- Create new constraint that allows all 6 post types
ALTER TABLE posts ADD CONSTRAINT chk_posts_post_type 
CHECK (post_type IN ('POST', 'ASSIGNMENT', 'WEEKLY_SUMMARY', 'FEEDBACK', 'ANNOUNCEMENT', 'QUESTION'));

-- ✅ Done! Now try creating a WEEKLY_SUMMARY post.

-- Verify it worked:
SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'chk_posts_post_type';
-- You should see all 6 types listed

/*
EXPLANATION:
- Your database is at migration version 39
- Migrations V40-V45 exist but haven't been applied
- Flyway won't run V46 (the fix) until V40-V45 are applied first
- This quick fix bypasses the queue and applies the constraint fix immediately

AFTER THIS:
- Restart Spring Boot to let it apply migrations V40-V46 properly
- This will update the Flyway history and keep everything in sync
*/

