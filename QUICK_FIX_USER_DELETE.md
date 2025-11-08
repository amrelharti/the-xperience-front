# Quick Fix: User Delete Error ⚡

## The Error You're Getting

```
ERROR: update or delete on table "users" violates foreign key constraint "fkiq8mgvc9q0d4p58dfy7e209hk" on table "code_usage_log"
```

## Quick Solution (5 minutes)

### Step 1: Copy the Migration File to Your Backend

```bash
# If your backend is in a separate folder (adjust path as needed)
cp src/main/resources/db/migration/V5__Fix_User_Delete_Cascade.sql \
   ../the-xperience-back/src/main/resources/db/migration/

# OR if your backend is at a different location
cp src/main/resources/db/migration/V5__Fix_User_Delete_Cascade.sql \
   /path/to/your/backend/src/main/resources/db/migration/
```

### Step 2: Restart Your Backend

```bash
# Navigate to your backend directory
cd ../the-xperience-back  # (or wherever your backend is)

# Restart the backend
mvn spring-boot:run

# OR if you're using a different method
./gradlew bootRun
# or
java -jar target/backend.jar
```

### Step 3: Test User Deletion

1. Go to your admin panel: `http://localhost:3000/admin`
2. Find a test user
3. Click delete
4. Should now work! ✅

---

## What This Fix Does

The migration adds `ON DELETE CASCADE` to the foreign key constraints. This means:

✅ When you delete a user, their related data is automatically deleted:
- Code usage logs
- Course enrollments
- Course progress
- Posts and comments
- Attendance records
- Points history

⚠️ **Warning:** This is permanent deletion. Consider implementing soft delete for production.

---

## If You Don't Have Access to the Backend

### Manual Database Fix

If you have direct access to the database, run this SQL:

```sql
-- Fix the code_usage_log foreign key
ALTER TABLE code_usage_log
DROP CONSTRAINT IF EXISTS fkiq8mgvc9q0d4p58dfy7e209hk;

ALTER TABLE code_usage_log
ADD CONSTRAINT fkiq8mgvc9q0d4p58dfy7e209hk
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;
```

### Connect to Database

```bash
# If using PostgreSQL
psql -h localhost -U your_db_user -d your_database_name

# Then paste and run the SQL above
```

---

## Alternative: Soft Delete (Safer)

Instead of permanently deleting users, you can deactivate them:

### Quick SQL for Soft Delete:

```sql
-- Add deleted_at column
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;

-- "Delete" a user by marking them as deleted
UPDATE users 
SET deleted_at = NOW() 
WHERE id = '59c4819d-7b04-4d4d-b87f-53d9d681402c';
```

This way, the user appears deleted but data is preserved.

---

## Verify the Fix

```sql
-- Check the foreign key constraint
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'code_usage_log'
  AND kcu.column_name = 'user_id';
```

Expected result: `delete_rule` should be `CASCADE`

---

## Files Created

1. ✅ **Migration:** `src/main/resources/db/migration/V5__Fix_User_Delete_Cascade.sql`
2. ✅ **Detailed Guide:** `FIX_USER_DELETE_CASCADE.md`
3. ✅ **This Quick Fix:** `QUICK_FIX_USER_DELETE.md`
4. ✅ **Frontend Updated:** Better error messages in `app/admin/page.tsx`

---

## Status

✅ **Frontend Updated** - Shows better error messages
✅ **Migration Created** - Ready to apply
⏳ **Backend Restart Needed** - To apply the migration
⏳ **Testing Required** - After restart

---

## Need Help?

- Can't find your backend folder? Look for:
  - `../the-xperience-back`
  - `backend/`
  - `server/`
  - Any folder with `pom.xml` or `build.gradle`

- Still getting errors? Check:
  1. Did Flyway run the migration? (Check logs for "V5__Fix_User_Delete_Cascade")
  2. Is the foreign key constraint updated? (Run the verify SQL above)
  3. Are there other foreign keys preventing deletion? (Check error message)

---

## Summary

**Before Fix:**
```
❌ Delete User → ERROR: foreign key constraint violation
```

**After Fix:**
```
✅ Delete User → Automatically deletes all related data → Success!
```

Time to fix: **~5 minutes** ⚡

