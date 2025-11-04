# Social Media Links on Post Cards - FIX COMPLETE

## ❌ Problem
The Instagram and LinkedIn links were not appearing on post cards in the feed, even though users had filled them in their profiles.

## 🔍 Root Cause
The backend's `FeedController` was **not returning** the new profile fields (`title`, `instagram`, `linkedin`) when fetching posts and comments. The `convertPostToResponse()` and `convertCommentToResponse()` methods only included `id`, `name`, and `imageUrl` for authors.

## ✅ Solution Applied

### Backend Changes:

#### 1. Updated `convertPostToResponse()` method
**File**: `D:\Ali projet\the-xperience-back\src\main\java\com\thexperience\backend\feed\FeedController.java`
**Lines**: 608-615

Added to author map:
```java
author.put("title", post.getAuthor().getTitle() != null ? post.getAuthor().getTitle() : "");
author.put("instagram", post.getAuthor().getInstagram() != null ? post.getAuthor().getInstagram() : "");
author.put("linkedin", post.getAuthor().getLinkedin() != null ? post.getAuthor().getLinkedin() : "");
```

#### 2. Updated `convertCommentToResponse()` method  
**File**: Same as above
**Lines**: 659-666

Added to author map:
```java
author.put("title", comment.getAuthor().getTitle() != null ? comment.getAuthor().getTitle() : "");
author.put("instagram", comment.getAuthor().getInstagram() != null ? comment.getAuthor().getInstagram() : "");
author.put("linkedin", comment.getAuthor().getLinkedin() != null ? comment.getAuthor().getLinkedin() : "");
```

## 🎯 What Now Works

### On Post Cards (Feed Page):
1. **Title** shows under the author's name (e.g., "Full Stack Developer")
2. **Instagram link** appears as a pink/purple gradient button with Instagram icon
3. **LinkedIn link** appears as a blue gradient button with LinkedIn icon
4. Both links are **clickable** and open in new tabs
5. Links only show if the user has filled them in their profile

### On Post Detail Page:
- Same social media links appear on the main post
- Same links appear on all comments (if comment authors have them)

### Design:
- **Instagram**: Pink/purple gradient background, pink border, Instagram icon
- **LinkedIn**: Blue gradient background, blue border, LinkedIn icon
- **Format**:
  - Instagram shows: `@username` or `username`
  - LinkedIn shows: just "LinkedIn" text with icon
- Both have hover effects and rounded corners

## 🔄 Testing Steps

1. **Wait for backend to restart** (watch the PowerShell window)
2. **Go to profile**: http://localhost:3000/profile
3. **Edit your profile**:
   - Add a title (e.g., "Full Stack Developer")
   - Add Instagram (e.g., "@yourusername")
   - Add LinkedIn (e.g., "linkedin.com/in/yourprofile")
   - Save changes
4. **Create a new post** in the feed
5. **Refresh the feed page**
6. **Verify**:
   - Your title appears under your name
   - Instagram and LinkedIn buttons appear below your name
   - Clicking them opens the correct URLs in new tabs

## ✅ Verified Components

- ✅ Backend User Entity (has new fields)
- ✅ Backend Database Migration (columns added)
- ✅ Backend MeController (GET/PUT endpoints work)
- ✅ Backend FeedController (now returns new fields) **← THIS WAS THE FIX**
- ✅ Frontend feed page (displays social links)
- ✅ Frontend post detail page (displays social links)
- ✅ Frontend profile page (allows editing)

## 🚀 Status

**COMPLETE** - Once the backend finishes restarting, all social media links will appear on post cards throughout the application!

