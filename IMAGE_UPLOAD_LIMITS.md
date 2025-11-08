# 📸 Image Upload Size & Dimension Limits

## Complete Reference Guide for The Xperience Platform

---

## 🎯 Quick Summary

| Component | Max File Size | Recommended Dimensions | Formats |
|-----------|--------------|------------------------|---------|
| **Course Thumbnails** | 5 MB | 1200×675px (16:9) | JPG, PNG, WebP |
| **Module Thumbnails** | 5 MB | 800×450px (16:9) | JPG, PNG, WebP |
| **Training Thumbnails** | 5 MB | 1200×630px | JPG, PNG, WebP |
| **Profile Pictures** | 5 MB | Flexible (square recommended) | JPG, PNG, WebP |
| **User Avatars (Admin)** | 2 MB | Flexible | JPG, PNG, WebP |
| **Feed Attachments** | 2 MB | Flexible | Various |

---

## 📋 Detailed Breakdown

### 1. **Course Thumbnails**
- **Max Size:** 5 MB
- **Recommended Dimensions:** 1200×675px (16:9 aspect ratio)
- **Formats:** JPG, PNG, WebP
- **Location in App:**
  - `/app/admin/courses/new/page.tsx`
  - `/app/admin/courses/[id]/page.tsx`
- **Component:** `ImageUpload`
- **Validation:** Client-side (Frontend)

```typescript
// Validation code
if (file.size > 5 * 1024 * 1024) {
  alert('File size must be less than 5MB')
  return
}
```

---

### 2. **Module Thumbnails**
- **Max Size:** 5 MB
- **Recommended Dimensions:** 800×450px (16:9 aspect ratio)
- **Formats:** JPG, PNG, WebP
- **Location in App:**
  - `/app/admin/trainings/[id]/modules/page.tsx`
- **Component:** `ImageUpload`
- **Validation:** Client-side (Frontend)

---

### 3. **Training Thumbnails**
- **Max Size:** 5 MB
- **Recommended Dimensions:** 1200×630px
- **Formats:** JPG, PNG, WebP
- **Location in App:**
  - `/app/admin/trainings/new/page.tsx`
  - `/app/admin/trainings/[id]/page.tsx`
- **Component:** `ImageUpload`
- **Validation:** Client-side (Frontend)

---

### 4. **Profile Pictures**
- **Max Size:** 5 MB
- **Recommended Dimensions:** Square format recommended (e.g., 400×400px)
- **Formats:** JPG, PNG, WebP (accepts `image/*`)
- **Location in App:**
  - `/app/profile/page.tsx`
- **Storage:** Base64 encoded in database
- **Validation:** Client-side (Frontend)

```typescript
// Validation code from profile page
if (file.size > 5 * 1024 * 1024) {
  toast({
    title: "Error",
    description: "Image size should be less than 5MB",
    variant: "destructive",
  })
  return
}
```

---

### 5. **User Avatars (Admin Panel)**
- **Max Size:** 2 MB (reduced for database compatibility)
- **Recommended Dimensions:** Flexible
- **Formats:** JPG, PNG, WebP
- **Location in App:**
  - `/app/admin/users/page.tsx`
- **Storage:** Base64 encoded in database
- **Validation:** Client-side (Frontend)
- **Note:** Lower limit to prevent database performance issues with data URLs

```typescript
// Special validation for admin user avatars
if (selectedImageFile.size > 2 * 1024 * 1024) {
  alert("File size too large. Please select an image smaller than 2MB to avoid database issues.")
  return
}
```

---

### 6. **Feed Attachments**
- **Max Size:** 2 MB (default for database compatibility)
- **Recommended Dimensions:** Flexible
- **Formats:** Various file types supported
- **Location in App:**
  - `/app/feed/new/page.tsx`
- **Component:** `FileUpload`
- **Storage:** Base64 encoded in database
- **Validation:** Client-side (Frontend)

---

## 🔧 Backend Configuration

### Spring Boot Backend
**Location:** `D:\Ali projet\the-xperience-back`

#### Current Configuration:
- **No explicit multipart file size limit** configured in `application.properties`
- Images are sent as **Base64 strings** in JSON payloads
- No dedicated file upload endpoints - images are embedded in entity data
- Controllers handle images as string fields (e.g., `imageUrl`, `thumbnailUrl`)

#### Database Storage:
```java
// Images stored as strings in UserEntity, CourseEntity, etc.
@Column(name = "image_url", columnDefinition = "TEXT")
private String imageUrl;

@Column(name = "thumbnail_url", columnDefinition = "TEXT")
private String thumbnailUrl;
```

#### API Endpoints that Accept Images:
- `PUT /api/me` - Profile update (includes imageUrl)
- `POST /api/admin/modules` - Training creation (includes thumbnailUrl)
- `POST /api/courses` - Course creation (includes thumbnail)
- `POST /api/feed/posts` - Feed posts (includes attachments)

---

## 🌐 Nginx Configuration

### Server Upload Limit:
```nginx
client_max_body_size 100M;
```

**Location:** Multiple deployment scripts
- `setup-nginx.sh`
- `setup-nginx-subdomain.sh`

This allows uploads up to **100 MB** at the server level, providing a generous buffer above frontend limits.

---

## 📊 Image Processing

### Frontend Processing:
1. **File Selection:** User selects image via `<input type="file">` or drag-and-drop
2. **Validation:** 
   - File type check: `file.type.startsWith('image/')`
   - Size check: `file.size > 5 * 1024 * 1024`
