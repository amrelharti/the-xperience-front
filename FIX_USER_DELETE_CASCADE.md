# Fix User Delete Cascade Issue ✅

## Problem
When trying to delete a user in the admin panel, you get this error:

```
ERROR: update or delete on table "users" violates foreign key constraint "fkiq8mgvc9q0d4p58dfy7e209hk" on table "code_usage_log"
Detail: Key (id)=(59c4819d-7b04-4d4d-b87f-53d9d681402c) is still referenced from table "code_usage_log".
```

**Root Cause:** The `users` table has a foreign key relationship with `code_usage_log` (and possibly other tables), but CASCADE DELETE is not enabled. When you try to delete a user that has associated records, the database prevents the deletion to maintain referential integrity.

---

## Solution Options

### Option 1: Enable Cascade Delete (Recommended for Admin)
This automatically deletes all related records when a user is deleted.

**⚠️ Warning:** This is destructive and will permanently delete:
- User's code usage logs
- User's enrollments
- User's course progress
- User's posts and comments
- User's attendance records
- User's points history

### Option 2: Soft Delete (Safer Alternative)
Instead of deleting, mark users as "inactive" or "deleted" without removing data.

---

## Implementation

### Step 1: Apply Database Migration

I've created a migration file: **`V5__Fix_User_Delete_Cascade.sql`**

This migration:
1. Drops the existing foreign key constraint `fkiq8mgvc9q0d4p58dfy7e209hk`
2. Recreates it with `ON DELETE CASCADE`
3. Fixes other user-related foreign keys

**Location:** `src/main/resources/db/migration/V5__Fix_User_Delete_Cascade.sql`

### Step 2: Apply the Migration

**If your backend is in a separate repository:**

1. Copy `V5__Fix_User_Delete_Cascade.sql` to your backend's migration folder:
   ```bash
   # Adjust the path to your backend repository
   cp src/main/resources/db/migration/V5__Fix_User_Delete_Cascade.sql \
      ../the-xperience-back/src/main/resources/db/migration/
   ```

2. Restart your backend:
   ```bash
   cd ../the-xperience-back
   mvn clean compile
   mvn spring-boot:run
   ```

3. Flyway will automatically run the new migration on startup.

**If your backend is in the same repository:**

Just restart the backend - Flyway will detect and run the new migration.

---

### Step 3: Update Backend Entity (Optional but Recommended)

If you have access to the backend code, update the User entity to reflect cascade delete in JPA:

**File:** `UserEntity.java` or `User.java`

```java
@Entity
@Table(name = "users")
public class UserEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    private String name;
    private String email;
    private String role;
    
    // Add cascade delete to all relationships
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CodeUsageLogEntity> codeUsageLogs;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClassEnrollmentEntity> enrollments;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourseProgressEntity> courseProgress;
    
    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostEntity> posts;
    
    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommentEntity> comments;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LiveSessionAttendanceEntity> attendance;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PointsHistoryEntity> pointsHistory;
    
    // Getters and setters...
}
```

**Key Points:**
- `cascade = CascadeType.ALL` - Propagates all operations (including delete)
- `orphanRemoval = true` - Automatically removes orphaned records

---

### Step 4: Update Delete Endpoint (Optional Enhancement)

Update the admin delete user endpoint to handle errors gracefully:

**File:** `AdminController.java` or `UserController.java`

```java
@DeleteMapping("/api/admin/users/{id}")
public ResponseEntity<?> deleteUser(@PathVariable UUID id, Authentication authentication) {
    
    // Check admin role
    if (!hasAdminRole(authentication)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("error", "Admin access required"));
    }
    
    try {
        // Find the user
        UserEntity user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Delete the user - cascade will handle related records
        userRepository.delete(user);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "User and all related data deleted successfully"
        ));
        
    } catch (DataIntegrityViolationException e) {
        // Log the error
        log.error("Error deleting user {}: {}", id, e.getMessage());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of(
                "error", "Cannot delete user. They may have associated data that cannot be removed.",
                "details", e.getMessage()
            ));
    } catch (Exception e) {
        log.error("Unexpected error deleting user {}: {}", id, e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "Failed to delete user"));
    }
}

private boolean hasAdminRole(Authentication authentication) {
    return authentication.getAuthorities().stream()
        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
}
```

