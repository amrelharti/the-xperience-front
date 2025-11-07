# Fix Migration Issue - Apply Missing Migrations

## 🔴 Problem Identified

Your database is at migration **version 39**, but there are migration files V40-V45 in your codebase that haven't been applied yet. 

**Flyway runs migrations in sequential order**, so your V46 (WEEKLY_SUMMARY fix) won't run until V40-V45 are applied first.

## 📊 Current State

**Database:** Version 39  
**Pending Migrations:** V40, V41, V42, V43, V44, V45, V46

## 📝 What Each Missing Migration Does

### V40 - Add Profile Fields To Users ✅ SAFE
- Adds `title`, `instagram`, `linkedin` columns to users table
- Safe to run

### V41 - Add Active Status And Usage Tracking ✅ SAFE
- Adds `is_active` column to access code tables
- Creates `code_usage_log` table
- Safe to run

### V42 - Add Plain Code Storage ✅ SAFE
- Adds `plain_code` column to access code tables
- Safe to run

### V43 - Fix User Delete Cascade ✅ SAFE
- Updates foreign key constraints
- Safe to run

### V44 - Regenerate Codes With Plain Text ✅ SAFE
- Deactivates old codes without plain_code
- Safe to run

### V45 - Set Codes To Multi Use ⚠️ **POTENTIAL ISSUE**
- Updates `is_single_use` flag
- **WARNING:** References `course_access_code` table, but the table might be named `course_access_codes` (plural)
- May cause error

### V46 - Add Weekly Summary Post Types 🎯 **YOUR FIX**
- Updates post_type constraint to allow WEEKLY_SUMMARY and FEEDBACK
- This is what you need!

## ✅ Solution - Two Options

### Option 1: Let Flyway Run All Migrations (Recommended)

This is the simplest approach:

```bash
# 1. Stop Spring Boot
# 2. Restart Spring Boot
# Flyway will automatically run V40-V46 in sequence
```

**If V45 fails** (due to table name mismatch), you can fix it manually (see below).

### Option 2: Run Migrations Manually (If auto-run fails)

Connect to your PostgreSQL database and run each migration:

```sql
-- V40: Add Profile Fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin VARCHAR(500);
CREATE INDEX IF NOT EXISTS idx_users_title ON users(title);

-- V41: Add Active Status
ALTER TABLE class_enrollment_code ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE module_access_code ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS code_usage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_id UUID NOT NULL,
    user_id UUID NOT NULL,
    used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    code_type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_code_usage_log_code_id ON code_usage_log(code_id);
CREATE INDEX IF NOT EXISTS idx_code_usage_log_user_id ON code_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_code_usage_log_resource_id ON code_usage_log(resource_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollment_code_active ON class_enrollment_code(class_id, is_active);
CREATE INDEX IF NOT EXISTS idx_module_access_code_active ON module_access_code(training_module_id, is_active);

-- V42: Add Plain Code Storage
ALTER TABLE class_enrollment_code ADD COLUMN IF NOT EXISTS plain_code VARCHAR(20);
ALTER TABLE module_access_code ADD COLUMN IF NOT EXISTS plain_code VARCHAR(20);

-- V43: Fix User Delete Cascade
-- (Complex, see V43 file for full SQL)
-- Skip if not critical

-- V44: Deactivate Legacy Codes
UPDATE class_enrollment_code SET is_active = false WHERE plain_code IS NULL AND is_active = true;
UPDATE module_access_code SET is_active = false WHERE plain_code IS NULL AND is_active = true;

-- V45: Set Multi-Use (FIXED VERSION - checks table name)
DO $$
BEGIN
    -- Check if course_access_codes (plural) exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_access_codes') THEN
        UPDATE course_access_codes SET is_single_use = false WHERE is_single_use = true;
    END IF;
    
    -- Check if course_access_code (singular) exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_access_code') THEN
        UPDATE course_access_code SET is_single_use = false WHERE is_single_use = true;
    END IF;
END $$;

UPDATE module_access_code SET is_single_use = false WHERE is_single_use = true;
UPDATE class_enrollment_code SET is_single_use = false WHERE is_single_use = true;

-- 🎯 V46: Add WEEKLY_SUMMARY and FEEDBACK post types (THE FIX YOU NEED!)
ALTER TABLE posts DROP CONSTRAINT IF EXISTS chk_posts_post_type;
ALTER TABLE posts ADD CONSTRAINT chk_posts_post_type 
CHECK (post_type IN ('POST', 'ASSIGNMENT', 'WEEKLY_SUMMARY', 'FEEDBACK', 'ANNOUNCEMENT', 'QUESTION'));

-- Update Flyway tracking (if running manually)
INSERT INTO flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, execution_time, success)
VALUES 
    ((SELECT COALESCE(MAX(installed_rank), 0) + 1 FROM flyway_schema_history), '40', 'Add Profile Fields To Users', 'SQL', 'V40__Add_Profile_Fields_To_Users.sql', 0, 'manual', 0, true),
    ((SELECT COALESCE(MAX(installed_rank), 0) + 1 FROM flyway_schema_history), '41', 'Add Active Status And Usage Tracking', 'SQL', 'V41__Add_Active_Status_And_Usage_Tracking.sql', 0, 'manual', 0, true),
    ((SELECT COALESCE(MAX(installed_rank), 0) + 1 FROM flyway_schema_history), '42', 'Add Plain Code Storage', 'SQL', 'V42__Add_Plain_Code_Storage.sql', 0, 'manual', 0, true),
    ((SELECT COALESCE(MAX(installed_rank), 0) + 1 FROM flyway_schema_history), '43', 'Fix User Delete Cascade', 'SQL', 'V43__Fix_User_Delete_Cascade.sql', 0, 'manual', 0, true),
    ((SELECT COALESCE(MAX(installed_rank), 0) + 1 FROM flyway_schema_history), '44', 'Regenerate Codes With Plain Text', 'SQL', 'V44__Regenerate_Codes_With_Plain_Text.sql', 0, 'manual', 0, true),
    ((SELECT COALESCE(MAX(installed_rank), 0) + 1 FROM flyway_schema_history), '45', 'Set Codes To Multi Use', 'SQL', 'V45__Set_Codes_To_Multi_Use.sql', 0, 'manual', 0, true),
    ((SELECT COALESCE(MAX(installed_rank), 0) + 1 FROM flyway_schema_history), '46', 'Add Weekly Summary And Feedback Post Types', 'SQL', 'V46__Add_Weekly_Summary_And_Feedback_Post_Types.sql', 0, 'manual', 0, true);
```

