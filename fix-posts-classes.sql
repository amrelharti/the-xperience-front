-- Fix existing posts to have class_id assigned
-- This assigns each post to a class based on the author's first enrollment

UPDATE posts p
SET class_id = (
    SELECT ce.class_id
    FROM class_enrollments ce
    WHERE ce.student_id = p.author_id
      AND ce.is_active = true
    ORDER BY ce.enrolled_at DESC
    LIMIT 1
)
WHERE p.class_id IS NULL
  AND EXISTS (
    SELECT 1
    FROM class_enrollments ce
    WHERE ce.student_id = p.author_id
      AND ce.is_active = true
  );

-- Show results
SELECT 
    COUNT(*) FILTER (WHERE class_id IS NOT NULL) as posts_with_class,
    COUNT(*) FILTER (WHERE class_id IS NULL) as posts_without_class,
    COUNT(*) as total_posts
FROM posts;