---

## Alternative: Implement Soft Delete

If you prefer not to permanently delete users, implement soft delete:

### Database Migration (Soft Delete):

```sql
-- Add deleted_at column to users table
ALTER TABLE users
ADD COLUMN deleted_at TIMESTAMP;

-- Create index for better query performance
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
```

### Entity Update (Soft Delete):

```java
@Entity
@Table(name = "users")
@Where(clause = "deleted_at IS NULL") // Only fetch non-deleted users
public class UserEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    private String name;
    private String email;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    // Soft delete method
    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }
    
    public boolean isDeleted() {
        return deletedAt != null;
    }
    
    // ... other fields
}
```

### Controller Update (Soft Delete):

```java
@DeleteMapping("/api/admin/users/{id}")
public ResponseEntity<?> softDeleteUser(@PathVariable UUID id, Authentication authentication) {
    
    if (!hasAdminRole(authentication)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("error", "Admin access required"));
    }
    
    try {
        UserEntity user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Soft delete instead of hard delete
        user.softDelete();
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "User deactivated successfully"
        ));
        
    } catch (Exception e) {
        log.error("Error soft deleting user {}: {}", id, e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "Failed to deactivate user"));
    }
}
```

---

## Testing

### Test Cascade Delete:

1. **Create a test user:**
   ```bash
   # Sign in as a test user to generate some data
   # Complete some courses, make posts, etc.
   ```

2. **Delete the user from admin panel:**
   ```bash
   # Go to /admin
   # Find the user
   # Click delete
   ```

3. **Verify deletion:**
   ```sql
   -- Check that user is deleted
   SELECT * FROM users WHERE id = 'user-id-here';
   
   -- Check that related records are deleted
   SELECT * FROM code_usage_log WHERE user_id = 'user-id-here';
   SELECT * FROM course_progress WHERE user_id = 'user-id-here';
   SELECT * FROM posts WHERE author_id = 'user-id-here';
   ```

### Expected Results:
- ✅ User deleted successfully
- ✅ All `code_usage_log` entries deleted
- ✅ All enrollments, progress, posts, comments deleted
- ✅ No foreign key constraint errors

---

## Rollback Plan

If you need to rollback the migration:

```sql
-- Rollback V5 Migration
-- Recreate the constraint WITHOUT cascade

ALTER TABLE code_usage_log
DROP CONSTRAINT IF EXISTS fkiq8mgvc9q0d4p58dfy7e209hk;

ALTER TABLE code_usage_log
ADD CONSTRAINT fkiq8mgvc9q0d4p58dfy7e209hk
FOREIGN KEY (user_id)
REFERENCES users(id);
-- No ON DELETE CASCADE
```

---

## Summary

### Quick Fix Checklist:

1. ✅ **Migration created:** `V5__Fix_User_Delete_Cascade.sql`
2. ⏳ **Copy to backend** (if separate repo)
3. ⏳ **Restart backend** to apply migration
4. ⏳ **Update User entity** with cascade settings (optional)
5. ⏳ **Update delete endpoint** with better error handling (optional)
6. ⏳ **Test user deletion** from admin panel

### After Applying:

- ✅ Deleting users will work without errors
- ✅ Related data will be automatically deleted
- ⚠️ **Warning:** This is permanent - consider soft delete for production

---

## Files Created:

1. **Migration:** `src/main/resources/db/migration/V5__Fix_User_Delete_Cascade.sql`
2. **Documentation:** `FIX_USER_DELETE_CASCADE.md` (this file)

---

## Status:

✅ **Solution prepared**
⏳ **Waiting for backend restart to apply**
⏳ **Testing required**

