# 🔄 Codebase Refactoring Guide

## 📊 TERMINOLOGY CHANGES

### Old Naming (Confusing) → New Naming (Clear)

| **Old Name** | **New Name** | **What It Represents** |
|-------------|-------------|----------------------|
| Module (in app/page.tsx) | Training | Top-level program |
| Course (in admin/courses) | Week | Sequential learning unit |
| Module (in admin pages) | Course | Individual video lesson |

---

## 🗂️ FILE STRUCTURE CHANGES

### Current Structure:
```
app/
  ├── admin/
  │   ├── modules/          → Will become: trainings/
  │   └── courses/[id]/     → Will become: trainings/[id]/weeks/
  └── courses/[id]/         → Will become: trainings/[id]/
```

### New Structure:
```
app/
  ├── admin/
  │   ├── trainings/        ← Top level management
  │   │   ├── page.tsx      ← List all trainings
  │   │   ├── new/          ← Create training
  │   │   └── [id]/
  │   │       ├── page.tsx  ← Training details
  │   │       └── weeks/    ← Week management
  │   │           ├── page.tsx          ← List weeks
  │   │           └── [weekId]/
  │   │               ├── page.tsx      ← Week details
  │   │               └── courses/      ← Course management
  │   │                   └── page.tsx  ← Add/edit courses
  └── trainings/[id]/       ← Student view
      ├── page.tsx          ← Training overview + weeks
      └── weeks/[weekId]/
          └── courses/[courseId]/
              └── page.tsx  ← Video player
```

---

## 🔤 INTERFACE CHANGES

### Old Interfaces:
```typescript
interface Module {
  id: string
  title: string
  courses?: Course[]
}

interface Course {
  id: string
  courseId: string  // References parent
  title: string
}
```

### New Interfaces:
```typescript
interface Training {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  isPublished: boolean
}

interface Week {
  id: string
  trainingId: string
  title: string
  description: string
  orderIndex: number
  accessCode?: string
  courses?: Course[]
}

interface Course {
  id: string
  weekId: string
  title: string
  description: string
  videoUrl: string
  durationSeconds: number
  orderIndex: number
}
```

---

## 📝 COMPONENT CHANGES

### Admin Components to Update:
1. **AdminStats.tsx** → Update labels
2. **AdminDashboard.tsx** → Change "Courses" to "Trainings"
3. **AdminCourses.tsx** → Rename to `AdminTrainings.tsx`

### New Components to Create:
1. **WeekManager.tsx** → Manage weeks for a training
2. **CourseManager.tsx** → Manage courses for a week
3. **WeekCard.tsx** → Display week with multiple courses

---

## 🛣️ ROUTE CHANGES

### Old Routes → New Routes:

```
/admin/modules           → /admin/trainings
/admin/modules/new       → /admin/trainings/new
/admin/modules/[id]      → /admin/trainings/[id]
/admin/courses/[id]/modules → /admin/trainings/[id]/weeks

/courses/[id]            → /trainings/[id]
/courses/[id]/modules/[moduleId] → /trainings/[id]/weeks/[weekId]/courses/[courseId]
```

---

## 🎯 PRIORITY ORDER

### Phase 1: Backend-Compatible Changes (No Breaking)
1. ✅ Update UI labels only
2. ✅ Keep API calls the same
3. ✅ Update interfaces with proper names

### Phase 2: Route Updates
1. Create new routes alongside old ones
2. Update internal links
3. Add redirects from old to new

### Phase 3: Full Refactor
1. Update backend API endpoints
2. Update database if needed
3. Remove old routes

---

## 🚀 IMPLEMENTATION STEPS

This guide follows **Phase 1** approach to avoid breaking changes:
- We'll update the UI and terminology
- Keep the backend API calls working
- Map the new names to existing backend structure


