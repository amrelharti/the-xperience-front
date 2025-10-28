# Training Module Access Code Fix

## Problem Description

When generating an access code from the admin panel for a specific **training module** and using it to unlock that module, the code is granting access to **all training modules** in the training instead of just the specific one.

### Example
- You have a training "Web Development" with two modules:
  - Module 1: "Frontend Basics"
  - Module 2: "Backend Basics"
- You generate an access code for Module 1
- When a student uses that code, they get access to BOTH Module 1 AND Module 2 ❌
- **Expected:** They should only get access to Module 1 ✅

## Root Cause

The backend Spring Boot code is likely:
1. Storing the access code association at the **Training** level instead of the **Training Module** level
2. Or verifying the code against the wrong scope when unlocking access

## Required Backend Fix

### 1. Check Access Code Entity/Table

Ensure the `TrainingModuleAccessCode` (or similar entity) has a proper foreign key to the **Training Module**:

```java
@Entity
public class TrainingModuleAccessCode {
    @Id
    @GeneratedValue
    private UUID id;
    
    private String code;
    
    @ManyToOne
    @JoinColumn(name = "training_module_id")  // ← Must be linked to TRAINING MODULE, not Training
    private TrainingModule trainingModule;  // ← This is the CRITICAL field
    
    @ManyToOne
    @JoinColumn Унаme = "student_id")
    private User student;
    
    private boolean isUsed;
    
    // ... getters and setters
}
```

### 2. Fix Code Generation Endpoint

When generating codes in the admin panel, ensure the code is tied to the specific training module:

**Location:** `POST /api/admin/training-modules/{moduleId}/codes`

```java
@PostMapping("/api/admin/training-modules/{moduleId}/codes")
public ResponseEntity<?> generateAccessCodes(
    @PathVariable UUID moduleId,  // ← Training MODULE ID
    @RequestBody GenerateCodesRequest request,
    Authentication authentication
) {
    // Find the SPECIFIC training module
    TrainingModule module = trainingModuleRepository.findById(moduleId)
        .orElseThrow(() -> new IllegalArgumentException("Training module not found"));
    
    List<String> generatedCodes = new ArrayList<>();
    
    for (int i = 0; i < request.getCount(); i++) {
        TrainingModuleAccessCode accessCode = new TrainingModuleAccessCode();
        accessCode.setCode(generateRandomCode()); // Your code generation logic
        accessCode.setTrainingModule(module);  // ← Set the SPECIFIC module
        accessCode.setIsUsed(false);
        
        accessCodeRepository.save(accessCode);
        generatedCodes.add(accessCode.getCode());
    }
    
    return ResponseEntity.ok(Map.of("codes", generatedCodes));
}
```

### 3. Fix Code Verification/Unlock Endpoint

This is the **most critical** fix. When verifying a code, grant access only to the specific training module:

**Location:** `POST /api/training-modules/{moduleId}/unlock`

```java
@PostMapping("/api/training-modules/{moduleId}/unlock")
public ResponseEntity<?> unlockModule(
    @PathVariable UUID moduleId,  // ← The module being unlocked
    @RequestBody UnlockRequest request,
    Authentication authentication
) {
    String userId = authentication.getName();
    User student = userRepository.findById(userId).orElseThrow();
    
    // Find the access code AND verify it belongs to THIS SPECIFIC MODULE
    TrainingModuleAccessCode accessCode = accessCodeRepository
        .findByCodeAndTrainingModuleId(request.getCode(), moduleId)  // ← CRITICAL: Match both code AND module
        .orElseThrow(() -> new IllegalArgumentException("Invalid or already used code"));
    
    // Verify the code is not already used
    if (accessCode.isUsed()) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Code already used"));
    }
    
    // Grant access to ONLY THIS SPECIFIC MODULE
    TrainingModuleAccess studentAccess = new TrainingModuleAccess();
    studentAccess.setStudent(student);
    studentAccess.setTrainingModule(accessCode.getTrainingModule());  // ← Only this module
    studentAccess.setGrantedAt(LocalDateTime.now());
    
    trainingModuleAccessRepository.save(studentAccess);
    
    // Mark code as used
    accessCode.setUsed(true);
    accessCode.setStudent(student);
    accessCode.setUsedAt(LocalDateTime.now());
    accessCodeRepository.save(accessCode);
    
    return ResponseEntity.ok(Map.of("message", "Module unlocked successfully"));
}
```

### 4. Database Query Fix

The database query method must filter by BOTH code AND module ID:

```java
public interface TrainingModuleAccessCodeRepository extends JpaRepository<TrainingModuleAccessCode, UUID> {
    
    // WRONG - finds by code only (allows code to unlock any module):
    // Optional<TrainingModuleAccessCode> findByCode(String code);
    
    // CORRECT - finds by code AND specific module:
    Optional<TrainingModuleAccessCode> findByCodeAndTrainingModuleId(
        String code, 
        UUID moduleId
    );
}
```

### 5. How Access Status is Retrieved

When retrieving a training with its modules, the backend should check access per module:

```java
@GetMapping("/api/courses/{trainingId}")
public ResponseEntity<?> getTraining(
    @PathVariable UUID trainingId,
    Authentication authentication
) {
    Training training = trainingRepository.findById(trainingId).orElseThrow();
    
    // Get current user
    String userId = authentication.getName();
    
    // Build response with access status for EACH module
    List<TrainingModuleDTO> modulesWithAccess = training.getModules().stream()
        .map(module -> {
            // Check if user has access to THIS SPECIFIC MODULE
            boolean hasAccess = trainingModuleAccessRepository
                .existsByStudentIdAndTrainingModuleId(userId, module.getId());
            
            return TrainingModuleDTO.builder()
                .id(module.getId())
                .title(module.getTitle())
                .description(module.getDescription())
                .hasAccess(hasAccess)  // ← Per-module access check
                .status(hasAccess ? "UNLOCKED" : "LOCKED")
                .build();
        })
        .collect(Collectors.toList());
    
    return ResponseEntity.ok(TrainingDTO.builder()
        .id(training.getId())
        .titleads(training.getTitle())
        .modules(modulesWithAccess)
        .build());
}
```

## Summary

The key issue is **scope**: 
- ❌ **Wrong:** Code grants access at the **Training** level (unlocks all modules)
- ✅ **Correct:** Code grants access at the **Training Module** level (unlocks one module)

### Database Structure Should Be:
```
Training
  └─ TrainingModule 1 ← Access Code A unlocks only this
  └─ TrainingModule 2 ← Access Code B unlocks only this
```

### What to Change:
1. Ensure `TrainingModuleAccessCode.trainingModule` foreign key exists
2. Use `findByCodeAndTrainingModuleId()` instead of `findByCode()`
3. Grant `TrainingModuleAccess` for the specific module, not the entire training
4. Check access per-module when returning training data

## Frontend Status
✅ Frontend is correctly calling `/api/training-modules/{moduleId}/unlock` with the specific module ID
❌ Backend is not properly scoping the access to that specific module

