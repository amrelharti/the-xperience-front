# Backend Fix: Enable Cascade Deletion for Trainings

## Problem
When trying to delete a training that has associated training modules, the backend returns a 400 Bad Request error because foreign key constraints prevent deletion without cascade delete being enabled.

## Solution
Enable cascade deletion in the Training entity so that when a training is deleted, all its associated training modules are automatically deleted.

---

## Required Backend Changes

### 1. Update Training Entity (`Training.java`)

Add cascade delete to the relationship with TrainingModule:

```java
@Entity
@Table(name = "courses") // or "training" depending on your table name
public class Training {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    private String title;
    private String description;
    private String thumbnailUrl;
    private Boolean isPublished;
    
    // CRITICAL: Add cascade delete to this relationship
    @OneToMany(mappedBy = "training", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TrainingModule> modules;
    
    // Add other fields as needed...
    
    // Getters and setters...
}
```

**Key Changes:**
- `cascade = CascadeType.ALL` - Deletes all related training modules when contained operations are performed
- `orphanRemoval = true` - Removes training modules from the database when they're removed from the collection

---

### 2. Update TrainingModule Entity (`TrainingModule.java`)

Ensure the relationship is bidirectional:

```java
@Entity
@Table(name = "training_modules")
public class TrainingModule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    private String title;
    private String description;
    private Integer orderIndex;
    private String accessCode;
    private String thumbnailUrl;
    
    // This relationship should already exist
    @ManyToOne
    @JoinColumn(name = "training_id")
    private Training training;
    
    @OneToMany(mappedBy = "trainingModule", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Course> courses;
    
    // Getters and setters...
}
```

**Key Points:**
- Keep the `@ManyToOne` relationship to Training
- Add cascade delete for courses if they exist in your schema

---

### 3. Update DELETE Endpoint in TrainingController

The DELETE endpoint should handle cascade deletion properly:

```java
@RestController
@RequestMapping("/api/admin/courses")
public class TrainingController {
    
    @Autowired
    private TrainingRepository trainingRepository;
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTraining(@PathVariable UUID id, Authentication authentication) {
        
        // Check if user is admin
        if (!hasAdminRole(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Admin access required"));
        }
        
        // Find the training
        Training training = trainingRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Training not found"));
        
        try {
            // Delete the training - cascade will handle training modules and courses
            trainingRepository.delete(training);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Training deleted successfully"
            ));
            
        } catch (DataIntegrityViolationException e) {
            // Handle any remaining constraint violations
            String errorMessage = e.getMessage();
            
            // Log the error for debugging
            System.err.println("Error deleting training: " + errorMessage);
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", 
                    "Cannot delete training. It may have associated data that cannot be removed."));
        } catch (Exception e) {
            System.err.println("Unexpected error deleting training: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete training"));
        }
    }
    
    private boolean hasAdminRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
```

---

### 4. Alternative: Use Database-Level Cascade (If JPA cascade doesn't work)

If you prefer to handle this at the database level, update your migration:

```sql
-- Migration: Enable cascade delete for training_modules
ALTER TABLE training_modules
DROP CONSTRAINT IF EXISTS fk_training_modules_training,
ADD CONSTRAINT fk_training_modules_training
FOREIGN KEY (training_id)
REFERENCES courses(id)
ON DELETE CASCADE;
```

**Note:** This assumes your trainings table is named `courses`. Adjust if your table is named `training` or something else.

---

## Testing the Fix

After implementing the changes:

### 1. Create a test training with modules:
```bash
# Create a training
POST /api/admin/courses
{
  "title": "Test Training",
  "description": "Test cascade delete",
  "isPublished": false
}

# Create modules for this training
POST /api/admin/courses/{trainingId}/training-modules
{
  "title": "Module 1",
  "orderIndex": 0
}
```

### 2. Delete the training:
```bash
DELETE /api/admin/courses/{trainingId}
```

### 3. Verify:
- Training is deleted ✅
- All training modules are deleted ✅
- Related courses are deleted (if cascade is set up) ✅
- No foreign key constraint errors ✅

---

## Database Schema Reference

Based on your system, the tables should be structured like:

```sql
-- Training table (may be called "courses" in your DB)
CREATE TABLE courses (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    thumbnail_url TEXT,
    is_published BOOLEAN
);

-- Training modules table
CREATE TABLE training_modules (
    id UUID PRIMARY KEY,
    training_id UUID NOT NULL,
    title VARCHAR(255),
    description TEXT,
    order_index INT,
    access_code VARCHAR(50),
    thumbnail_url TEXT,
    
    -- Foreign key with cascade delete
    CONSTRAINT fk_training_modules_training
    FOREIGN KEY (training_id) REFERENCES courses(id)
    ON DELETE CASCADE
);

-- Courses table (video lessons within modules)
CREATE TABLE course (
    id UUID PRIMARY KEY,
    module_id UUID NOT NULL,
    title VARCHAR(255),
    video_url TEXT,
    duration_seconds INT,
    order_index INT,
    
    -- Foreign key with cascade delete
    CONSTRAINT fk_course_module
    FOREIGN KEY (module_id) REFERENCES training_modules(id)
    ON DELETE CASCADE
);
```

---

## Troubleshooting

### Issue: Still getting 400 error after changes

**Solution:** Check your database constraints:
```sql
-- Check current foreign key constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY'
  AND (tc.table_name = 'training_modules' OR tc.table_name = 'course');
```

### Issue: Cascade not working in JPA

**Possible causes:**
1. Entity might not be loaded with related entities
2. Using `deleteById()` instead of `delete(entity)`
3. Transaction not properly configured

**Solution:** Ensure you're loading the entity with its relationships:
```java
Training training = trainingRepository.findById(id)
    .orElseThrow();
// Force load of relationships
training.getModules().size(); // Triggers lazy loading
    
trainingRepository.delete(training); // Now cascade will work
```

---

## Summary

To enable cascade deletion:

1. ✅ Add `cascade = CascadeType.ALL` to `@OneToMany` in Training entity
2. ✅ Add `orphanRemoval = true` to ensure clean removal
3. ✅ Update DELETE endpoint to handle errors gracefully
4. ✅ Test with a training that has multiple modules
5. ✅ Consider database-level cascade as backup

After these changes, deleting a training will automatically delete all its training modules and related courses.

---

## Frontend Status

✅ Frontend has been updated to:
- Show better error messages
- Warn users about modules before deletion
- Handle errors gracefully

The frontend is ready once the backend changes are implemented.

