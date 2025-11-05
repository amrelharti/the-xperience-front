# 🚨 CRITICAL BUG: Access Codes Grant Global Access Instead of Per-User Per-Class

## 🐛 The Problem

When **Student A** enters an access code for a module in **Class X**, **ALL students** get access, including **Student B** who didn't enter any code.

### What's Happening:
```
Student A (Class X) enters code → Gets access ✅
Student B (Class X) automatically gets access ❌ (WRONG!)
Student A (Class Y) automatically gets access ❌ (WRONG!)
```

### What SHOULD Happen:
```
Student A (Class X) enters code → Gets access ✅
Student B (Class X) still locked 🔒 (needs their own code)
Student A (Class Y) still locked 🔒 (needs code for that class)
```

---

## 🔍 Root Cause

The backend is likely:
1. **Not checking the USER** when granting/verifying access
2. **Not scoping access to a SPECIFIC CLASS**
3. **Granting access globally** instead of per (user, class, module) combination
4. **Not using cookies/session** properly to identify the requesting user

---

## ✅ Required Backend Fixes

### 1. Database Schema - THREE-WAY Relationship

The access table MUST link **USER + CLASS + MODULE**:

```sql
CREATE TABLE training_module_access (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES users(id),           -- ← USER
    class_id UUID NOT NULL REFERENCES classes(id),           -- ← CLASS
    training_module_id UUID NOT NULL REFERENCES training_modules(id), -- ← MODULE
    has_access BOOLEAN DEFAULT TRUE,
    granted_at TIMESTAMP,
    
    -- ⚠️ CRITICAL: Unique constraint on all three
    UNIQUE KEY unique_student_class_module (student_id, class_id, training_module_id)
);
```

### 2. Fix Entity - TrainingModuleAccess.java

```java
@Entity
@Table(name = "training_module_access")
public class TrainingModuleAccess {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    // ⚠️ CRITICAL: Must link to USER
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;
    
    // ⚠️ CRITICAL: Must link to CLASS
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private Class classEntity;
    
    // ⚠️ CRITICAL: Must link to SPECIFIC MODULE
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_module_id", nullable = false)
    private TrainingModule trainingModule;
    
    private Boolean hasAccess = true;
    private LocalDateTime grantedAt;
    
    // Getters and setters...
}
```

### 3. Fix Repository Query

```java
@Repository
public interface TrainingModuleAccessRepository extends JpaRepository<TrainingModuleAccess, UUID> {
    
    // ⚠️ CRITICAL: Check access for specific user, class, and module
    @Query("SELECT t FROM TrainingModuleAccess t WHERE t.student.id = :studentId AND t.classEntity.id = :classId AND t.trainingModule.id = :moduleId")
    Optional<TrainingModuleAccess> findByStudentIdAndClassIdAndModuleId(
        @Param("studentId") UUID studentId,
        @Param("classId") UUID classId,
        @Param("moduleId") UUID moduleId
    );
    
    // Check if access exists (boolean)
    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM TrainingModuleAccess t WHERE t.student.id = :studentId AND t.classEntity.id = :classId AND t.trainingModule.id = :moduleId AND t.hasAccess = true")
    boolean existsByStudentIdAndClassIdAndModuleId(
        @Param("studentId") UUID studentId,
        @Param("classId") UUID classId,
        @Param("moduleId") UUID moduleId
    );
}
```

### 4. Fix Unlock Endpoint - POST /api/training-modules/{moduleId}/unlock

This is the MOST CRITICAL fix:

