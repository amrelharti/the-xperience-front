# Fix Post Delete Cascade Issue ✅

## Problem
When trying to delete a post (even as admin), you get this error:

```
ERROR: update or delete on table "posts" violates foreign key constraint "fk599539lym3mnkbqks0u806eac" on table "notifications"
Detail: Key (id)=(a52ccc03-9f02-4839-9eef-c38199754780) is still referenced from table "notifications".
```

**Root Cause:** The `posts` table has a foreign key relationship with `notifications`, but `ON DELETE CASCADE` is not enabled. When you try to delete a post that has associated notifications, the database prevents the deletion to maintain referential integrity.

---

## Solution: Enable Cascade Delete for Notifications

### Step 1: Create Database Migration

Create a new migration file in your backend repository:

**File:** `src/main/resources/db/migration/V6__Fix_Post_Delete_Cascade.sql`

```sql
-- Migration V6: Fix Post Delete Cascade
-- This migration enables cascade delete for post-related tables

-- Fix notifications foreign key constraint
ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS fk599539lym3mnkbqks0u806eac;

-- Recreate the constraint with ON DELETE CASCADE
ALTER TABLE notifications
ADD CONSTRAINT fk599539lym3mnkbqks0u806eac
FOREIGN KEY (post_id)
REFERENCES posts(id)
ON DELETE CASCADE;

-- Fix other post-related foreign keys if they exist
-- Comments table
ALTER TABLE comments
DROP CONSTRAINT IF EXISTS fk_comments_post;

ALTER TABLE comments
ADD CONSTRAINT fk_comments_post
FOREIGN KEY (post_id)
REFERENCES posts(id)
ON DELETE CASCADE;

-- Post likes table (if exists)
ALTER TABLE post_likes
DROP CONSTRAINT IF EXISTS fk_post_likes_post;

ALTER TABLE post_likes
ADD CONSTRAINT fk_post_likes_post
FOREIGN KEY (post_id)
REFERENCES posts(id)
ON DELETE CASCADE;

-- Post ratings table (if exists)
ALTER TABLE post_ratings
DROP CONSTRAINT IF EXISTS fk_post_ratings_post;

ALTER TABLE post_ratings
ADD CONSTRAINT fk_post_ratings_post
FOREIGN KEY (post_id)
REFERENCES posts(id)
ON DELETE CASCADE;
```

### Step 2: Apply the Migration

1. **Copy the migration file to your backend:**
   ```bash
   # If backend is in a separate repository
   cp POST_DELETE_CASCADE_FIX.md ../the-xperience-back/src/main/resources/db/migration/V6__Fix_Post_Delete_Cascade.sql
   ```

2. **Restart your backend:**
   ```bash
   cd ../the-xperience-back
   mvn spring-boot:run
   ```

   The migration will run automatically on startup.

### Step 3: Test

1. Try deleting a post that has notifications
2. The post and all related notifications should be deleted automatically

---

## Alternative: Backend Code Fix (If Migration Doesn't Work)

If you prefer to handle this in the backend code, update your `FeedController.java` delete method:

```java
@DeleteMapping("/api/feed/posts/{id}")
public ResponseEntity<?> deletePost(
    @PathVariable UUID id,
    Authentication authentication
) {
    try {
        User currentUser = userService.findByEmail(authentication.getName());
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        
        // Check permissions
        boolean isOwner = post.getAuthor().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;
        
        if (!isOwner && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "You don't have permission to delete this post"));
        }
        
        // Delete related notifications first
        notificationRepository.deleteByPostId(id);
        
        // Delete related comments (if not cascading)
        commentRepository.deleteByPostId(id);
        
        // Delete the post
        postRepository.delete(post);
        
        return ResponseEntity.ok(Map.of("success", true));
        
    } catch (DataIntegrityViolationException e) {
        log.error("Error deleting post {}: {}", id, e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of(
                "error", "Cannot delete post. It may have associated data that cannot be removed.",
                "details", e.getMessage()
            ));
    } catch (Exception e) {
        log.error("Unexpected error deleting post {}: {}", id, e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "Failed to delete post"));
    }
}
```

---

## What Gets Deleted

When you delete a post with cascade delete enabled:
- ✅ The post itself
- ✅ All notifications related to the post
- ✅ All comments on the post
- ✅ All likes on the post
- ✅ All ratings on the post

**⚠️ Warning:** This is a **destructive operation**. All related data will be permanently deleted.

---

## Status

- ✅ Frontend error handling improved
- ⏳ Backend migration needed (V6__Fix_Post_Delete_Cascade.sql)
- ⏳ Backend code update (optional, if migration doesn't work)


