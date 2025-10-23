-- ============================================
-- THE XPERIENCE LMS - NEW DATABASE SCHEMA
-- Version 1: Complete Training System
-- ============================================

-- Drop existing tables if they exist (clean slate approach)
DROP TABLE IF EXISTS course_progress CASCADE;
DROP TABLE IF EXISTS live_session_attendance CASCADE;
DROP TABLE IF EXISTS module_access CASCADE;
DROP TABLE IF EXISTS class_enrollment CASCADE;
DROP TABLE IF EXISTS live_session CASCADE;
DROP TABLE IF EXISTS course CASCADE;
DROP TABLE IF EXISTS module CASCADE;
DROP TABLE IF EXISTS class CASCADE;
DROP TABLE IF EXISTS training CASCADE;
DROP TABLE IF EXISTS post_comment CASCADE;
DROP TABLE IF EXISTS post_like CASCADE;
DROP TABLE IF EXISTS post CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- CORE TABLES
-- ============================================

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'STUDENT', -- 'ADMIN' or 'STUDENT'
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training Table (Top level - replaces old "Course")
CREATE TABLE training (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT false,
    total_live_sessions INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Class Table (Promotion/Cohort)
CREATE TABLE class (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_id UUID NOT NULL REFERENCES training(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    access_code VARCHAR(50) UNIQUE NOT NULL,
    max_students INT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Module Table (Week 1, Week 2, etc.)
CREATE TABLE module (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES class(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    access_code VARCHAR(50) NOT NULL,
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, access_code),
    UNIQUE(class_id, order_index)
);

-- Course Table (Video Lesson)
CREATE TABLE course (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES module(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    duration_seconds INT DEFAULT 0,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Live Session Table (One per module)
CREATE TABLE live_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES module(id) ON DELETE CASCADE UNIQUE,
    class_id UUID NOT NULL REFERENCES class(id) ON DELETE CASCADE,
    training_id UUID NOT NULL REFERENCES training(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_date TIMESTAMP NOT NULL,
    duration_minutes INT DEFAULT 60,
    instructor_name VARCHAR(255),
    meeting_url TEXT NOT NULL,
    meeting_password VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ENROLLMENT & ACCESS TABLES
-- ============================================

-- Class Enrollment (One class per training per student)
CREATE TABLE class_enrollment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES class(id) ON DELETE CASCADE,
    training_id UUID NOT NULL REFERENCES training(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, training_id)
);

-- Module Access (Tracks unlocked modules)
CREATE TABLE module_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES module(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES class(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, module_id)
);

-- ============================================
-- PROGRESS TRACKING TABLES
-- ============================================

-- Live Session Attendance
CREATE TABLE live_session_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_session_id UUID NOT NULL REFERENCES live_session(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES class(id) ON DELETE CASCADE,
    is_attended BOOLEAN DEFAULT false,
    marked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(live_session_id, user_id)
);

-- Course Progress (Video completion tracking)
CREATE TABLE course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES module(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES class(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    watch_time_seconds INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- ============================================
-- SOCIAL FEATURES (Class-scoped)
-- ============================================

-- Post Table (Class-scoped feed)
CREATE TABLE post (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES class(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) DEFAULT 'POST', -- 'POST', 'ASSIGNMENT', 'QUESTION', 'ANNOUNCEMENT'
    title VARCHAR(255),
    content TEXT NOT NULL,
    attachments TEXT,
    is_pinned BOOLEAN DEFAULT false,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post Comment
CREATE TABLE post_comment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES post(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES post_comment(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    like_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post Like
CREATE TABLE post_like (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES post(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

-- Comment Like
CREATE TABLE comment_like (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES post_comment(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, user_id)
);

-- Assignment Rating (For assignment-type posts)
CREATE TABLE assignment_rating (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES post(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INT NOT NULL CHECK (score >= 1 AND score <= 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Training indexes
CREATE INDEX idx_training_published ON training(is_published);
CREATE INDEX idx_training_created_at ON training(created_at DESC);

-- Class indexes
CREATE INDEX idx_class_training_id ON class(training_id);
CREATE INDEX idx_class_access_code ON class(access_code);
CREATE INDEX idx_class_active ON class(is_active);

-- Module indexes
CREATE INDEX idx_module_class_id ON module(class_id);
CREATE INDEX idx_module_order_index ON module(class_id, order_index);

-- Course indexes
CREATE INDEX idx_course_module_id ON course(module_id);
CREATE INDEX idx_course_order_index ON course(module_id, order_index);

-- Live Session indexes
CREATE INDEX idx_live_session_module_id ON live_session(module_id);
CREATE INDEX idx_live_session_class_id ON live_session(class_id);
CREATE INDEX idx_live_session_scheduled_date ON live_session(scheduled_date);

-- Enrollment indexes
CREATE INDEX idx_enrollment_user_id ON class_enrollment(user_id);
CREATE INDEX idx_enrollment_class_id ON class_enrollment(class_id);
CREATE INDEX idx_enrollment_training_id ON class_enrollment(training_id);

-- Module Access indexes
CREATE INDEX idx_module_access_user_id ON module_access(user_id);
CREATE INDEX idx_module_access_module_id ON module_access(module_id);

-- Attendance indexes
CREATE INDEX idx_attendance_live_session_id ON live_session_attendance(live_session_id);
CREATE INDEX idx_attendance_user_id ON live_session_attendance(user_id);

-- Course Progress indexes
CREATE INDEX idx_course_progress_user_id ON course_progress(user_id);
CREATE INDEX idx_course_progress_module_id ON course_progress(module_id);
CREATE INDEX idx_course_progress_completed ON course_progress(is_completed);

-- Post indexes
CREATE INDEX idx_post_class_id ON post(class_id);
CREATE INDEX idx_post_user_id ON post(user_id);
CREATE INDEX idx_post_created_at ON post(created_at DESC);
CREATE INDEX idx_post_type ON post(type);

-- Comment indexes
CREATE INDEX idx_comment_post_id ON post_comment(post_id);
CREATE INDEX idx_comment_user_id ON post_comment(user_id);
CREATE INDEX idx_comment_parent_id ON post_comment(parent_comment_id);

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Create admin user
INSERT INTO users (name, email, password_hash, role, image_url)
VALUES (
    'Admin User',
    'admin@thexperience.com',
    '$2a$10$dummyHashForTesting',
    'ADMIN',
    NULL
);

-- Create sample student
INSERT INTO users (name, email, password_hash, role, image_url)
VALUES (
    'Test Student',
    'student@thexperience.com',
    '$2a$10$dummyHashForTesting',
    'STUDENT',
    NULL
);

-- Create sample training
INSERT INTO training (title, description, is_published, total_live_sessions)
VALUES (
    'Full Stack Web Development',
    'Complete bootcamp covering frontend and backend development',
    true,
    12  -- 12 total live sessions (one per module)
);

-- Create sample class
INSERT INTO class (training_id, name, description, access_code, max_students, start_date, end_date, is_active)
SELECT 
    id,
    'Promotion 2025-A',
    'First cohort of 2025',
    'PROMO2025A',
    30,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '6 months',
    true
FROM training
WHERE title = 'Full Stack Web Development';

-- Create sample modules (12 modules for the class)
INSERT INTO module (class_id, title, description, order_index, access_code, is_published)
SELECT 
    c.id,
    'Module ' || series.num || ': ' || 
    CASE series.num
        WHEN 1 THEN 'HTML & CSS Fundamentals'
        WHEN 2 THEN 'JavaScript Basics'
        WHEN 3 THEN 'React Introduction'
        WHEN 4 THEN 'State Management'
        WHEN 5 THEN 'Backend with Node.js'
        WHEN 6 THEN 'RESTful APIs'
        WHEN 7 THEN 'Database Design'
        WHEN 8 THEN 'Authentication & Security'
        WHEN 9 THEN 'Deployment & DevOps'
        WHEN 10 THEN 'Testing & Quality'
        WHEN 11 THEN 'Performance Optimization'
        ELSE 'Final Project'
    END,
    'Learn the fundamentals of module ' || series.num,
    series.num,
    'MODULE' || series.num || 'CODE',
    true
FROM class c
CROSS JOIN generate_series(1, 12) AS series(num)
WHERE c.name = 'Promotion 2025-A';

-- ============================================
-- COMPLETE - Database schema ready!
-- ============================================



