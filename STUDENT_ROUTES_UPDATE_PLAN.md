# Student Routes Update Plan

## Current Situation
- **Backend is running** on port 8080
- **Admin functionality works** for managing Trainings, TrainingModules, Courses
- **Student routes are outdated** - they still reference old "Module" structure

## System Hierarchy
```
Training (ModuleEntity - 'modules' table)
└── Class (ClassEntity - students enroll with class code)
    └── TrainingModule (TrainingModuleEntity - 'training_modules' table - Week 1, Week 2, etc.)
        └── Course (CourseEntity - video lessons)
            └── LiveSession (optional)
```

## Student Journey
1. **Browse Trainings** - View available trainings (GET /api/public/courses)
2. **Enroll in Class** - Use class code to join a class for a training
3. **View Training Modules** - See modules (weeks) for their enrolled class
4. **Unlock Module** - Use module access code to unlock sequential modules
5. **Watch Courses** - View video lessons within unlocked modules
6. **Attend Live Sessions** - Join live sessions and mark attendance

## Routes That Need Updating

### Frontend Routes (Student View)
- `/courses` → Browse trainings (already correct - shows ModuleEntity)
- `/courses/[id]` → View training detail and its modules (NEEDS UPDATE)
- `/courses/[id]/modules/[moduleId]` → View module detail with courses (NEEDS UPDATE)
- `/classes` → Enroll in classes (check if correct)
- `/my-courses` → View enrolled trainings (check if correct)

### Backend API Routes (Student-facing)
- `GET /api/public/courses` → List trainings ✅ Already correct
- `GET /api/courses/{trainingId}` → Get training details (NEEDS UPDATE to include modules)
- `GET /api/training-modules/{moduleId}` → Get module with courses (CREATE NEW)
- `POST /api/training-modules/{moduleId}/unlock` → Unlock module with code (CREATE NEW)
- `GET /api/classes/my-classes` → Get student's enrolled classes ✅ Probably correct

## Implementation Steps

### Step 1: Backend - Create Student TrainingModule Endpoints
Create `/api/training-modules/...` endpoints for students to:
- View module details with courses
- Unlock module with access code
- Track progress

### Step 2: Backend - Update Training Detail Endpoint
Update `/api/courses/{trainingId}` to return:
- Training info
- List of modules (TrainingModuleEntity) sorted by orderIndex
- Student's progress per module

### Step 3: Frontend - Update Training Detail Page
Update `app/courses/[id]/page.tsx` to:
- Fetch training with its modules
- Display modules (weeks) in order
- Show lock/unlock status
- Allow module unlock with code

### Step 4: Frontend - Create/Update Module Detail Page
Update `app/courses/[id]/modules/[moduleId]/page.tsx` to:
- Fetch module details with courses
- Display courses (videos)
- Show live session integration
- Track course completion

### Step 5: Testing
- Test student journey end-to-end
- Verify access code unlocking
- Check progress tracking



