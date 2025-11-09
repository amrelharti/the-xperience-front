# 🔧 Maintenance Mode Guide

A professional maintenance mode system for The Xperience platform. Show a beautiful maintenance page to users when you're updating the app.

## 📁 Files Created

1. **`app/maintenance/page.tsx`** - The maintenance page users will see
2. **`middleware.ts`** - Handles redirecting users to maintenance page
3. **`.env.local`** - Environment variables (you need to create this)

---

## 🚀 How to Use It

### **Step 1: Create .env.local File**

In your project root (`D:\Ali projet\the-xperience-front\`), create a file called `.env.local` with this content:

```bash
# Maintenance Mode - Set to true to enable, false to disable
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

### **Step 2: Enable Maintenance Mode**

When you want to show the maintenance page, edit `.env.local`:

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=true
```

### **Step 3: Restart Your App**

After changing the environment variable:

**For Development:**
```bash
# Stop the dev server (Ctrl+C) and restart:
npm run dev
```

**For Production:**
```bash
# Rebuild and restart:
npm run build
npm start
```

### **Step 4: Disable Maintenance Mode**

When you're done with maintenance, change it back:

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

Then restart the app again.

---

## 🎨 What Users Will See

When maintenance mode is enabled, users will see:
- ✨ Beautiful, modern maintenance page
- ⏰ Estimated downtime message (15-30 minutes)
- 🔄 "Check Again" button to refresh
- 📧 Contact support link
- 🎭 Smooth animations and professional design

---

## 🔓 Advanced Features

### **1. Admin/Developer Bypass**

Want to access the app during maintenance? Add this to `.env.local`:

```bash
MAINTENANCE_BYPASS_TOKEN=my-secret-token-123
```

**Then in your browser console:**
```javascript
document.cookie = "maintenance-bypass=my-secret-token-123; path=/";
```

Now you can access the app while everyone else sees the maintenance page!

To remove the bypass:
```javascript
document.cookie = "maintenance-bypass=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
```

### **2. IP Whitelist**

Whitelist specific IP addresses that can always access the app:

```bash
MAINTENANCE_WHITELIST_IPS=192.168.1.100,203.0.113.5
```

Your complete `.env.local` would look like:

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=true
MAINTENANCE_BYPASS_TOKEN=my-secret-password-123
MAINTENANCE_WHITELIST_IPS=192.168.1.100
```

---

## 📝 Customization

### **Change the Maintenance Page Design**

Edit `app/maintenance/page.tsx` to customize:
- Message text
- Colors
- Estimated downtime
- Contact email
- Logo or branding

### **Change Estimated Downtime**

```tsx
// In app/maintenance/page.tsx, find this line:
<p className="text-2xl font-bold text-blue-600">15-30 minutes</p>

// Change to whatever you want:
<p className="text-2xl font-bold text-blue-600">2-3 hours</p>
```

### **Change Support Email**

```tsx
// Find this line:
<a href="mailto:support@yourapp.com" ...>

// Change to your email:
<a href="mailto:your-email@domain.com" ...>
```

---

## 🧪 Testing

### **Test Maintenance Mode Locally:**

1. Create `.env.local` with:
   ```bash
   NEXT_PUBLIC_MAINTENANCE_MODE=true
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

3. Visit `http://localhost:3000` - you should see the maintenance page

4. Try accessing any route - all routes redirect to `/maintenance`

5. Test bypass token (optional):
   - Set `MAINTENANCE_BYPASS_TOKEN=test123` in `.env.local`
   - In browser console: `document.cookie = "maintenance-bypass=test123; path=/"`
   - Refresh page - you should now see the normal app!

---

## 🌐 Production Deployment

### **Vercel/Netlify:**

1. Go to your project settings
2. Add environment variable:
   - Key: `NEXT_PUBLIC_MAINTENANCE_MODE`
   - Value: `true`
3. Redeploy your app
4. The maintenance page is now live!

### **VPS/Manual Deployment:**

```bash
# Before deploying updates:
export NEXT_PUBLIC_MAINTENANCE_MODE=true
npm run build
npm start

# After updates are done:
export NEXT_PUBLIC_MAINTENANCE_MODE=false
npm run build
npm start
```

---

## ⚠️ Important Notes

1. **Environment Variable Name**: Must be `NEXT_PUBLIC_MAINTENANCE_MODE` (with `NEXT_PUBLIC_` prefix)

2. **Value Must Be String**: Use `"true"` or `"false"` as strings

3. **Restart Required**: After changing env variables, you MUST restart the app

4. **API Routes**: API routes are NOT blocked by maintenance mode. If you want to block APIs too, modify the middleware.

5. **File Location**: `.env.local` must be in the root directory (same folder as `package.json`)

---

## 🎯 Quick Commands Cheat Sheet

```powershell
# Create .env.local file (Windows PowerShell)
echo "NEXT_PUBLIC_MAINTENANCE_MODE=false" > .env.local

# Or create it manually:
# 1. Right-click in project folder
# 2. New > Text Document
# 3. Name it: .env.local (delete .txt extension)
# 4. Add: NEXT_PUBLIC_MAINTENANCE_MODE=false

# Restart dev server
npm run dev

# Production deployment
npm run build
npm start
```

---

## 🐛 Troubleshooting

**Problem**: Maintenance page not showing even though env is set to `true`

**Solutions**:
- ✅ Make sure you restarted the app after changing env
- ✅ Check the env variable name is exactly `NEXT_PUBLIC_MAINTENANCE_MODE`
- ✅ Check the value is string `"true"` not boolean `true`
- ✅ Clear cookies and try in incognito mode (in case bypass token is set)
- ✅ Make sure `.env.local` is in the root folder (next to `package.json`)

**Problem**: Can't turn off maintenance mode

**Solution**:
- Set `NEXT_PUBLIC_MAINTENANCE_MODE=false`
- Restart the app
- Clear browser cache

**Problem**: `.env.local` file not found

**Solution**:
- The file doesn't exist by default - you need to create it!
- Create it in the root directory: `D:\Ali projet\the-xperience-front\.env.local`

---

## 📖 Example .env.local File

Here's what your complete `.env.local` file might look like:

```bash
# =============================================================================
# MAINTENANCE MODE
# =============================================================================

# Enable/disable maintenance mode
NEXT_PUBLIC_MAINTENANCE_MODE=false

# Optional: Bypass token for admins
MAINTENANCE_BYPASS_TOKEN=super-secret-password-123

# Optional: Whitelist IPs (comma-separated)
MAINTENANCE_WHITELIST_IPS=192.168.1.100,203.0.113.5

# =============================================================================
# YOUR OTHER ENVIRONMENT VARIABLES
# =============================================================================

# Add any other env vars your app needs below...
```

---

## 🎉 That's It!

You now have a professional maintenance mode system. Enable it whenever you need to:
- Deploy major updates
- Perform database migrations
- Fix critical bugs
- Do scheduled maintenance

Questions? Just ask! 🚀