3. **Conversion:** FileReader converts to Base64 data URL
4. **Storage:** Base64 string sent to backend in JSON
5. **Display:** Base64 string used directly in `<img>` tags

### No Server-Side Image Processing:
- No image resizing on backend
- No format conversion
- No compression
- Images stored exactly as uploaded (Base64 encoded)

---

## 💡 Best Practices

### For Optimal Performance:
1. **Compress images before upload** using tools like:
   - [TinyPNG](https://tinypng.com)
   - [Squoosh](https://squoosh.app)
   - Photoshop/GIMP with quality settings

2. **Use recommended dimensions** to avoid:
   - Layout issues
   - Slow page loading
   - Wasted bandwidth

3. **Prefer JPG for photos** and **PNG for graphics**:
   - JPG: Better compression for photos
   - PNG: Better for graphics with transparency
   - WebP: Best compression but check browser support

4. **Keep files under 1 MB when possible**:
   - Faster uploads
   - Better database performance
   - Quicker page loads

### Dimension Guidelines:
- **16:9 ratio** (e.g., 1920×1080, 1280×720) for video-style content
- **Square** (e.g., 400×400) for avatars and profile pictures
- **Social media standard** (1200×630) for training covers

---

## 🚨 Known Limitations

1. **Base64 Storage:**
   - Increases data size by ~33%
   - Not ideal for very large images
   - Database query performance impact

2. **Frontend Validation Only:**
   - No server-side size validation
   - Determined users could bypass restrictions
   - Consider adding backend validation for production

3. **No Image Optimization:**
   - Images stored at uploaded quality
   - No automatic resizing
   - No progressive loading

---

## 🔍 Component Locations

### ImageUpload Component
**Path:** `/components/ui/image-upload.tsx`

**Features:**
- Drag-and-drop support
- URL input option
- Preview functionality
- Size validation (5 MB)
- Format validation (image/*)
- Base64 conversion

**Usage Example:**
```tsx
<ImageUpload
  value={formData.thumbnail}
  onChange={(url) => handleChange("thumbnail", url)}
  label="Course Thumbnail"
  placeholder="Enter image URL or upload a file"
  description="Upload a thumbnail image for your course (recommended: 1200×675px)"
/>
```

### FileUpload Component
**Path:** `/components/ui/file-upload.tsx`

**Features:**
- File selection
- Size validation (configurable, default 2 MB)
- Multiple file type support
- Base64 conversion

**Usage Example:**
```tsx
<FileUpload
  onChange={(dataUrl, file) => handleFileSelect(dataUrl, file)}
  accept="image/*"
  maxSize={2 * 1024 * 1024}
/>
```

---

## 📝 Implementation Details

### Image Upload Flow:

1. **User Action:**
   ```
   User selects file → Drag & Drop or Click to Upload
   ```

2. **Frontend Validation:**
   ```
   Check file type → Check file size → Show error if invalid
   ```

3. **Conversion:**
   ```
   FileReader.readAsDataURL(file) → Convert to Base64
   ```

4. **State Update:**
   ```
   Set preview URL → Update form state
   ```

5. **Submission:**
   ```
   Include Base64 string in JSON payload → POST/PUT to API
   ```

6. **Backend Processing:**
   ```
   Receive JSON → Extract image string → Save to database
   ```

7. **Display:**
   ```
   Retrieve from database → Render in <img src={base64String} />
   ```

---

## 🎨 Recommended Tools

### Image Editing:
- **[Photopea](https://www.photopea.com/)** - Free online Photoshop alternative
- **[Canva](https://www.canva.com/)** - Easy thumbnail creation
- **[Figma](https://www.figma.com/)** - Professional design tool

### Image Compression:
- **[TinyPNG](https://tinypng.com/)** - PNG/JPG compression
- **[Squoosh](https://squoosh.app/)** - Google's image compression tool
- **[Compressor.io](https://compressor.io/)** - Multi-format compression

### Image Dimensions:
- **[Image Resizer](https://imageresizer.com/)** - Quick resizing tool
- **[Bulk Resize Photos](https://bulkresizephotos.com/)** - Batch processing

---

## 📚 Related Documentation

- [THUMBNAIL_DIMENSIONS_GUIDE.md](./THUMBNAIL_DIMENSIONS_GUIDE.md) - Detailed dimension guidelines
- [BACKEND_PROFILE_UPDATE.md](./BACKEND_PROFILE_UPDATE.md) - Profile picture implementation
- [FEED_AND_LEADERBOARD_COMPLETE.md](./FEED_AND_LEADERBOARD_COMPLETE.md) - Feed attachments

---

## 🔄 Future Improvements

### Recommended Enhancements:
1. **Server-side validation** for file sizes
2. **Image optimization service** (resize, compress)
3. **CDN storage** instead of database (AWS S3, Cloudinary)
4. **Progressive image loading**
5. **Multiple size generation** (thumbnail, medium, large)
6. **Format conversion** (WebP for modern browsers)
7. **Image cropping** before upload
8. **Aspect ratio enforcement**

---

## 📞 Support

For questions or issues with image uploads:
1. Check this documentation first
2. Verify file size and format
3. Test with a smaller image
4. Check browser console for errors
5. Review backend logs for API errors

---

**Last Updated:** November 8, 2025  
**Version:** 1.0  
**Maintainer:** Development Team

