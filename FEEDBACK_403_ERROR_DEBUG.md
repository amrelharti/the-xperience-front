# Debugging 403 Error for FEEDBACK Posts

## 🔴 Error

```
POST https://app.the-xperience.com/api/feed/posts 403 (Forbidden)
```

When trying to create a FEEDBACK post.

## 🤔 Why Is This Strange?

The WEEKLY_SUMMARY request you made earlier **passed authentication successfully** (it failed at the database constraint level, which means it got past all security checks).

But now FEEDBACK is getting rejected with 403 **before** even reaching the database.

## 🔍 Possible Causes

### 1. Session Expired

**Most Likely Cause:** Your authentication token/session may have expired between the two requests.

**Check:**
1. Open browser DevTools (F12)
2. Go to Application tab → Cookies
3. Look for the `SESSION` cookie
4. Check if it exists and hasn't expired

**Fix:** 
- Refresh the page
- Or log out and log back in

### 2. Backend Not Restarted

If you applied the database migration but didn't restart Spring Boot:

**Check:**
- Look for this in backend logs: `Flyway migration V46 applied`

**Fix:**
```bash
cd D:\Ali projet\the-xperience-back
# Stop the current Spring Boot process
# Then rebuild and restart
mvn clean package
java -jar target/your-app.jar
```

### 3. User Role Issue

**Check backend logs for:**
```
User role: STUDENT
or
User role: ADMIN
```

**If you see:**
```
User role: null
```

Then there's an authentication problem.

### 4. CORS Issue

Although less likely, check browser console for CORS errors.

**Fix:** Already configured in SecurityConfig, but verify the frontend URL is in the allowed origins:
```java
config.setAllowedOrigins(List.of(
    "https://app.the-xperience.com",  // Should include your domain
    "http://localhost:3000"
));
```

## 🔧 Quick Fixes to Try

### Fix 1: Refresh Authentication

1. **Log out** from your application
2. **Log back in**
3. Try creating the FEEDBACK post again

### Fix 2: Check Backend Logs

Look for lines like:
```
403 response being sent
or
Authentication failed
or
Access denied
```

This will tell you exactly what's blocking the request.

### Fix 3: Test with WEEKLY_SUMMARY Again

Before the database migration, WEEKLY_SUMMARY got past authentication but failed at database.

Now that the migration is applied, try creating a WEEKLY_SUMMARY post:
- ✅ If it works: Great! The migration worked.
- ❌ If you get 403: Authentication issue affecting all post types.

### Fix 4: Clear Browser Cache

```
1. Press Ctrl+Shift+Delete
2. Clear cookies and cache
3. Refresh the page
4. Log in again
```

## 🎯 Diagnostic Steps

### Step 1: Check Authentication Status

Open browser console and run:
```javascript
document.cookie
```

Look for `SESSION=...` in the output.

**If empty:** You're not authenticated. Log in again.

### Step 2: Check Backend Availability

Try accessing:
```
https://app.the-xperience.com/api/health
```

**Should return:** 200 OK with health status

**If error:** Backend is down or unreachable.

### Step 3: Check User Info

If you have a `/api/me` or `/api/users/me` endpoint, check:
```javascript
fetch('https://app.the-xperience.com/api/users/me', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

**Should return:** Your user object with role

**If 403 or 401:** Authentication is broken.

### Step 4: Test Different Post Types

Try creating:
1. ✅ **POST** (basic post) - Should always work
2. ✅ **ASSIGNMENT** - Should work for students
3. ✅ **WEEKLY_SUMMARY** - Should work now (after migration)
4. ✅ **FEEDBACK** - Should work for students
5. ❌ **ANNOUNCEMENT** - Should ONLY work for admins (403 for students is expected)

If ALL types give 403: **Authentication problem**
If only FEEDBACK/WEEKLY_SUMMARY give 403: **Database constraint issue (migration not applied)**

## 📊 Expected Behavior After Migration

### Before Migration Applied:
- POST: ✅ Works
- ASSIGNMENT: ✅ Works  
- WEEKLY_SUMMARY: ❌ Database constraint error
- FEEDBACK: ❌ Database constraint error (or 403 if auth broken)
- ANNOUNCEMENT: ❌ 403 for students (expected)

### After Migration Applied:
- POST: ✅ Works
- ASSIGNMENT: ✅ Works
- WEEKLY_SUMMARY: ✅ Works
- FEEDBACK: ✅ Works
- ANNOUNCEMENT: ❌ 403 for students (expected)

## 🚨 Common Issues

### Issue: "403 for all post types"

**Cause:** Authentication broken

**Solution:**
1. Check if logged in
2. Check SESSION cookie exists
3. Try logging out and back in
4. Clear browser cache

### Issue: "403 only for FEEDBACK and WEEKLY_SUMMARY"

**Cause:** Database migration not applied OR authentication issue

**Solution:**
1. Check if migration V46 was applied
2. Restart Spring Boot
3. Check backend logs for constraint errors

### Issue: "Database constraint error still appearing"

**Cause:** Migration not applied or failed

**Solution:**
```sql
-- Check if migration ran
SELECT * FROM flyway_schema_history WHERE version = '46';

-- If not, run manually
ALTER TABLE posts DROP CONSTRAINT IF EXISTS chk_posts_post_type;
ALTER TABLE posts ADD CONSTRAINT chk_posts_post_type 
CHECK (post_type IN ('POST', 'ASSIGNMENT', 'WEEKLY_SUMMARY', 'FEEDBACK', 'ANNOUNCEMENT', 'QUESTION'));
```

## 🔍 What to Check in Backend Logs

Look for these patterns:

### Pattern 1: Authentication Success
```
User: <your-email>
User role: STUDENT
Post created with postType: FEEDBACK
```

### Pattern 2: Authentication Failure
```
403 response
or
Access denied
or
Invalid token
```

### Pattern 3: Database Constraint
```
ERROR: new row for relation "posts" violates check constraint "chk_posts_post_type"
```

## ✅ Resolution Checklist

- [ ] Backend is running and accessible
- [ ] Database migration V46 is applied
- [ ] You are logged in (SESSION cookie exists)
- [ ] Your user has STUDENT or ADMIN role
- [ ] Backend logs show no 403 errors
- [ ] Can create POST type successfully
- [ ] Can create ASSIGNMENT type successfully

If all checked and still getting 403 for FEEDBACK:
- Check backend logs for the actual error message
- The logs will tell you exactly why it's being rejected

## 💡 Quick Test

Try this in browser console:
```javascript
// Test creating a simple POST
fetch('/api/feed/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    postType: 'POST',
    content: 'Test post',
    classId: 'd7a5b2a0-b087-4246-93d6-574a0e80fcfb'
  })
}).then(r => r.json()).then(console.log)
```

**If this works:** Authentication is fine, issue is specific to FEEDBACK
**If this fails with 403:** Authentication is broken

---

**Next Step:** Check the backend logs when you try to create the FEEDBACK post. The logs will show the exact reason for the 403 error.