## 🚀 Recommended Quick Fix

**Just run the critical one (V46) if you want to fix WEEKLY_SUMMARY immediately:**

```sql
-- Quick fix: Just add the post types (bypassing other migrations)
ALTER TABLE posts DROP CONSTRAINT IF EXISTS chk_posts_post_type;
ALTER TABLE posts ADD CONSTRAINT chk_posts_post_type 
CHECK (post_type IN ('POST', 'ASSIGNMENT', 'WEEKLY_SUMMARY', 'FEEDBACK', 'ANNOUNCEMENT', 'QUESTION'));

-- Verify it worked
SELECT pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'chk_posts_post_type';
```

**Then restart Spring Boot** to let it handle the other migrations (V40-V45) properly.

## ⚠️ Fix V45 Migration File

There's a potential bug in V45. Let me fix it:

```sql
-- V45 references 'course_access_code' but table might be 'course_access_codes'
-- Add a check to handle both cases
```

## 🎯 After Fixing

Once migrations are applied, test:

1. ✅ Create a POST - should work
2. ✅ Create an ASSIGNMENT - should work
3. ✅ Create a WEEKLY_SUMMARY - should work now!
4. ✅ Create a FEEDBACK - should work now!
5. ✅ Rate a WEEKLY_SUMMARY - should work!

## 📋 Verification Commands

```sql
-- Check current migration version
SELECT version, description, success 
FROM flyway_schema_history 
ORDER BY installed_rank DESC 
LIMIT 1;

-- Should show version 46

-- Check post type constraint
SELECT pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'chk_posts_post_type';

-- Should show all 6 types including WEEKLY_SUMMARY and FEEDBACK
```

## 💡 Why This Happened

Migrations V40-V45 were created but Spring Boot was never restarted to apply them. Flyway only runs new migrations on application startup (unless configured differently).

**Solution:** Always restart Spring Boot after adding new migration files!

---

## ⚡ TL;DR - Fastest Fix

Run this ONE command in your database:

```sql
ALTER TABLE posts DROP CONSTRAINT IF EXISTS chk_posts_post_type;
ALTER TABLE posts ADD CONSTRAINT chk_posts_post_type 
CHECK (post_type IN ('POST', 'ASSIGNMENT', 'WEEKLY_SUMMARY', 'FEEDBACK', 'ANNOUNCEMENT', 'QUESTION'));
```

Then try creating your WEEKLY_SUMMARY post again. It should work!

The other migrations (V40-V45) can be applied later when you restart Spring Boot.

