# 🔄 V27 Complete Database Migration Guide

## 🎯 What This Migration Does

This migration **COMPLETELY RESTRUCTURES** your LMS from the old flat structure to the new hierarchical structure you requested.

### **BEFORE (Old Structure):**
```
Module
  └── Courses (videos)
  └── Classes (groups)
```

### **AFTER (New Structure):**
```
Training (renamed from "Module")
  └── Class (belongs to training, has enrollment code)
      └── Module (Week 1, 2, 3... - has access code, sequential)
          └── Course (videos)
          └── Live Session (Zoom meetings)
```

---

## 📋 What V27 Migration Will Do

### **1. Table Renaming:**
```sql
ALTER TABLE modules RENAME TO trainings;
```
- Your existing "modules" table becomes "trainings"
- All data preserved
- All IDs stay the same

### **2. Foreign Key Updates:**
```sql
ALTER TABLE classes RENAME COLUMN module_id TO training_id;
```
- Classes now point to trainings (not modules)

### **3. Creates NEW modules Table:**
```sql
CREATE TABLE modules (
    id UUID PRIMARY KEY,
    class_id UUID REFERENCES classes(id),
    title VARCHAR(255),
    description TEXT,
    order_index INTEGER,
    access_code VARCHAR(50) UNIQUE,
    is_active BOOLEAN,
    ...
);
```
- NEW modules table for Week 1, 2, 3...
- Each module belongs to a class
- Each has unique access code
- Sequential ordering (order_index)

### **4. Updates courses Table:**
```sql
-- Adds new module_id column
ALTER TABLE courses ADD COLUMN module_id UUID REFERENCES modules(id);
-- Keeps old training_id for compatibility
```
- Courses can now belong to new modules
- Backward compatible with old structure

### **5. Creates Default Data:**
```sql
-- Creates "Module 1" for each existing class
INSERT INTO modules (class_id, title, description, order_index)
SELECT id, 'Module 1', 'Default module...', 1
FROM classes;

-- Links existing courses to default Module 1
UPDATE courses SET module_id = (SELECT id FROM modules WHERE...)
```
- Ensures existing data still works
- Every class gets a default "Module 1"
- All existing courses linked to Module 1

---

## 🚀 How to Run the Migration

### **Step 1: Restart Backend**
```bash
cd D:\Ali projet\the-xperience-back
mvn spring-boot:run
```

**What will happen:**
```
✅ Flyway detects V27 migration
✅ Runs: "Migrating schema public to version 27 - Complete System Restructure"
✅ Success: "Successfully applied 1 migration, now at version v27"
✅ Server starts with new structure
```

### **Step 2: Verify Migration**
Check console output for:
```
✅ "Current version of schema public: 26"
✅ "Migrating schema public to version 27..."
✅ "Successfully applied 1 migration to schema public, now at version v27"
```

---

## 🎯 What You'll See After Migration

### **Database Changes:**

**New Tables:**
- ✅ `trainings` (renamed from `modules`)
- ✅ `modules` (NEW - for Week 1, 2, 3...)
- ✅ `module_access` (tracks which students unlocked which modules)
- ✅ `module_access_codes` (codes to unlock modules)

**Updated Tables:**
- ✅ `classes` → now references `training_id` instead of `module_id`
- ✅ `courses` → has both `training_id` (old) and `module_id` (new)
- ✅ `live_sessions` → has both `training_id` (old) and `module_id` (new)

### **Backend Changes:**

**New Entities:**
- ✅ `TrainingEntity.java` (top level)
- ✅ Updated `ModuleEntity.java` (Week 1, 2, 3...)
- ✅ Updated `ClassEntity.java` (references Training)
- ✅ Updated `CourseEntity.java` (supports both old and new)

**New Repositories:**
- ✅ `TrainingRepository.java`
- ✅ `NewModuleRepository.java`
- ✅ Updated `ClassRepository.java`

**New Controllers:**
- ✅ `TrainingController.java` - Manages trainings

### **Frontend Changes:**

**New API Routes:**
- ✅ `/api/trainings` → Get all trainings
- ✅ `/api/trainings/{id}` → Get training with classes

---

## 🧪 Testing the New Structure

### **Test 1: View Trainings**
```
URL: http://localhost:3000
Expected:
  → See "Available Trainings" (same as before, but renamed)
  → All your old "modules" are now "trainings"
  → Data preserved
```

### **Test 2: View Training Details**
```
Click on a training
Expected:
  → See training details
  → See associated classes listed
  → Each class shows "Module 1" by default
```

### **Test 3: View Class Modules**
```
Enroll in a class
Expected:
  → See "Module 1" (created automatically)
  → Module 1 contains all existing courses
  → Can add more modules (Module 2, 3, 4...)
```

### **Test 4: Admin Can Add More Modules**
```
As admin:
  → Go to class
  → Add "Module 2", "Module 3", etc.
  → Each gets unique access code
  → Students must unlock in order (1→2→3)
```

---

## ⚠️ Important Notes

### **Data Preservation:**
- ✅ All existing trainings (old modules) preserved
- ✅ All existing classes preserved
- ✅ All existing courses preserved
- ✅ All enrollments preserved
- ✅ No data loss

### **Backward Compatibility:**
- ✅ Old API endpoints still work (temporarily)
- ✅ Gradual migration supported
- ✅ Both `training_id` and `module_id` in courses table

### **New Features Enabled:**
- ✅ Sequential modules (Week 1, 2, 3...)
- ✅ Module access codes
- ✅ Live sessions per module
- ✅ Progress tracking per module
- ✅ Class-scoped feeds per class

---

## 🎯 Migration Checklist

- [ ] Backend running
- [ ] Migration V27 runs successfully
- [ ] No errors in console
- [ ] Can view trainings in frontend
- [ ] Can view classes for trainings
- [ ] Each class has default "Module 1"
- [ ] Existing courses linked to Module 1
- [ ] Can create new modules (Module 2, 3...)

---

## 📊 Migration Impact

```
╔═══════════════════════════════════════════════════════════╗
║            V27 MIGRATION IMPACT SUMMARY                   ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Tables Renamed:      1 (modules → trainings)            ║
║  Tables Created:      3 (modules, module_access, codes)  ║
║  Tables Updated:      3 (classes, courses, live_sessions)║
║  Entities Created:    1 (TrainingEntity)                 ║
║  Entities Updated:    3 (Module, Class, Course)          ║
║  Repositories Created: 2 (Training, NewModule)           ║
║  Controllers Created:  1 (TrainingController)            ║
║  API Routes Created:   2 (/trainings, /trainings/{id})  ║
║                                                           ║
║  Data Loss:           NONE ✅                            ║
║  Backward Compatible:  YES ✅                            ║
║  Rollback Possible:    YES (with caution)                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🚀 Ready to Migrate!

**Current Status:**
- ✅ Migration script created (V27)
- ✅ Backend entities updated
- ✅ Repositories created
- ✅ Controllers created
- ✅ Frontend API routes ready

**Next Step:**
```bash
cd D:\Ali projet\the-xperience-back
mvn spring-boot:run
```

Watch for successful migration message! 🎯



