# Live Session Per Class Implementation - Frontend Complete ✅

## Summary
Successfully updated the frontend to support creating and managing live sessions per class for each training module. This allows admins to create separate live sessions for different classes (e.g., November class, December class) for the same training module.

---

## ✅ Frontend Changes Completed

### 1. **Admin Module Page** (`app/admin/trainings/[id]/modules/[moduleId]/page.tsx`)
   - **Updated to show all classes** for the training
   - **Displays live sessions per class** in separate cards
   - **Allows creating/editing live sessions** for each class individually
   - **Class selector in dialog** when creating new sessions
   - **Cannot change class** when editing existing sessions
   - **Delete functionality** per class

### 2. **Frontend API Route** (`app/api/admin/modules/[id]/live-session/route.ts`)
   - **GET endpoint** now passes `classId` as query parameter to backend
   - **POST endpoint** now passes `classId` from request body as query parameter to backend

### 3. **Student Module Page** (`app/courses/[id]/modules/[moduleId]/page.tsx`)
   - **Updated to fetch live session by classId** - students only see live session for their current class
   - **Requires classId** before attempting to load live session

---

## 🔧 Backend Changes Required

### 1. **Database Schema Changes**

The `live_sessions` table currently has a UNIQUE constraint on `module_id` (or `training_module_id`), which prevents multiple live sessions per module. This needs to be changed:

```sql
-- Remove UNIQUE constraint on module_id/training_module_id
ALTER TABLE live_sessions DROP CONSTRAINT IF EXISTS live_sessions_module_id_key;

-- Add UNIQUE constraint on (training_module_id, class_id) to ensure one session per module per class
ALTER TABLE live_sessions 
ADD CONSTRAINT unique_module_class_session 
UNIQUE (training_module_id, class_id);

-- Add is_archived or is_hidden field to hide old sessions
ALTER TABLE live_sessions 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
```

### 2. **Backend API Endpoints**

All live session endpoints need to support `classId` as a query parameter:

#### GET `/api/admin/modules/{moduleId}/live-session?classId={classId}`
- **Current**: Fetches live session by moduleId only
- **Required**: Fetch live session by moduleId AND classId
- **Returns**: Live session for the specific class, or 404 if not found

#### POST `/api/admin/modules/{moduleId}/live-session?classId={classId}`
- **Current**: Creates/updates live session by moduleId only
- **Required**: Create/update live session for specific moduleId AND classId
- **Request Body**: Should include `classId` field
- **Behavior**: 
  - If session exists for this module+class, update it
  - If no session exists, create new one
  - Should validate that classId belongs to the training

#### DELETE `/api/admin/modules/{moduleId}/live-session?classId={classId}`
- **Current**: Deletes live session by moduleId only
- **Required**: Delete live session for specific moduleId AND classId
- **Returns**: 200 on success, 404 if not found

#### GET `/api/modules/{moduleId}/live-session?classId={classId}` (Student endpoint)
- **Current**: Fetches live session by moduleId only
- **Required**: Fetch live session by moduleId AND classId
- **Returns**: Live session for the specific class (only if not archived)
- **Security**: Should verify student is enrolled in the class

### 3. **Backend Entity/Repository Changes**

#### LiveSessionEntity.java
- Ensure `classId` field exists and is properly mapped
- Add `isArchived` field
- Update unique constraint to be on `(trainingModule, class)` instead of just `trainingModule`

#### LiveSessionRepository.java
- Update `findByTrainingModule()` to `findByTrainingModuleAndClass()`
- Add method: `findByTrainingModuleAndClassAndIsArchivedFalse()`
- Remove any methods that assume one session per module

#### LiveSessionController.java
- Update all endpoints to accept `classId` as query parameter
- Validate that `classId` is provided and belongs to the training
- Filter out archived sessions when returning to students
- Update create/update logic to use both `moduleId` and `classId`

---

## 📋 Testing Checklist

### Admin Features
- [ ] View all classes for a training module
- [ ] Create live session for a specific class
- [ ] Edit live session for a specific class (cannot change class)
- [ ] Delete live session for a specific class
- [ ] See multiple live sessions (one per class) on the same page
- [ ] Create live sessions for different classes independently

### Student Features
- [ ] See only the live session for their enrolled class
- [ ] Do not see live sessions from other classes
- [ ] Do not see archived/hidden live sessions
- [ ] Attendance tracking works per class

### Backend Validation
- [ ] Cannot create duplicate live sessions for same module+class
- [ ] Cannot access live session from a class student is not enrolled in
- [ ] Archived sessions are hidden from students
- [ ] All queries properly filter by classId

---

## 🎯 Key Points

1. **One live session per module per class** - Each class can have its own live session for the same training module
2. **Old sessions are hidden** - When a new class starts, old sessions should be archived/hidden (not deleted)
3. **Students see only their class** - Students only see the live session for the class they're enrolled in
4. **Admins manage per class** - Admins can create and manage live sessions for each class separately

---

## 📝 Notes

- The frontend is complete and ready to work once backend changes are implemented
- The frontend passes `classId` as a query parameter in all API calls
- The admin UI shows all classes and their respective live sessions
- The student UI only shows the live session for their current class


