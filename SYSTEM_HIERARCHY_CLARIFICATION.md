# 🎓 LMS System Hierarchy Clarification

## ⚠️ NAMING CONFUSION IN CODEBASE

The current codebase has **inconsistent naming** that needs clarification:

### What We Call It vs. What Code Says:

| **User-Facing Term** | **Code Name** | **What It Actually Is** |
|---------------------|---------------|------------------------|
| **Training** | `Module` (in some files) | Top-level program |
| **Week/Module** | `Course` (in admin pages) | Weekly module |
| **Course/Lesson** | `Module` (in some files) | Individual video lesson |

---

## ✅ CORRECT HIERARCHY (What it SHOULD be):

```
📚 TRAINING (Top Level)
   Example: "Full Stack Web Development Bootcamp"
   
   └─ 📅 WEEK 1 (Module)
       Example: "Introduction to Web Development"
       
       ├─ 🎥 Course 1: "What is Web Development?" (15 min video)
       ├─ 🎥 Course 2: "Setting Up Your Environment" (20 min video)
       ├─ 🎥 Course 3: "HTML Basics" (30 min video)
       └─ 📺 Live Session (60 min)
   
   └─ 📅 WEEK 2 (Module)
       Example: "CSS and Styling"
       
       ├─ 🎥 Course 1: "CSS Fundamentals" (25 min video)
       ├─ 🎥 Course 2: "Flexbox Layout" (30 min video)
       ├─ 🎥 Course 3: "Grid System" (25 min video)
       ├─ 🎥 Course 4: "Responsive Design" (35 min video)
       └─ 📺 Live Session (60 min)
   
   └─ 📅 WEEK 3 (Module)
       Example: "JavaScript Basics"
       
       ├─ 🎥 Course 1: "Variables and Data Types" (20 min video)
       ├─ 🎥 Course 2: "Functions" (30 min video)
       ├─ 🎥 Course 3: "DOM Manipulation" (40 min video)
       └─ 📺 Live Session (60 min)
```

---

## 🔑 KEY POINTS:

### 1. **Training (Top Level)**
- Main program/bootcamp
- Example: "Full Stack Development", "Data Science Bootcamp"
- Students enroll in ONE training per class
- Has multiple weeks/modules

### 2. **Week/Module (Middle Level)**
- Sequential learning units (Week 1, Week 2, Week 3...)
- **Each week can have MULTIPLE courses (videos)**
- Requires access code to unlock
- Must complete previous week to unlock next
- Has ONE live session per week

### 3. **Course (Bottom Level)**
- Individual video lessons
- Multiple courses per week
- Example: "Introduction Video", "Setup Tutorial", "Coding Exercise"
- Each has its own video URL and duration

---

## 📊 DATABASE STRUCTURE (What We Need):

```sql
trainings
  - id
  - title ("Full Stack Development")
  - description
  - thumbnail_url

modules (weeks)
  - id
  - training_id
  - title ("Week 1: Introduction")
  - description
  - order_index (0, 1, 2...)
  - access_code

courses (video lessons)
  - id
  - module_id
  - title ("HTML Basics")
  - description
  - video_url
  - duration_seconds
  - order_index (0, 1, 2...)

live_sessions
  - id
  - module_id (one per week)
  - title
  - starts_at
  - meeting_url
```

---

## 🎯 CURRENT IMPLEMENTATION STATUS:

### ✅ What Works:
- Sequential week ordering
- Access code per week
- Live session per week
- Progress tracking

### ⚠️ What's Confusing:
- **Naming inconsistency** in code
- Admin UI shows "Modules" but should show "Weeks"
- "Courses" in admin are actually "Weeks"

### 🔧 What Needs Fixing:
1. **Update Admin UI** to show:
   - "Trainings" (top level)
   - "Weeks" (not "modules")
   - "Courses/Lessons" (individual videos)

2. **Multiple Courses Per Week**:
   - Currently, admin can only create ONE video per week
   - Need UI to add MULTIPLE courses to each week

---

## 💡 RECOMMENDED STRUCTURE:

### Admin Dashboard Flow:
```
1. Create Training
   ↓
2. Add Weeks to Training (Week 1, Week 2...)
   ↓
3. Add Multiple Courses to Each Week
   ↓
4. Schedule Live Session for Each Week
   ↓
5. Generate Access Codes per Week
```

### Student View:
```
1. Browse Trainings
   ↓
2. Enroll in Class (with class code)
   ↓
3. See Week 1 (unlocked)
   ↓
4. Watch Multiple Courses in Week 1
   ↓
5. Attend Live Session
   ↓
6. Complete Week 1 (100%)
   ↓
7. Unlock Week 2 (with week code)
   ↓
8. Repeat...
```

---

## 🚀 ANSWER TO YOUR QUESTION:

**YES! Each week/module CAN and SHOULD have multiple courses (videos).**

The system is designed for this, but:
1. The naming is confusing in the code
2. The admin UI might need updates to support adding multiple courses easily
3. The student view already displays multiple courses per week (via `module.courses?.map()`)

---

## 📝 TERMINOLOGY STANDARDIZATION:

From now on, let's use:
- **Training** = Top level (the bootcamp/program)
- **Week** = Sequential learning unit (Week 1, 2, 3...)
- **Course** = Individual video lesson
- **Live Session** = Weekly live class

This matches the user's original requirements!


