# Leaderboard Quick Fix Guide

## TL;DR - Fast Fix Steps

If your leaderboard is showing "No rankings yet", follow these steps:

### 1️⃣ Start Both Servers

**Backend:**
```bash
cd "D:\Ali projet\the-xperience-back"
./mvnw spring-boot:run
```

**Frontend (in a new terminal):**
```bash
cd "D:\Ali projet\the-xperience-front"
npm run dev
```

### 2️⃣ Open Debug Page

Go to: **http://localhost:3000/debug/leaderboard**

### 3️⃣ Run Diagnostics

Click the **"Run Diagnostics"** button

### 4️⃣ Fix Issues

Look at the numbers displayed:

- **If "Mismatches" > 0**: Click **"Fix Assignment Flags"**
- **If "Rated Assignments" = 0**: See "No Ratings" section below

### 5️⃣ Check Leaderboard

Go to: **http://localhost:3000/leaderboard**

Should now show rankings if you have rated assignments!

---

## 🔍 What the Diagnostics Tell You

| Metric | Meaning | What to Do |
|--------|---------|------------|
| **Total Posts** | All posts in system | Just info |
| **Assignments (by type)** | Posts created as assignments | Just info |
| **Assignments (by flag)** | Posts marked as assignments | Just info |
| **Rated Assignments** | Assignments with peer ratings | **MUST BE > 0** for leaderboard to work |
| **Mismatches** | Data inconsistency issues | **Click "Fix Assignment Flags"** |
| **Without Class** | Assignments not in any class | Won't show in class leaderboard |

---

## 🎯 Common Scenarios

### Scenario 1: "Rated Assignments = 0"

**Problem**: No assignments have been rated yet

**Solution**:
1. Create an assignment (postType: "ASSIGNMENT")
2. Have another student rate it
3. Refresh leaderboard

**Quick Test**:
```
# As Student 1: Create assignment via feed
# As Student 2: Open feed, find assignment, rate it 0-10
# As Anyone: Check leaderboard
```

### Scenario 2: "Mismatches > 0"

**Problem**: Some posts have incorrect flags

**Solution**: Click **"Fix Assignment Flags"** button

### Scenario 3: "No rankings yet" but diagnostics show rated assignments

**Problem**: Possible class enrollment issue

**Solution**:
1. Check "Class Statistics" in diagnostics
2. Verify students are enrolled in classes
3. Verify assignments are associated with classes

---

## 🚀 Testing the Fix

### Create a Test Assignment:
1. Go to feed page: `/feed`
2. Click "New Post"
3. Select Type: **"Assignment"**
4. Add content and submit
5. Note the assignment ID

### Rate the Assignment:
1. Login as a different student
2. Find the assignment in feed
3. Click rate/score option
4. Give a score (0-10)

### Check Leaderboard:
1. Go to: `/leaderboard`
2. Should see the student who submitted with their score
3. Rankings update in real-time as more ratings are added

---

## 📊 Understanding the Leaderboard

**How it works:**
- Students submit assignments
- Other students in the same class rate them (0-10)
- Points = average of all ratings for each assignment
- Total points = sum of all assignment averages
- Leaderboard ranks by total points

**Requirements:**
✅ Must be enrolled in a class  
✅ Must submit assignments  
✅ Assignments must be rated by peers  
✅ Can't rate your own assignments  
✅ Ratings can't be changed once submitted  

---

## 🔧 What I Fixed

### Created Files:
1. **Backend**: `LeaderboardDiagnostics.java` - Diagnostic and fix endpoints
2. **Frontend**: `app/debug/leaderboard/page.tsx` - Debug UI
3. **Docs**: `LEADERBOARD_FIX_GUIDE.md` - Detailed guide
4. **Docs**: `LEADERBOARD_QUICK_FIX.md` - This file

### Backend Endpoints Added:
- `GET /api/debug/leaderboard/diagnose` - Run full diagnostics
- `POST /api/debug/leaderboard/fix-assignment-flags` - Auto-fix data
- `POST /api/debug/leaderboard/recalculate-scores` - Recalculate scores

---

## ⚠️ Important Notes

1. **Debug endpoints should be removed in production**
2. **Students can only rate assignments once** (by design)
3. **Self-rating is prevented** (by design)
4. **Only visible to enrolled students** in each class

---

## 🆘 Still Not Working?

### Check Backend Logs:
The leaderboard controller has extensive logging. Check console output for:
```
=== CLASS LEADERBOARD REQUEST ===
=== CALCULATING CLASS LEADERBOARD ===
```

### Check Browser Console:
Press F12 and look for:
- Network errors (red requests)
- Failed API calls
- JavaScript errors

### Verify Data:
Use the debug page to check:
- Do assignments exist?
- Do they have ratings?
- Are they in classes?
- Are students enrolled?

### Database Direct Check:
If you have database access:
```sql
-- Check assignments
SELECT id, title, is_assignment, post_type, avg_score, score_count, class_id 
FROM posts 
WHERE is_assignment = true;

-- Check ratings
SELECT * FROM post_likes WHERE rating IS NOT NULL;

-- Check enrollments
SELECT * FROM class_enrollments WHERE is_active = true;
```

---

## ✅ Success Checklist

- [ ] Both servers running
- [ ] Debug page accessible
- [ ] Diagnostics show no mismatches
- [ ] At least 1 rated assignment exists
- [ ] Students enrolled in classes
- [ ] Leaderboard page shows rankings

---

## 📞 Contact

If you've followed all steps and it still doesn't work, share:
1. Screenshot of diagnostics page
2. Backend console logs
3. Browser console errors
4. Database query results (if accessible)

