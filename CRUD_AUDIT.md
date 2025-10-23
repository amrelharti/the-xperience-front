# 🔍 CRUD OPERATIONS AUDIT

## ✅ WHAT YOU HAVE vs ❌ WHAT YOU NEED

### 1. 📚 TRAININGS (Courses in backend)
**Status**: ✅ COMPLETE
- ✅ GET `/api/admin/courses` - List all trainings
- ✅ POST `/api/admin/courses` - Create training
- ✅ GET `/api/admin/courses/[id]` - Get specific training
- ✅ PUT `/api/admin/courses/[id]` - Update training
- ❌ DELETE `/api/admin/courses/[id]` - Delete training (MISSING)

### 2. 👥 CLASSES
**Status**: ✅ COMPLETE
- ✅ GET `/api/admin/classes` - List all classes
- ✅ POST `/api/admin/classes` - Create class
- ✅ GET `/api/admin/classes/[id]` - Get specific class
- ✅ PUT `/api/admin/classes/[id]` - Update class
- ❌ DELETE `/api/admin/classes/[id]` - Delete class (MISSING)

### 3. 📖 MODULES (Weeks)
**Status**: ⚠️ PARTIAL
- ✅ GET `/api/admin/modules` - List all modules (WRONG - lists trainings)
- ✅ POST `/api/admin/modules` - Create module (WRONG - creates training)
- ✅ GET `/api/admin/courses/[id]/modules` - List modules for training
- ✅ POST `/api/admin/courses/[id]/modules` - Create module for training
- ❌ PUT `/api/admin/courses/[id]/modules/[moduleId]` - Update module (MISSING)
- ❌ DELETE `/api/admin/courses/[id]/modules/[moduleId]` - Delete module (MISSING)

### 4. 🎥 COURSES (Videos within modules)
**Status**: ⚠️ PARTIAL
- ✅ GET `/api/admin/courses/[id]/courses` - List courses for training
- ✅ POST `/api/admin/courses/[id]/courses` - Create course for training
- ✅ GET `/api/admin/courses/[id]/courses/[courseId]` - Get specific course
- ✅ PUT `/api/admin/courses/[id]/courses/[courseId]` - Update course
- ❌ DELETE `/api/admin/courses/[id]/courses/[courseId]` - Delete course (MISSING)

### 5. 📺 LIVE SESSIONS
**Status**: ✅ COMPLETE
- ✅ GET `/api/admin/modules/[id]/live-session` - Get live session
- ✅ POST `/api/admin/modules/[id]/live-session` - Create/update live session
- ✅ GET `/api/modules/[id]/live-session` - Get live session (student)
- ✅ POST `/api/modules/[id]/live-session/attend` - Mark attendance

---

## 🚨 CRITICAL ISSUES FOUND

### Issue 1: Wrong API Endpoints
- `/api/admin/modules` should list MODULES, not TRAININGS
- `/api/admin/modules` POST creates TRAININGS, not MODULES

### Issue 2: Missing CRUD Operations
- No DELETE operations for any entity
- No UPDATE operations for modules
- No DELETE operations for courses

### Issue 3: Confusing Structure
- "courses" in API = "trainings" in UI
- "modules" in API = "weeks" in UI (but you want "modules")
- Need to clarify terminology

---

## 🔧 WHAT NEEDS TO BE FIXED

### 1. Fix Module CRUD
```bash
# Current (WRONG):
GET /api/admin/modules → Returns trainings
POST /api/admin/modules → Creates training

# Should be:
GET /api/admin/modules → Returns all modules
POST /api/admin/modules → Creates standalone module
GET /api/admin/courses/[id]/modules → Returns modules for specific training
POST /api/admin/courses/[id]/modules → Creates module for specific training
PUT /api/admin/courses/[id]/modules/[moduleId] → Update module
DELETE /api/admin/courses/[id]/modules/[moduleId] → Delete module
```

### 2. Add Missing DELETE Operations
- DELETE `/api/admin/courses/[id]` - Delete training
- DELETE `/api/admin/classes/[id]` - Delete class
- DELETE `/api/admin/courses/[id]/modules/[moduleId]` - Delete module
- DELETE `/api/admin/courses/[id]/courses/[courseId]` - Delete course

### 3. Fix Terminology Confusion
- Backend: `courses` = Frontend: `trainings`
- Backend: `modules` = Frontend: `modules` (but currently creates trainings)

---

## 🎯 IMMEDIATE ACTION NEEDED

1. **Fix `/api/admin/modules`** - Should handle modules, not trainings
2. **Add missing DELETE endpoints**
3. **Add missing UPDATE endpoints for modules**
4. **Test all CRUD operations**

---

## 📋 TESTING CHECKLIST

### Trainings:
- [ ] Create training
- [ ] List trainings
- [ ] Update training
- [ ] Delete training

### Classes:
- [ ] Create class
- [ ] List classes
- [ ] Update class
- [ ] Delete class

### Modules:
- [ ] Create module for training
- [ ] List modules for training
- [ ] Update module
- [ ] Delete module

### Courses:
- [ ] Create course for training
- [ ] List courses for training
- [ ] Update course
- [ ] Delete course

### Live Sessions:
- [ ] Create live session for module
- [ ] Update live session
- [ ] Mark attendance
- [ ] Get attendance status


