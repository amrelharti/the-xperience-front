# Backend Profile Fields Update - Complete

## ✅ Changes Applied

### 1. Database Migration
**File**: `D:\Ali projet\the-xperience-back\src\main\resources\db\migration\V40__Add_Profile_Fields_To_Users.sql`

Added three new columns to the `users` table:
- `title` VARCHAR(255) - User's job title/role
- `instagram` VARCHAR(255) - Instagram handle
- `linkedin` VARCHAR(500) - LinkedIn profile URL

### 2. User Entity Updated
**File**: `D:\Ali projet\the-xperience-back\src\main\java\com\thexperience\backend\entities\UserEntity.java`

Added fields:
```java
@Column(name = "title")
private String title;

@Column(name = "instagram")
private String instagram;

@Column(name = "linkedin", length = 500)
private String linkedin;
```

Added getters and setters for all three fields.

### 3. MeController Updated
**File**: `D:\Ali projet\the-xperience-back\src\main\java\com\thexperience\backend\users\MeController.java`

**GET `/api/me`**: Now returns title, instagram, and linkedin fields

**PUT `/api/me`** (NEW): Handles profile updates including:
- name
- email (with duplicate check)
- imageUrl
- title
- instagram
- linkedin

### 4. ProfileController Updated
**File**: `D:\Ali projet\the-xperience-back\src\main\java\com\thexperience\backend\profile\ProfileController.java`

Updated both GET and PUT methods to include the new fields.

## 🚀 Next Steps

1. **Restart the Spring Boot Backend**:
   ```bash
   cd "D:\Ali projet\the-xperience-back"
   mvn clean install
   mvn spring-boot:run
   ```

2. **Verify Migration**:
   - Flyway will automatically run V40 migration on startup
   - Check logs for "Migrating schema to version 40"

3. **Test the Profile Update**:
   - Go to http://localhost:3000/profile
   - Click "Edit Profile"
   - Update title, Instagram, LinkedIn
   - Upload a profile picture
   - Click "Save Changes"

## 📝 Frontend Integration

The frontend is already configured to:
- Send all fields to PUT `/api/me`
- Display title under username in feed posts
- Show Instagram and LinkedIn in profile
- Handle profile picture uploads (base64)

## ✨ Features

- **Title** appears under user's name in feed posts
- **Instagram** and **LinkedIn** are clickable links in profile
- **Profile picture** can be uploaded and changed
- All fields are optional
- Clean validation and error handling

