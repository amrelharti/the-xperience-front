# Database Constraint Fix for WEEKLY_SUMMARY Post Type

## 🔴 Problem

When trying to create a WEEKLY_SUMMARY post, you get this error:
```
ERROR: new row for relation "posts" violates check constraint "chk_posts_post_type"
```

**Root Cause:** The database CHECK constraint `chk_posts_post_type` only allows these post types:
- POST
- ASSIGNMENT
- QUESTION
- ANNOUNCEMENT

But your backend code tries to use:
- POST
- ASSIGNMENT
- **WEEKLY_SUMMARY** ❌ (missing from database)
- **FEEDBACK** ❌ (missing from database)
- ANNOUNCEMENT

## ✅ Solution

A new migration file has been created to fix this issue:

**File:** `V46__Add_Weekly_Summary_And_Feedback_Post_Types.sql`

This migration will update the constraint to allow all post types including WEEKLY_SUMMARY and FEEDBACK.

## 🚀 How to Apply the Fix

### Option 1: Restart Spring Boot Application (Automatic)

If you have Flyway auto-migration enabled (default), simply:

```bash
cd D:\Ali projet\the-xperience-back
mvn clean package
# Then restart your Spring Boot application
```

Spring Boot will automatically run the new migration on startup.

### Option 2: Manual SQL Execution

If migrations aren't running automatically, run this SQL manually:

```sql
-- Drop the old constraint
ALTER TABLE posts DROP CONSTRAINT IF EXISTS chk_posts_post_type;

-- Recreate with all valid post types
ALTER TABLE posts ADD CONSTRAINT chk_posts_post_type 
CHECK (post_type IN ('POST', 'ASSIGNMENT', 'WEEKLY_SUMMARY', 'FEEDBACK', 'ANNOUNCEMENT', 'QUESTION'));
```

**Steps:**
1. Connect to your PostgreSQL database
2. Run the above SQL commands
3. Verify the constraint:
```sql
-- Check the constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'chk_posts_post_type';
```

Expected output should show all 6 post types in the constraint.

## ✔️ Verification

After applying the fix, test by creating a WEEKLY_SUMMARY post:

1. Go to your feed
2. Click "Create Post"
3. Select "Weekly Summary" as post type
4. Fill in the details and submit
5. ✅ Should create successfully without constraint error

## 📋 What Changed

### Before (Old Constraint):
```sql
CHECK (post_type IN ('POST', 'ASSIGNMENT', 'QUESTION', 'ANNOUNCEMENT'))
```

### After (New Constraint):
```sql
CHECK (post_type IN ('POST', 'ASSIGNMENT', 'WEEKLY_SUMMARY', 'FEEDBACK', 'ANNOUNCEMENT', 'QUESTION'))
```

**Note:** We kept `QUESTION` for backward compatibility, even though it's not in the current Java enum.

## 🔍 Checking Migration Status

To see if the migration has been applied:

```sql
-- Check Flyway migration history
SELECT * FROM flyway_schema_history 
WHERE version = '46'
ORDER BY installed_rank DESC;
```

If you see a row with version 46 and `success = true`, the migration has been applied.

## 🐛 Troubleshooting

### Issue: Migration doesn't run automatically

**Solution 1:** Check if Flyway is enabled in `application.properties`:
```properties
spring.flyway.enabled=true
```

**Solution 2:** Run the migration manually using the SQL commands above

### Issue: Migration fails with "constraint already exists"

This is fine! It means someone already manually fixed it. The migration uses `IF EXISTS` to handle this safely.

### Issue: Other applications still can't create WEEKLY_SUMMARY posts

Make sure ALL instances of your backend application have been restarted after the migration.

## 📝 Related Files

- **Migration:** `D:\Ali projet\the-xperience-back\src\main\resources\db\migration\V46__Add_Weekly_Summary_And_Feedback_Post_Types.sql`
- **Entity Enum:** `PostEntity.java` → `PostType` enum
- **Controller:** `FeedController.java` → uses PostType enum

## 💡 Future Prevention

To avoid this issue in the future:

1. **When adding new enum values to PostType:**
   - Always create a corresponding migration to update the database constraint
   - Test creating posts of the new type before deploying

2. **Consider removing the CHECK constraint entirely:**
   - If you trust your application code, you could remove the constraint
   - This would allow more flexibility but less database-level validation
   - Trade-off: easier development vs. stricter data integrity

## 🎯 Quick Command Summary

```bash
# 1. Rebuild backend
cd D:\Ali projet\the-xperience-back
mvn clean package

# 2. Restart your Spring Boot application
# (The migration will run automatically on startup)

# 3. Test creating a WEEKLY_SUMMARY post
# (Should work now!)
```

---

**Status:** ✅ Migration created and ready to apply  
**Priority:** 🔴 HIGH - Required for WEEKLY_SUMMARY feature to work  
**Date:** November 7, 2025