```java
@PostMapping("/api/training-modules/{moduleId}/unlock")
public ResponseEntity<?> unlockModuleWithCode(
    @PathVariable UUID moduleId,
    @RequestBody UnlockRequest request, // Should contain: code, classId
    Authentication authentication,
    HttpServletRequest httpRequest
) {
    // ⚠️ STEP 1: Get the CURRENT USER from session/cookie
    String userEmail = authentication.getName();
    User student = userRepository.findByEmail(userEmail)
        .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));
    
    System.out.println("🔓 Unlock request from user: " + student.getName() + " (ID: " + student.getId() + ")");
    
    // ⚠️ STEP 2: Get classId from request body
    UUID classId = request.getClassId();
    if (classId == null) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Class ID is required"));
    }
    
    System.out.println("🏫 For class ID: " + classId);
    
    // ⚠️ STEP 3: Verify the student is enrolled in this class
    boolean isEnrolled = classEnrollmentRepository.existsByStudentIdAndClassId(
        student.getId(), classId
    );
    
    if (!isEnrolled) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("error", "You are not enrolled in this class"));
    }
    
    // ⚠️ STEP 4: Verify the module exists
    TrainingModule module = trainingModuleRepository.findById(moduleId)
        .orElseThrow(() -> new IllegalArgumentException("Training module not found"));
    
    System.out.println("📚 Module: " + module.getTitle());
    
    // ⚠️ STEP 5: Verify access code matches THIS MODULE
    TrainingModuleAccessCode accessCode = trainingModuleAccessCodeRepository
        .findByCodeAndTrainingModuleId(request.getCode(), moduleId)
        .orElseThrow(() -> new IllegalArgumentException("Invalid access code for this module"));
    
    // ⚠️ STEP 6: Check if code is already used
    if (accessCode.getIsUsed()) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "This code has already been used"));
    }
    
    // ⚠️ STEP 7: Check if THIS USER already has access in THIS CLASS
    Optional<TrainingModuleAccess> existingAccess = trainingModuleAccessRepository
        .findByStudentIdAndClassIdAndModuleId(student.getId(), classId, moduleId);
    
    if (existingAccess.isPresent() && existingAccess.get().getHasAccess()) {
        return ResponseEntity.ok(Map.of(
            "message", "You already have access to this module in this class"
        ));
    }
    
    // ⚠️ STEP 8: Grant access to THIS SPECIFIC USER in THIS SPECIFIC CLASS for THIS MODULE
    TrainingModuleAccess access = new TrainingModuleAccess();
    access.setStudent(student);              // ← Specific user
    access.setClassEntity(classRepository.findById(classId).orElseThrow()); // ← Specific class
    access.setTrainingModule(module);        // ← Specific module
    access.setHasAccess(true);
    access.setGrantedAt(LocalDateTime.now());
    
    trainingModuleAccessRepository.save(access);
    
    // ⚠️ STEP 9: Mark code as used
    accessCode.setIsUsed(true);
    accessCode.setStudent(student);
    accessCode.setUsedAt(LocalDateTime.now());
    trainingModuleAccessCodeRepository.save(accessCode);
    
    System.out.println("✅ Access granted to:");
    System.out.println("   User: " + student.getName() + " (ID: " + student.getId() + ")");
    System.out.println("   Class: " + classId);
    System.out.println("   Module: " + module.getTitle());
    
    return ResponseEntity.ok(Map.of(
        "message", "Module unlocked successfully",
        "student", student.getName(),
        "module", module.getTitle(),
        "classId", classId.toString()
    ));
}
```

### 5. Fix GET Training Endpoint - Check Access Per User Per Class

```java
@GetMapping("/api/courses/{trainingId}")
public ResponseEntity<?> getTrainingWithModules(
    @PathVariable UUID trainingId,
    @RequestParam(required = false) UUID classId,
    Authentication authentication
) {
    Training training = trainingRepository.findById(trainingId)
        .orElseThrow(() -> new IllegalArgumentException("Training not found"));
    
    // ⚠️ CRITICAL: Get the CURRENT USER from session
    String userEmail = authentication.getName();
    User student = userRepository.findByEmail(userEmail)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));
    
    System.out.println("🔍 Loading training for user: " + student.getName() + " (ID: " + student.getId() + ")");
    System.out.println("🏫 For class: " + classId);
    
    // If classId not provided, try to get from user's enrollments
    if (classId == null) {
        // Get user's enrolled class for this training
        Optional<ClassEnrollment> enrollment = classEnrollmentRepository
            .findFirstByStudentIdAndTrainingId(student.getId(), trainingId);
        if (enrollment.isPresent()) {
            classId = enrollment.get().getClassEntity().getId();
        }
    }
    
    UUID finalClassId = classId;
    
    // Build response with per-user, per-class, per-module access status
    List<TrainingModuleDTO> modulesWithAccess = training.getModules().stream()
        .map(module -> {
            // ⚠️ CRITICAL: Check access for THIS USER in THIS CLASS for THIS MODULE
            boolean hasAccess = false;
            if (finalClassId != null) {
                hasAccess = trainingModuleAccessRepository.existsByStudentIdAndClassIdAndModuleId(
                    student.getId(),   // ← Current user
                    finalClassId,      // ← Current class
                    module.getId()     // ← Current module
                );
            }
            
            System.out.println("   Module: " + module.getTitle() + " → hasAccess: " + hasAccess);
            
            return TrainingModuleDTO.builder()
                .id(module.getId())
                .title(module.getTitle())
                .description(module.getDescription())
                .hasAccess(hasAccess)
                .status(hasAccess ? "UNLOCKED" : "LOCKED")
                .orderIndex(module.getOrderIndex())
                .build();
        })
        .collect(Collectors.toList());
    
    return ResponseEntity.ok(TrainingDTO.builder()
        .id(training.getId())
        .title(training.getTitle())
        .description(training.getDescription())
        .modules(modulesWithAccess)
        .build());
}
```

