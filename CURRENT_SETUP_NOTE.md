# 📍 Your Current Setup

## Current File Locations

Based on your setup:

### Backend (Already on VPS)
- **JAR file location**: `/srv/your-backend-file.jar`
- **Frontend location**: `/srv/xperience-front/`

### What the Script Will Do

The `deploy-backend.sh` script has been updated to:
1. ✅ Look for JAR file in `/srv/` first
2. ✅ Automatically move it to `/srv/the-xperience-back/` for organization
3. ✅ Create the systemd service with correct path

---

## 🚀 Quick Deploy Commands

Since your files are already on the VPS, you can deploy right away!

### Step 1: SSH into VPS
```bash
ssh root@your-vps-ip
```

### Step 2: Check Your Files
```bash
# Check JAR file
ls -lh /srv/*.jar

# Check frontend files
ls -lh /srv/xperience-front/

# Should see your files there
```

### Step 3: Upload Scripts (if not done yet)
If you haven't uploaded the deployment scripts yet:

**From your Windows machine:**
```powershell
# Navigate to your project folder
cd "D:\Ali projet\the-xperience-front"

# Upload scripts
scp deploy-backend.sh root@your-vps-ip:/root/
scp deploy-frontend.sh root@your-vps-ip:/root/
scp setup-nginx-subdomain.sh root@your-vps-ip:/root/
```

### Step 4: Run Deployment
```bash
# On the VPS
cd /root

# Make scripts executable
chmod +x *.sh

# Deploy backend (will find and organize your JAR file)
./deploy-backend.sh

# Deploy frontend
./deploy-frontend.sh

# Setup Nginx for subdomains
./setup-nginx-subdomain.sh
```

---

## 📂 File Organization After Deployment

The script will organize your files like this:

```
/srv/
├── the-xperience-back/
│   ├── your-backend.jar  (moved here automatically)
│   └── .env              (created by script)
│
└── xperience-front/      (your existing files)
    ├── app/
    ├── components/
    ├── package.json
    ├── .env.production    (created by script)
    └── ...
```

---

## ✅ What's Already Done

- ✅ JAR file uploaded to `/srv/`
- ✅ Frontend code uploaded to `/srv/xperience-front/`

## 🎯 What You Need to Do Now

1. **Upload deployment scripts** (3 .sh files) to `/root/`
2. **Run the 3 deployment scripts**
3. **Add DNS records** (app and api subdomains)
4. **Test your deployment**

Total time: ~30 minutes!

---

## 🔍 Verify Your Setup

Before running scripts, double-check:

```bash
# SSH into VPS
ssh root@your-vps-ip

# Check JAR file exists
ls -lh /srv/*.jar
# Should show your backend JAR file

# Check frontend exists
ls /srv/xperience-front/package.json
# Should show: /srv/xperience-front/package.json

# Check if backend is already running
systemctl status xperience-backend
# If running, stop it first: systemctl stop xperience-backend

# Check if frontend is already running
pm2 status
# If running, stop it: pm2 stop all
```

---

## 🚀 Ready to Deploy!

You're very close! Just:
1. Upload the 3 scripts
2. Run them in order
3. Your app will be live!

See **[SETUP_WITH_LANDING_PAGE.md](./SETUP_WITH_LANDING_PAGE.md)** for detailed steps.

---

## 💡 Pro Tip

The script is smart! It will:
- ✅ Find your JAR file wherever it is in `/srv/`
- ✅ Organize it properly
- ✅ Create all necessary configurations
- ✅ Handle everything automatically

You just need to answer a few questions (database password, etc.)!

