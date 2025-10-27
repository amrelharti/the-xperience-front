# Backend Fix Required for Class-Based Post Creation

## Problem
When a user switches to a different class and creates a post, the backend is defaulting to the user's "current" class instead of using the provided `classId`.

## Current Behavior
- Frontend sends: `classId: 135126cb-7c48-4a29-b651-70172aeee1bd` (january22)
- Backend creates post with: `class: { name: 'obx', id: 'dab6566b-16c4-42d4-88f2-ac45165a13f1' }`

## Required Fix in Spring Boot Backend

### In the Feed Controller (POST /api/feed/posts endpoint):

```java
@PostMapping("/api/feed/posts")
public ResponseEntity<?> createPost(
    @RequestBody PostCreateDTO postDTO,
    @RequestParam(required = false) String classId,  // Add query parameter support
    Authentication authentication
) {
    // Get the user
    String userId = authentication.getName();
    User user = userRepository.findById(userId).orElseThrow();
    
    // Priority: Use classId from query param, then from request body, then default to user's class
    String targetClassId = classId != null ? classId : postDTO.getClassId();
    
    Class targetClass;
    if (targetClassId != null) {
        // Verify user is enrolled in the specified class
        targetClass = classRepository.findById(targetClassId)
            .orElseThrow(() -> new IllegalArgumentException("Class not found"));
        
        // Verify user is enrolled
        boolean isEnrolled = classEnrollmentRepository.existsByStudentIdAndClassId(userId, targetClassId);
        if (!isEnrolled) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse("Not enrolled in specified class"));
        }
    } else {
        // Default to user's active class
        // Your existing logic here
    }
    
    // Create post with the correct class
    Post post = new Post();
    post.setClass(targetClass);
    // ... rest of post creation
    
    return ResponseEntity.ok(post);
}
```

### Key Points:
1. Accept `classId` as both a query parameter and in the request body
2. Validate that the user is enrolled in the specified class
3. Use the provided classId instead of defaulting to the user's current class
4. Return error if user tries to post to a class they're not enrolled in

## Frontend Status
✅ Frontend is correctly sending `classId` in both the request body and as a query parameter


