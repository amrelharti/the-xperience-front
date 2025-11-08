# Analytics Dashboard - Feature Overview

## Overview
A comprehensive analytics system has been added to your platform to help you monitor, analyze, and improve the learning experience.

## Features Added

### 1. **Backend Analytics Endpoints** (Java Spring Boot)
Located at: `D:\Ali projet\the-xperience-back\src\main\java\com\thexperience\backend\admin\AnalyticsController.java`

#### Endpoints:
- **`GET /api/admin/analytics/overview`** - Platform-wide statistics
  - User metrics (total, students, admins, recent signups)
  - Course & module stats
  - Progress tracking (completion rates, watch time)
  - Video access statistics
  - Class enrollment data
  - Post statistics

- **`GET /api/admin/analytics/courses`** - Course-specific analytics
  - Enrollment numbers
  - Completion rates per course
  - Average watch time
  - In-progress vs completed students

- **`GET /api/admin/analytics/engagement`** - Student engagement metrics
  - Engagement score (custom formula)
  - Courses started/completed
  - Watch time per student
  - Assignments and summaries submitted
  - Video access frequency
  - Class enrollments

- **`GET /api/admin/analytics/classes`** - Class performance
  - Enrollment stats
  - Average completion rates
  - Watch time per class
  - Post activity

- **`GET /api/admin/analytics/trends?days=30`** - Time-based trends
  - User signup trends
  - Video access patterns
  - Course completion trends
  - Post creation activity
  - Customizable time periods (7, 14, 30, 60, 90 days)

### 2. **Frontend Analytics Dashboard**
Located at: `app\admin\analytics\dashboard\page.tsx`

#### Dashboard Sections:

##### **Overview Tab**
- **User Statistics**: Total users, students, admins, recent signups
- **Course Statistics**: Total/published courses and modules
- **Progress Metrics**: Completion rates, in-progress courses, average watch time
- **Video Analytics**: Total and recent video accesses
- **Class Stats**: Active classes and enrollments
- **Post Statistics**: Breakdown by type (assignments, summaries, questions)

##### **Courses Tab**
- Performance metrics for each course
- Enrollment numbers
- Completion rates
- Average watch time
- In-progress vs completed students
- Sortable by enrollment

##### **Students Tab**
- Top 50 most engaged students
- Custom engagement score
- Detailed metrics per student:
  - Courses started/completed
  - Total watch time
  - Assignments submitted
  - Weekly summaries
  - Video accesses
  - Classes enrolled

##### **Classes Tab**
- Performance metrics per class
- Student enrollment
- Progress tracking
- Completion rates
- Average watch time
- Post activity

##### **Trends Tab**
- Time-based activity visualization
- Configurable periods (7, 14, 30, 60, 90 days)
- User signup trends
- Video access patterns
- Course completions over time
- Post creation trends

### 3. **Engagement Score Algorithm**
The system calculates a custom engagement score for each student:
```
Engagement Score = 
  (Completed Courses × 10) +
  (Started Courses × 5) +
  (Assignments × 8) +
  (Weekly Summaries × 6) +
  (Total Posts × 2) +
  (Video Accesses × 0.5)
```

This helps you identify the most active and engaged students.

## How to Use

### Accessing the Dashboard
1. Log in as an admin
2. Go to the admin dashboard (`/admin`)
3. Click on "Analytics Dashboard" in the Monitoring Tools section
4. Or directly visit: `/admin/analytics/dashboard`

### Navigation
- Use the tabs at the top to switch between different views
- Click "Refresh" button to reload all data
- Use the day filters in the Trends tab to adjust the time period

### Insights You Can Gain

#### **For Course Improvement**:
- Identify courses with low completion rates
- See which courses students spend the most time on
- Find courses that need more engagement

#### **For Student Support**:
- Identify students who may need help (low engagement scores)
- Recognize highly engaged students
- Track individual student progress

#### **For Class Management**:
- Compare class performance
- Monitor enrollment trends
- Track post activity per class

#### **For Platform Growth**:
- Monitor user signup trends
- Track video access patterns
- Identify usage peaks and patterns

## Key Metrics Explained

### **Completion Rate**
Percentage of students who completed a course out of those who enrolled.

### **Engagement Score**
A weighted score indicating how active and involved a student is across the platform.

### **Average Watch Time**
The average amount of time students spend watching course videos, measured in minutes.

### **Recent Accesses**
Activity in the last 30 days, helping you identify current platform usage.

## Benefits

1. **Data-Driven Decisions**: Make informed decisions based on real usage data
2. **Student Success**: Identify students who need help and those who excel
3. **Course Optimization**: Improve courses based on completion and engagement metrics
4. **Resource Allocation**: Focus on what's working and improve what's not
5. **Trend Analysis**: Understand how usage patterns change over time
6. **Performance Tracking**: Monitor the overall health of your platform

## Technical Notes

### Database Queries
The analytics use optimized queries with proper indexing on:
- `created_at` fields for trend analysis
- `status` fields for progress tracking
- `user_id` for user-specific analytics
- `class_id` for class-based metrics

### Performance
- All analytics endpoints are optimized with aggregate queries
- Results are limited where appropriate (e.g., top 50 students)
- Dashboard loads all data in parallel for faster response

### Security
- All analytics endpoints require ADMIN role
- Authentication is enforced via JWT tokens
- No sensitive data is exposed

## Future Enhancements

Consider adding:
1. **Visual Charts**: Line graphs, bar charts, pie charts using libraries like Chart.js or Recharts
2. **Export Functionality**: CSV/PDF export of analytics data
3. **Email Reports**: Scheduled weekly/monthly analytics reports
4. **Predictive Analytics**: ML models to predict student dropoff
5. **Custom Dashboards**: Allow admins to create personalized views
6. **Real-time Updates**: WebSocket integration for live statistics
7. **Comparative Analysis**: Compare current period with previous periods
8. **Goal Setting**: Set and track platform goals

## Support

If you need to:
- Add new metrics
- Modify the engagement score formula
- Add new analytics views
- Export data

Please refer to the controller and repository files in the backend, and the dashboard page in the frontend.

