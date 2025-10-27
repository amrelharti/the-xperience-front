# Spring Boot Backend Fix for Class-Based Post Creation

## Problem
Frontend is sending `classId` correctly, but backend is ignoring it and defaulting to user's class.

## Evidence
From terminal logs:
- Frontend sends: `classId: '135126cb-7c48-4a29-b651-70172aeee1bd'` (january22 class)
- Backend returns: `class: { name: 'obx', id: 'dab6566b-16c4-42d4-88f2-ac45165a13f1' }` (wrong class)

## Required Fix

### In your FeedController.java:

```java
@PostMapping("/api/feed/posts")
public ResponseEntity<?> createPost(
    @RequestBody PostCreateDTO postDTO,
    @RequestParam(required = false) String classId,  // Add this
    Authentication authentication
) {
    User currentUser = userService.findByEmail(authentication.getName());
    
    // CRITICAL: Prioritize the classId parameter
    String targetClassId = null;
    if (classId != null && !classId.isEmpty()) {
        targetClassId = classId;
    } else if (postDTO.getClassId() != null && !postDTO.getClassId().isEmpty()) {
        targetClassId = postDTO.getClassId();
    }
    
    Class targetClass;
    
    if (targetClassId != null) {
        // User specified a class - verify they're enrolled
        targetClass = classRepository.findById(UUID.fromString(targetClassId))
            .orElseThrow(() -> new IllegalArgumentException("Class not found"));
        
        // Verify enrollment
        ClassEnrollment enrollment = classEnrollmentRepository
            .findByStudentIdAndClassId(currentUser.getId(), UUID.fromString(targetClassId))
            .orElseThrow(() -> new IllegalArgumentException("Not enrolled in this class"));
        
        System.out.println("✅ Using specified class: " + targetClass.getName() + " (ID: " + targetClassId + ")");
    } else {
        // No class specified - use user's active class (existing logic)
        targetClass = // ... your existing logic to get user's class
    }
    
    // Create the post
    Post post = new Post();
    post.setClass(targetClass);  // SET THE CORRECT CLASS HERE
    post.setAuthor(currentUser);
    post.setContent(postDTO.getContent());
    post.setTitle(postDTO.getTitle());
    post.setType(postDTO.getPostType());
    post.setModule(postDTO.getModuleId() != null ? 
        moduleRepository.findById(postDTO.getModuleId()).orElse(null) : null);
    
    Post savedPost = postRepository.save(post);
    
    return ResponseEntity.ok(postMapper.toDTO(savedPost));
}
```

### Also update PostCreateDTO.java to include classId field:

```java
public class PostCreateDTO {
    private UUID moduleId;
    private String postType;
    private String title;
    private String content;
    private String attachments;
    private Boolean isAssignment;
    
    // ADD THIS FIELD:
    @JsonProperty("classId")
    private String classId;
    
    // Add getter and setter
    public String getClassId() {
        return classId;
    }
    
    public void setClassId(String classId) {
        this.classId = classId;
    }
    
    // ... rest of existing fields
}
```

## Testing
After the fix, you should see in terminal logs:
- Frontend sends: `classId: '135126cb-7c48-4a29-b651-70172aeee1bd'`
- Backend returns: `class: { name: 'january22', id: '135126cb-7c48-4a29-b651-70172aeee1bd' }` ✅

## Frontend Status
✅ Frontend is already sending `classId` correctly in both body and as query parameter