---

## 🧪 Testing Steps

### Test Case 1: Different Users, Same Class
1. Student A logs in
2. Student A enters access code for Module 1 in Class X
3. **Expected:** Student A gets access ✅
4. **Log out Student A**
5. Student B logs in
6. Student B views the same training
7. **Expected:** Module 1 is still LOCKED for Student B 🔒
8. **Verify in database:**
   ```sql
   SELECT * FROM training_module_access 
   WHERE class_id = 'class-x-uuid';
   ```
   Should show ONLY Student A's access, NOT Student B's

### Test Case 2: Same User, Different Classes
1. Student A logs in
2. Student A enters code for Module 1 in Class X
3. **Expected:** Student A gets access in Class X ✅
4. Student A switches to Class Y
5. **Expected:** Module 1 is LOCKED in Class Y 🔒
6. Student A enters code for Module 1 in Class Y
7. **Expected:** Student A now has access in BOTH classes ✅

### Test Case 3: Check Database
```sql
-- Should have separate rows for each (user, class, module) combination
SELECT 
    u.name as student_name,
    c.name as class_name,
    tm.title as module_title,
    tma.has_access
FROM training_module_access tma
JOIN users u ON tma.student_id = u.id
JOIN classes c ON tma.class_id = c.id
JOIN training_modules tm ON tma.training_module_id = tm.id;
```

---

## 🔴 Common Mistakes to Avoid

❌ **DON'T** grant access without checking the user from the session  
❌ **DON'T** grant access without a classId  
❌ **DON'T** use a global access flag (e.g., `module.isUnlocked = true`)  
❌ **DON'T** trust the frontend to send the correct userId  
✅ **DO** always get userId from `Authentication` object  
✅ **DO** always check all three: user, class, module  
✅ **DO** log which user is getting access  

---

## 📊 Database Migration

If your current table doesn't have `class_id`:

```sql
ALTER TABLE training_module_access 
ADD COLUMN class_id UUID NOT NULL REFERENCES classes(id);

ALTER TABLE training_module_access 
DROP CONSTRAINT IF EXISTS unique_student_module;

ALTER TABLE training_module_access 
ADD CONSTRAINT unique_student_class_module 
UNIQUE (student_id, class_id, training_module_id);

CREATE INDEX idx_access_lookup 
ON training_module_access(student_id, class_id, training_module_id);
```

---

## 📝 Summary

The fix requires:

1. ✅ Update database schema to include `class_id`
2. ✅ Update `TrainingModuleAccess` entity with `classEntity` field
3. ✅ Update repository queries to check (user, class, module)
4. ✅ Fix unlock endpoint to get user from session and require classId
5. ✅ Fix GET endpoint to check access per (user, class, module)

**Key Principle:** Access is scoped to a **specific USER** in a **specific CLASS** for a **specific MODULE**.

---

## 🔒 Security Notes

- **NEVER trust user IDs from the frontend** - always get from `Authentication`
- **ALWAYS validate** the user is enrolled in the class they're trying to access
- **LOG all access grants** so you can audit who got access when
- **Use database constraints** to prevent duplicate access records


