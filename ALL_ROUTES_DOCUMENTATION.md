# 🗺️ Complete Routes Documentation

## 📋 Table of Contents
1. [Admin Routes](#admin-routes)
2. [Student Routes](#student-routes)
3. [Authentication Routes](#authentication-routes)
4. [API Routes](#api-routes)
5. [Route Status (Old vs New)](#route-status)

---

## 🔐 ADMIN ROUTES

### Dashboard & Overview

#### `/admin` (Main Admin Dashboard)
- **Purpose**: Admin homepage with overview stats
- **Features**:
  - Total trainings count
  - Total users count
  - Published trainings count
  - Students count
  - Quick actions
- **Access**: Admin only
- **Status**: ✅ Active

---

### Training Management (NEW)

#### `/admin/trainings` ⭐ NEW
- **Purpose**: List and manage all training programs
- **Features**:
  - View all trainings
  - Search trainings
  - Stats dashboard
  - Create new training
  - Navigate to week management
- **Access**: Admin only
- **Status**: ✅ Active (Recommended)

#### `/admin/trainings/[id]/weeks` ⭐ NEW
- **Purpose**: Manage weeks and courses for a specific training
- **Features**:
  - View all weeks in training
  - Add new weeks
  - Expandable accordion for each week
  - View multiple courses per week
  - Add courses to weeks
  - Edit/delete weeks
  - Access code management
  - Course ordering
- **Access**: Admin only
- **Status**: ✅ Active (Recommended)
- **Example**: `/admin/trainings/abc123/weeks`

---

### Training Management (OLD - Still Works)

#### `/admin/modules` (OLD)
- **Purpose**: Manage training programs (called "Modules" in old system)
- **Features**:
  - List all trainings
  - Create training
  - Edit training
  - Delete training
  - Upload thumbnails
- **Access**: Admin only
- **Status**: ⚠️ Old terminology, use `/admin/trainings` instead

#### `/admin/modules/[id]` (OLD)
- **Purpose**: Edit specific training details
- **Features**:
  - Edit training info
  - Manage live sessions
  - View training details
- **Access**: Admin only
- **Status**: ⚠️ Active but old
- **Example**: `/admin/modules/abc123`

#### `/admin/courses/new` (OLD)
- **Purpose**: Create new training program
- **Features**:
  - Training creation form
  - Thumbnail upload
  - Description
- **Access**: Admin only
- **Status**: ⚠️ Confusing name (actually creates training)

#### `/admin/courses/[id]` (OLD)
- **Purpose**: Edit training
- **Features**:
  - Edit training details
  - Manage settings
- **Access**: Admin only
- **Status**: ⚠️ Old route
- **Example**: `/admin/courses/abc123`

#### `/admin/courses/[id]/modules` (OLD)
- **Purpose**: Manage weeks (called "modules" in old UI)
- **Features**:
  - List weeks
  - Create weeks
  - Edit weeks
  - Access codes
  - Single course per week only
- **Access**: Admin only
- **Status**: ⚠️ Use `/admin/trainings/[id]/weeks` instead
- **Example**: `/admin/courses/abc123/modules`

---

### Class Management

#### `/admin/classes`
- **Purpose**: Manage class groups (promotions)
- **Features**:
  - View all classes
  - Create new class
  - Edit class details
  - Assign students
  - Generate enrollment codes
- **Access**: Admin only
- **Status**: ✅ Active
- **Note**: Classes are groups of students enrolled together

#### `/admin/classes/[id]`
- **Purpose**: Manage specific class
- **Features**:
  - View class details
  - Manage enrolled students
  - View class feed
  - Track progress
  - Generate access codes
- **Access**: Admin only
- **Status**: ✅ Active
- **Example**: `/admin/classes/class123`

---

### User Management

#### `/admin/users`
- **Purpose**: Manage all users
- **Features**:
  - List all users
  - Search users
  - Filter by role (Admin/Student)
  - Edit user details
  - Delete users
  - Assign roles
  - View user stats
- **Access**: Admin only
- **Status**: ✅ Active

---

### Analytics

#### `/admin/analytics`
- **Purpose**: View system analytics
- **Features**:
  - User engagement stats
  - Training completion rates
  - Popular trainings
  - Student progress
  - Class performance
- **Access**: Admin only
- **Status**: ✅ Active

---

## 👨‍🎓 STUDENT ROUTES

### Home & Discovery

#### `/` (Homepage)
- **Purpose**: Student landing page
- **Features**:
  - Browse available trainings
  - View training cards
  - Search trainings
  - Quick enrollment
- **Access**: Public/Student
- **Status**: ✅ Active

#### `/courses` (OLD - confusing name)
- **Purpose**: Browse all available trainings
- **Features**:
  - List all published trainings
  - Filter trainings
  - View details
- **Access**: Public/Student
- **Status**: ⚠️ Should be `/trainings`
- **Note**: "Courses" here means "Trainings"

---

### Training Access

#### `/courses/[id]` (Training Detail Page)
- **Purpose**: View training overview and weeks
- **Features**:
  - Training information
  - Enrollment status
  - List of weeks (Week 1, 2, 3...)
  - Sequential week access
  - Unlock weeks with codes
  - Live session info
  - Progress tracking
- **Access**: Student (enrolled)
- **Status**: ✅ Active
- **Example**: `/courses/training123`
- **Note**: Shows "Week 1, Week 2..." with multiple courses per week

#### `/courses/[id]/courses/[courseId]` (OLD)
- **Purpose**: Watch video course
- **Features**:
  - Video player
  - Course details
  - Progress tracking
- **Access**: Student (enrolled)
- **Status**: ⚠️ Confusing path structure
- **Example**: `/courses/training123/courses/video456`

#### `/courses/[id]/modules/[moduleId]` (Video Player)
- **Purpose**: Watch specific course/video lesson
- **Features**:
  - Video player with controls
  - Progress tracking
  - Mark as complete
  - Watch time tracking
  - Next/Previous navigation
- **Access**: Student (enrolled, week unlocked)
- **Status**: ✅ Active
- **Example**: `/courses/training123/modules/video456`
- **Note**: "modules" here means individual video lessons

#### `/courses/[id]/modules/[moduleId]/unlock`
- **Purpose**: Unlock a specific course/video with access code
- **Features**:
  - Access code input
  - Course preview
  - Unlock confirmation
- **Access**: Student (enrolled)
- **Status**: ✅ Active
- **Example**: `/courses/training123/modules/video456/unlock`

---

### Class Enrollment

#### `/classes`
- **Purpose**: Browse and enroll in classes
- **Features**:
  - View available classes
  - Select training
  - Select class/promotion
  - Enter enrollment code
  - Enroll in class
- **Access**: Student
- **Status**: ✅ Active
- **Note**: Students enroll in a CLASS for a TRAINING

---

### Student Dashboard

#### `/my-courses`
- **Purpose**: Student's enrolled trainings dashboard
- **Features**:
  - List of enrolled trainings
  - Progress for each training
  - Continue learning buttons
  - Completion status
- **Access**: Student (logged in)
- **Status**: ✅ Active

---

### Social Features

#### `/feed`
- **Purpose**: Class social feed
- **Features**:
  - View posts from classmates
  - Class-scoped posts
  - Like posts
  - Comment on posts
  - Share updates
- **Access**: Student (enrolled in class)
- **Status**: ✅ Active

#### `/feed/new`
- **Purpose**: Create new feed post
- **Features**:
  - Post creation form
  - Add text/images
  - Share with class
- **Access**: Student (enrolled in class)
- **Status**: ✅ Active

#### `/feed/posts/[id]`
- **Purpose**: View specific post
- **Features**:
  - Post details
  - Comments
  - Likes
  - Replies
- **Access**: Student (enrolled in class)
- **Status**: ✅ Active
- **Example**: `/feed/posts/post123`

---

### Leaderboard

#### `/leaderboard`
- **Purpose**: View class and module leaderboards
- **Features**:
  - Class-wide rankings
  - Module-specific rankings
  - Points/completion tracking
  - Top performers
- **Access**: Student (enrolled in class)
- **Status**: ✅ Active

---

### Homework

#### `/homework/new`
- **Purpose**: Submit homework assignments
- **Features**:
  - Homework submission form
  - File upload
  - Deadline tracking
- **Access**: Student
- **Status**: ✅ Active

---

### User Profile

#### `/profile`
- **Purpose**: User profile and settings
- **Features**:
  - View/edit profile
  - Change password
  - Update information
  - View enrolled trainings
  - Progress summary
- **Access**: Logged in user
- **Status**: ✅ Active

---

## 🔐 AUTHENTICATION ROUTES

#### `/auth/signin`
- **Purpose**: Login page
- **Features**:
  - Email/password login
  - Google OAuth
  - Remember me
  - Forgot password
- **Access**: Public
- **Status**: ✅ Active

---

## 🧪 TEST ROUTES (Development Only)

#### `/test-auth`
- **Purpose**: Test authentication
- **Access**: Development only
- **Status**: 🔧 Dev/Testing

#### `/test-comment-likes`
- **Purpose**: Test comment/like functionality
- **Access**: Development only
- **Status**: 🔧 Dev/Testing

#### `/test-google`
- **Purpose**: Test Google OAuth
- **Access**: Development only
- **Status**: 🔧 Dev/Testing

---

## 🔄 ROUTE STATUS & RECOMMENDATIONS

### ✅ RECOMMENDED ROUTES (New & Clear)

**Admin:**
- `/admin/trainings` - Training list
- `/admin/trainings/[id]/weeks` - Week management
- `/admin/classes` - Class management
- `/admin/users` - User management
- `/admin/analytics` - Analytics

**Student:**
- `/` - Homepage
- `/courses/[id]` - Training overview & weeks
- `/courses/[id]/modules/[moduleId]` - Video player
- `/classes` - Class enrollment
- `/my-courses` - My trainings
- `/feed` - Social feed
- `/leaderboard` - Rankings
- `/profile` - User profile

---

### ⚠️ OLD ROUTES (Still Work, But Confusing)

**Admin:**
- `/admin/modules` → Use `/admin/trainings` instead
- `/admin/modules/[id]` → Use `/admin/trainings/[id]/weeks` instead
- `/admin/courses/[id]/modules` → Use `/admin/trainings/[id]/weeks` instead

**Student:**
- `/courses` (list) → Should be `/trainings`
- `/courses/[id]/courses/[courseId]` → Confusing nested structure

---

## 🗺️ TYPICAL USER JOURNEYS

### Admin Creating a Training:
```
1. /admin/trainings (view all)
2. /admin/modules/new (create training)
3. /admin/trainings/[id]/weeks (add weeks)
4. Click "Add Week" → Create Week 1, 2, 3...
5. Expand week → Click "Add Course" → Add videos
6. /admin/classes (create class for training)
7. Generate enrollment codes
```

### Student Enrolling & Learning:
```
1. / (browse trainings)
2. /classes (choose class to enroll)
3. Enter enrollment code
4. /courses/[id] (view training weeks)
5. Unlock Week 1 with code
6. /courses/[id]/modules/[videoId] (watch videos)
7. Complete videos
8. Attend live session
9. Week 2 unlocks automatically
10. /leaderboard (check ranking)
11. /feed (interact with classmates)
```

---

## 📊 ROUTE HIERARCHY

```
/
├── auth/
│   └── signin
│
├── admin/ (ADMIN ONLY)
│   ├── (dashboard)
│   ├── trainings/ ⭐ NEW
│   │   └── [id]/
│   │       └── weeks/ ⭐ MULTI-COURSE SUPPORT
│   ├── modules/ (old)
│   │   └── [id]/
│   ├── courses/ (old - actually trainings)
│   │   ├── new/
│   │   └── [id]/
│   │       └── modules/ (old - actually weeks)
│   ├── classes/
│   │   └── [id]/
│   ├── users/
│   └── analytics/
│
├── (student homepage)
├── courses/ (trainings)
│   ├── (list)
│   └── [id]/ (training detail)
│       ├── courses/[courseId]/ (old)
│       └── modules/[moduleId]/ (video)
│           └── unlock/
├── classes/ (enrollment)
├── my-courses/
├── feed/
│   ├── new/
│   └── posts/[id]/
├── leaderboard/
├── homework/new/
└── profile/
```

---

## 💡 KEY TAKEAWAYS

1. **Terminology Confusion**: Old system called trainings "modules" and weeks "courses"
2. **New Admin**: Use `/admin/trainings` for clearer management
3. **Multi-Course**: New `/admin/trainings/[id]/weeks` supports multiple videos per week
4. **Sequential Access**: Students must complete Week 1 before Week 2
5. **Class-Based**: Students enroll in classes, not directly in trainings
6. **Social Features**: Feed is class-scoped
7. **Progress**: 50% videos + 50% live sessions

---

## 🚀 MIGRATION PATH

**Phase 1** (Current):
- New routes work alongside old routes
- Use new routes for new features
- Old routes still functional

**Phase 2** (Future):
- Add redirects from old to new routes
- Update all internal links
- Deprecation warnings

**Phase 3** (Final):
- Remove old routes
- Full migration complete
- Single clear structure


