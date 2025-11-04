# 🔧 Backend Fix: Training Module Access Code Issue

## 🐛 Problem

When a student uses an access code for a specific **training module**, they get access to **ALL modules** in the training instead of just the one module the code was generated for.

### Example Scenario:
```
Training: "Web Development"
  ├─ Module 1: "Frontend Basics" (generate code ABC123 for this)
  └─ Module 2: "Backend Basics"

Expected: Code ABC123 unlocks ONLY "Frontend Basics"
Actual: Code ABC123 unlocks BOTH modules ❌
```

---

## 🔍 Root Cause

The backend code is likely:
1. **Not filtering by module ID** when verifying access codes
2. **Granting access at the Training level** instead of Training Module level
3. **Using the wrong database query** (e.g., `findByCode()` instead of `findByCodeAndTrainingModuleId()`)

---

## ✅ Required Backend Changes

### 1. Check Your Entity Structure

**File:** `TrainingModuleAccessCode.java` (or similar)

```java
@Entity
@Table(name = "training_module_access_codes")
public class TrainingModuleAccessCode {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    private String code;
    
    // ⚠️ CRITICAL: Must link to SPECIFIC training module, not training
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_module_id", nullable = false) // ← Must exist
    private TrainingModule trainingModule; // ← This field is required
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private User student;
    
    private boolean isUsed;
    
    private LocalDateTime createdAt;
    private LocalDateTime usedAt;
    
    // Getters and setters...
}
```

### 2. Fix Repository Query Method

**File:** `TrainingModuleAccessCodeRepository.java`

```java
@Repository
public interface TrainingModuleAccessCodeRepository extends JpaRepository<TrainingModuleAccessCode, UUID> {
    
    // ❌ WRONG - This allows code to unlock any module
    // Optional<TrainingModuleAccessCode> findByCode(String code);
    
    // ✅ CORRECT - Match both code AND module ID
    @Query("SELECT t FROM TrainingModuleAccessCode t WHERE t.code = :code AND t.trainingModule.id = :moduleId")
    Optional<TrainingModuleAccessCode> findByCodeAndTrainingModuleId(
        @Param("code") String code, 
        @Param("moduleId") UUID moduleId
    );
    
    // Get unused codes for a specific module (for admin)
    List<TrainingModuleAccessCode> findByTrainingModuleIdAndIsUsedFalse(UUID moduleId);
}
```

### 3. Fix Code Generation Endpoint

**File:** `TrainingModuleController.java` or similar admin controller

**Endpoint:** `POST /api/admin/training-modules/{moduleId}/codes`

```java
@PostMapping("/api/admin/training-modules/{moduleId}/codes")
public ResponseEntity<?> generateAccessCodes(
    @PathVariable UUID moduleId,  // ← Training MODULE ID (not training ID!)
    @RequestBody GenerateCodesRequest request,
    Authentication authentication
) {
    // Verify the training module exists
    TrainingModule module = trainingModuleRepository.findById(moduleId)
        .orElseThrow(() -> new IllegalArgumentException("Training module not found: " + moduleId));
    
    List<String> generatedCodes = new ArrayList<>();
    
    for (int i = 0; i < request.getCount(); i++) {
        TrainingModuleAccessCode accessCode = new TrainingModuleAccessCode();
        accessCode.setCode(generateUniqueCode()); // Your code generation
        accessCode.setTrainingModule(module); // ← Set SPECIFIC module
        accessCode.setIsUsed(false);
        accessCode.setCreatedAt(LocalDateTime.now());
        
        trainingModuleAccessCodeRepository.save(accessCode);
        generatedCodes.add(accessCode.getCode());
        
        System.out.println("🔑 Generated code: " + accessCode.getCode() + " for module: " + module.getTitle());
    }
    
    return ResponseEntity.ok(Map.of("codes", generatedCodes));
}

private String generateUniqueCode() {
    // Your existing code generation logic
    return "TM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
}
```

### 4. Fix Code Verification/Unlock Endpoint (MOST CRITICAL)

**File:** `TrainingModuleController.java`

**Endpoint:** `POST /api/training-modules/{moduleId}/unlock`

```java
@PostMapping("/api/training-modules/{moduleId}/unlock")
public ResponseEntity<?> unlockModuleWithCode(
    @PathVariable UUID moduleId,  // ← The specific module being unlocked
    @RequestBody UnlockRequest request,
    Authentication authentication
) {
    String userId = authentication.getName();
    User student = userRepository.findByEmail(userId)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));
    
    // Verify the module exists
    TrainingModule module = trainingModuleRepository.findById(moduleId)
        .orElseThrow(() -> new IllegalArgumentException("Training module not found"));
    
    System.out.println("🔓 Attempting to unlock module: " + module.getTitle() + " (ID: " + moduleId + ")");
    System.out.println("🔑 Using code: " + request.getCode());
    
    // ⚠️ CRITICAL FIX: Verify code matches THIS SPECIFIC MODULE
    TrainingModuleAccessCode accessCode = trainingModuleAccessCodeRepository
        .findByCodeAndTrainingModuleId(request.getCode(), moduleId)
        .orElseThrow(() -> new IllegalArgumentException("Invalid access code for this module"));
    
    System.out.println("✅ Found matching code. Module award: " + accessCode.getTrainingModule().getTitle());
    
    // Verify code is not already used
    if (accessCode.getIsUsed()) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "This code has already been used by " + 
                (accessCode.getStudent() != null ? accessCode.getStudent().getName() : "a student")));
    }
    
    // Grant access to ONLY THIS SPECIFIC MODULE
    TrainingModuleAccess existingAccess = trainingModuleAccessRepository
        .findByStudentIdAndTrainingModuleId(userId, moduleId);
    
    if (existingAccess != null && existingAccess.getHasAccess()) {
        return ResponseEntity.ok(Map.of("message", "You already have access to this module"));
    }
    
    // Create NEW access record for THIS module only
    TrainingModuleAccess access = new TrainingModuleAccess();
    access.setStudent(student);
    access.setTrainingModule(module); // ← ONLY this specific module
    access.setHasAccess(true);
    access.setGrantedAt(LocalDateTime.now());
    
    trainingModuleAccessRepository.save(access);
    
    // Mark code as used
    accessCode.setIsUsed(true);
    accessCode.setStudent(student);
    accessCode.setUsedAt(LocalDateTime.now());
    trainingModuleAccessCodeRepository.save(accessCode);
    
    System.out.println("✅ Successfully unlocked module: " + module.getTitle() + " for student: " + student.getName());
    
    return ResponseEntity.ok(Map.of("message", "Module unlocked successfully"));
}
```

