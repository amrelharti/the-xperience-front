# 📚 Module Ordering & Sequential Access Logic

## Overview
The LMS implements a **sequential module access system** where students must complete modules in order (Week 1 → Week 2 → Week 3, etc.).

## 🔐 Access Rules

### Week 1 (First Module)
- ✅ **Always unlockable** with access code
- No prerequisites required
- Students can unlock immediately upon enrollment

### Week 2+ (Subsequent Modules)
- 🔒 **Locked by default**
- ⚠️ **Prerequisites**:
  1. Previous week must be **COMPLETED** (100% progress)
  2. Valid access code required
- ❌ Cannot skip weeks (e.g., can't unlock Week 3 before completing Week 2)

## 📊 Module States

### 1. LOCKED 🔒
- Module not yet accessible
- Shows lock icon
- Two scenarios:
  - **Can Unlock**: Previous week completed → Shows access code input
  - **Cannot Unlock**: Previous week incomplete → Shows "Complete Week X first" message

### 2. IN_PROGRESS 📘
- Module unlocked and accessed
- Progress: 1-99%
- Shows progress percentage
- Blue indicator

### 3. COMPLETED ✅
- Module 100% complete
- Shows checkmark icon
- Green indicator
- Unlocks next week

## 🎯 User Experience

### Visual Indicators

```
Week 1: Introduction to React    [✓] Completed
Week 2: State Management          [📘] In Progress (45%)
Week 3: Advanced Hooks            [🔒] Complete Week 2 first
Week 4: Next.js Basics            [🔒] Locked
```

### Unlock Flow

1. **Student views modules** → Sees sequential list
2. **Week 1** → Can enter access code immediately
3. **Week 2-N** → Must complete previous week first
4. **Progress tracking** → Each week shows completion percentage
5. **Automatic unlock** → Next week becomes available when previous reaches 100%

## 🔢 Ordering System

### OrderIndex
- Each module has an `orderIndex` field (0, 1, 2, etc.)
- Modules are **sorted by orderIndex** on display
- Lower numbers appear first

### Example:
```javascript
Module A: orderIndex = 0  → Week 1
Module B: orderIndex = 1  → Week 2
Module C: orderIndex = 2  → Week 3
```

## 🎓 Completion Calculation

### Module Progress:
- **50% from Video Completion**: Watch 90% of all videos
- **50% from Live Session**: Attend and mark attendance

### Unlocking Next Week:
```
Week 1: 100% (50% videos + 50% live) → Week 2 unlocks
Week 2: 100% (50% videos + 50% live) → Week 3 unlocks
```

## 💻 Implementation Details

### Frontend Logic (app/courses/[id]/page.tsx)

```typescript
// Sort modules by orderIndex
const sortedModules = module.courses.sort((a, b) => 
  (a.orderIndex || 0) - (b.orderIndex || 0)
)

// Check if can unlock
const previousModuleCompleted = index === 0 || 
  sortedModules[index - 1]?.status === "COMPLETED"

const canUnlock = index === 0 || previousModuleCompleted

// Display logic
if (isLocked && !canUnlock) {
  // Show "Complete Week X first" message
} else if (isLocked && canUnlock) {
  // Show access code input
} else {
  // Show "Start Course" button
}
```

### Backend Validation (Required)
The backend should also enforce:
1. Check previous module completion before unlocking
2. Validate access code matches the specific week
3. Return error if trying to skip weeks

## 🚀 Benefits

1. **Structured Learning**: Students follow a logical progression
2. **Prevents Confusion**: Can't accidentally skip important content
3. **Engagement**: Must complete each week to advance
4. **Progress Tracking**: Clear visual feedback on completion
5. **Accountability**: Live sessions required for full completion

## 📱 Mobile Responsiveness
- Compact "Week X" labels on mobile
- Stacked unlock buttons on small screens
- Clear lock/unlock indicators
- Touch-friendly buttons

## 🔄 Future Enhancements
- [ ] Admin override to unlock specific weeks
- [ ] Grace period for live session attendance
- [ ] Partial unlocking (access materials but not videos)
- [ ] Prerequisite customization per module
- [ ] Progress synchronization across devices


