# Quick Test Guide - Weekly Summary Rating

## 🚀 Quick Start

### 1. Build and Deploy Backend
```bash
cd D:\Ali projet\the-xperience-back
mvn clean package
# Then restart your Spring Boot application
```

### 2. Build Frontend (Optional - for production)
```bash
cd D:\Ali projet\the-xperience-front
npm run build
```
Or just run in dev mode:
```bash
npm run dev
```

## ✅ Testing Checklist

### Test 1: Weekly Summary Rating Appears
1. Go to your feed
2. Find or create a WEEKLY_SUMMARY post
3. Click on the post to view details
4. ✅ **Verify:** You should see a "Rate this Weekly Summary" section with buttons 1-10

### Test 2: Rate with Value 10
1. In a weekly summary post, click the **10** button
2. Confirm the rating in the popup dialog
3. ✅ **Verify:** You should see "Weekly summary rated successfully" message
4. ✅ **Verify:** Your rating (10/10) should be displayed
5. ✅ **Verify:** The average score should update

### Test 3: Rate with Other Values
1. Find another weekly summary post
2. Try rating with values 1, 5, 7
3. ✅ **Verify:** All values work correctly

### Test 4: Assignment Rating Still Works
1. Go to an ASSIGNMENT post
2. Rate it with any value 1-10
3. ✅ **Verify:** "Assignment rated successfully" message appears
4. ✅ **Verify:** Rating is saved correctly

### Test 5: Cannot Rate Own Posts
1. Create your own weekly summary post
2. Try to rate it
3. ✅ **Verify:** You should see "You cannot rate your own weekly summary"

### Test 6: Cannot Change Rating
1. Rate a weekly summary post with value 5
2. Try to rate it again with value 10
3. ✅ **Verify:** You should see an error "You have already rated this..."

### Test 7: Rating Persistence
1. Rate a weekly summary post
2. Refresh the page
3. ✅ **Verify:** Your rating should still be visible

## 🐛 If Rating 10 Still Doesn't Work

### Check Backend Logs
Look for these log messages when you click the 10 button:
```
=== RATING DEBUG ===
PostId: [some-uuid]
Score: 10
```

If you see `Score: 10`, the frontend is sending it correctly.

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click rating button 10
4. Look for the API call to `/api/feed/posts/.../rate?score=10`
5. Check the response

**If response is 400 (Bad Request):**
- Check the error message in the response body
- This will tell you exactly what validation failed

**If response is 200 (Success):**
- Rating 10 worked! The issue might be in how the frontend displays it

### Common Issues

#### Issue: "Score must be between 0 and 10 (inclusive)"
- **Cause:** Score is null or outside range
- **Solution:** Check that the button click passes the correct value

#### Issue: Rating button not clickable
- **Cause:** User already rated or is the post author
- **Solution:** This is expected behavior

#### Issue: Rating not visible after submission
- **Cause:** State not updating in React
- **Solution:** Hard refresh the page (Ctrl+F5)

## 📊 How to Verify in Database (Optional)

If you have database access:

```sql
-- Check post_likes table for ratings
SELECT 
    pl.id,
    pl.rating,
    pl.created_at,
    u.name as user_name,
    p.content as post_content
FROM post_likes pl
JOIN users u ON pl.user_id = u.id
JOIN posts p ON pl.post_id = p.id
WHERE pl.rating = 10
ORDER BY pl.created_at DESC;
```

This will show all ratings of 10 in the system.

## 🎯 Expected Behavior

### For ASSIGNMENT posts:
- ✅ Rating section visible
- ✅ Can rate 1-10
- ✅ Shows "Rate this Assignment"
- ✅ Success message: "Assignment rated successfully"

### For WEEKLY_SUMMARY posts:
- ✅ Rating section visible
- ✅ Can rate 1-10
- ✅ Shows "Rate this Weekly Summary"
- ✅ Success message: "Weekly summary rated successfully"

### For other post types (POST, FEEDBACK, ANNOUNCEMENT):
- ❌ Rating section NOT visible
- ❌ Cannot rate these types

## 🔍 Debugging Commands

### Check if backend changes are applied:
```bash
cd D:\Ali projet\the-xperience-back
grep -n "WEEKLY_SUMMARY" src/main/java/com/thexperience/backend/feed/FeedController.java
```
Should show lines with WEEKLY_SUMMARY in the rating logic.

### Check if frontend changes are applied:
```bash
cd D:\Ali projet\the-xperience-front
grep -n "WEEKLY_SUMMARY" app/feed/posts/[id]/page.tsx
```
Should show multiple lines with WEEKLY_SUMMARY in rating conditions.

## 💡 Quick Fixes

### If changes aren't appearing:

**Backend:**
```bash
# Make sure you rebuild
mvn clean package -DskipTests
# Then restart the application
```

**Frontend:**
```bash
# Clear Next.js cache
rm -rf .next
# Restart dev server
npm run dev
```

**Browser:**
```
# Hard refresh
Ctrl + F5 (Windows)
Cmd + Shift + R (Mac)
```

---

## Need Help?

If rating 10 still doesn't work after following this guide:

1. Check the browser console for errors
2. Check the backend logs for the rating attempt
3. Verify both backend and frontend have been rebuilt
4. Try with a different browser
5. Clear browser cache completely

The validation explicitly allows 0-10 (inclusive), so rating 10 should definitely work!