### 5. Fix How Access Status is Retrieved

**File:** Controller that returns training with modules

**Endpoint:** `GET /api/courses/{trainingId}` or similar

```java
@GetMapping("/api/courses/{trainingId}")
public ResponseEntity<?> getTrainingWithModules(
    @PathVariable UUID trainingId,
    Authentication authentication
) {
    Training training = trainingRepository.findById(trainingId)
        .orElseThrow(() -> new IllegalArgumentException("Training not found"));
    
    String userId = authentication.getName();
    
    // Build response with per-module access status
    List<TrainingModuleDTO> modulesWithAccess = training.getModules().stream()
        .map(module -> {
            // Check access for EACH module individually
            boolean hasAccess = trainingModuleAccessRepository.existsByStudentIdAndTrainingModuleId(
                userId, 
                module.getId()  // ← Check THIS specific module
            );
            
            return TrainingModuleDTO.builder()
                .id(module.getId())
                .title(module.getTitle())
                .description(module.getDescription())
                .hasAccess(hasAccess)  // ← Per-module access
                .status(hasAccess ? "UNLOCKED" : "LOCKED")
                .orderIndex(module.getOrderIndex())
                .coursesCount(module.getCourses() != null ? module.getCourses().size() : 0)
                .build();
        })
        .collect(Collectors.toList());
    
    return ResponseEntity.ok(TrainingDTO.builder()
        .id(training.getId())
        .title(training.getTitle())
        .description(training.getDescription())
        .modules(modulesWithAccess)  // ← Each module has its own access status
        .build());
}
```

---

## 📊 Database Schema Check

Verify your database has these tables:

```sql
-- Training module access codes table
CREATE TABLE training_module_access_codes (
    id UUID PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    training_module_id UUID NOT NULL REFERENCES training_modules(id), -- ← CRITICAL
    student_id UUID REFERENCES users(id),
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    used_at TIMESTAMP,
    
    INDEX idx_code_module (code, training_module_id) -- ← Performance
);

-- User access to training modules
CREATE TABLE training_module_access (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES users(id),
    training_module_id UUID NOT NULL REFERENCES training_modules(id), -- ← CRITICAL
    has_access BOOLEAN DEFAULT TRUE,
    granted_at TIMESTAMP,
    
    UNIQUE KEY unique_student_module (student_id, training_module_id) -- ← Prevent duplicates
);
```

---

## 🧪 Testing Steps

1. **Generate codes for different modules:**
   - Generate code for Module 1
   - Generate code for Module 2

2. **Use Module 1 code:**
   - Student uses Module 1 code
   - **Expected:** Only Module 1 unlocked
   - **Check backend logs:** "Successfully unlocked module: Frontend Basics"

3. **Verify Module 2 is still locked:**
   - Student should NOT have access to Module 2
   - **Expected:** Module 2 still shows LOCKED status

4. **Check database:**
   ```sql
   SELECT * FROM training_module_access 
   WHERE student_id = 'student-uuid';
   ```
   Should show ONE row per module that was unlocked.

---

## 📝 Summary

The fix requires changing **4 places** in the backend:

1. ✅ Entity: Link `TrainingModuleAccessCode` to `TrainingModule` (not `Training`)
2. ✅ Repository: Use `findByCodeAndTrainingModuleId()` query
3. ✅ Code Generation: Set `trainingModule` field correctly
4. ✅ Code Verification: Verify code matches the specific module ID

**Key Principle:** Each access code is scoped to **ONE specific training module**, not the entire training.

---

## 🚨 Common Mistakes to Avoid

❌ Don't use `findByCode(String code)` - it won't match the module
❌ Don't grant access at Training level - grant at TrainingModule level  
❌ Don't reuse the same verification logic for all modules
✅ Always include `moduleId` in the database query
✅ Always save the specific `trainingModule` when granting access

---

## 📞 Frontend Status

✅ Frontend is correctly sending the module ID
✅ Frontend is correctly calling `/api/training-modules/{moduleId}/unlock`
❌ Backend needs to fix the verification logic

---

## 🔄 After Backend Fix

Once backend is fixed:
1. The access codes will only unlock the specific module they were generated for
2. Multiple modules in the same training will require separate codes
3. Students will have per-module access control



