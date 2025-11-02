# 🎯 START HERE - Your Deployment Solution

## Hi! 👋

I've created a **complete deployment solution** for your app on Hostinger VPS. You've been struggling with deployment for 2 days, so I made it as simple as possible.

## 🎨 Your Specific Setup

Since you already have a landing page at **the-xperience.com**, I recommend:

- **`the-xperience.com`** → Keep your landing page (Hostinger)
- **`app.the-xperience.com`** → Your LMS application (VPS)
- **`api.the-xperience.com`** → Your backend API (VPS)

👉 **See [SETUP_WITH_LANDING_PAGE.md](./SETUP_WITH_LANDING_PAGE.md)** for your specific scenario!

This gives you the best setup: marketing site stays fast, LMS runs on powerful VPS.

---

## ✨ What I've Created for You

I've prepared **7 files** to help you deploy your app:

### 🤖 **3 Automated Scripts** (Just run them!)
1. **`deploy-backend.sh`** - Deploys your Spring Boot backend
2. **`deploy-frontend.sh`** - Deploys your Next.js frontend
3. **`setup-nginx.sh`** - Sets up web server + HTTPS

### 📖 **4 Documentation Files**
1. **`HOW_TO_DEPLOY.md`** - Step-by-step guide (start here!)
2. **`VPS_DEPLOYMENT_GUIDE.md`** - Detailed manual guide
3. **`DEPLOYMENT_QUICK_START.md`** - Command reference
4. **`DEPLOYMENT_FILES_SUMMARY.md`** - Overview of all files

---

## 🚀 Quick Deploy (3 Easy Steps!)

### Step 1: Upload Files to Your VPS

You need to upload:
- Your backend JAR file → `/srv/the-xperience-back/`
- Your frontend code → `/srv/xperience-front/`
- The 3 scripts → `/root/`

**How to upload:**
```bash
# Using SCP from your Windows machine (PowerShell)
scp your-backend.jar root@your-vps-ip:/srv/the-xperience-back/
scp -r "D:\Ali projet\the-xperience-front\*" root@your-vps-ip:/srv/xperience-front/
scp *.sh root@your-vps-ip:/root/
```

Or use **FileZilla** (GUI - easier!)

### Step 2: Run the 3 Scripts

SSH into your VPS:
```bash
ssh root@your-vps-ip
cd /root
chmod +x *.sh
```

Then run each script:
```bash
# 1. Deploy Backend (~5-10 minutes)
./deploy-backend.sh

# 2. Deploy Frontend (~10-15 minutes)
./deploy-frontend.sh

# 3. Setup Nginx & SSL (~5 minutes)
./setup-nginx.sh
```

Each script will ask you a few questions. Just follow the prompts!

### Step 3: Configure DNS

In your domain registrar (Namecheap, GoDaddy, etc.):
- Point `the-xperience.com` to your VPS IP
- Point `www.the-xperience.com` to your VPS IP
- Point `api.the-xperience.com` to your VPS IP

Wait 10-15 minutes, then visit: **https://the-xperience.com**

---

## 📋 What Each Script Does

### `deploy-backend.sh` ☕
- Installs Java 17
- Installs PostgreSQL
- Creates database
- Sets up your backend as a system service
- Starts it automatically

**You'll need**: Database password (choose a strong one!)

### `deploy-frontend.sh` ⚡
- Installs Node.js
- Installs PM2 (process manager)
- Builds your Next.js app
- Starts it with auto-restart

**You'll need**: API URL (e.g., `https://api.the-xperience.com`)

### `setup-nginx.sh` 🌐
- Installs Nginx web server
- Configures reverse proxy
- Gets free SSL certificates (HTTPS)
- Sets up auto-redirect to HTTPS

**You'll need**: Your domain names

---

## 🎯 What Happens After Deployment

Your setup will look like this:

```
Internet (HTTPS)
     ↓
Your Domain (the-xperience.com)
     ↓
Nginx (Web Server on VPS)
     ↓
   ┌─┴─┐
   ↓   ↓
Frontend  Backend
(Next.js) (Spring Boot)
   ↓       ↓
  PM2   PostgreSQL
```

### Services:
- ✅ **Backend**: Runs on port 8080 (internal)
- ✅ **Frontend**: Runs on port 3000 (internal)
- ✅ **Nginx**: Handles external traffic on ports 80/443
- ✅ **Database**: PostgreSQL on port 5432 (localhost only)
- ✅ **SSL**: Free HTTPS from Let's Encrypt
- ✅ **Auto-restart**: Everything restarts if it crashes
- ✅ **Auto-start**: Everything starts when VPS reboots

---

## 📖 Need More Details?

### For Step-by-Step Instructions:
👉 **Open [HOW_TO_DEPLOY.md](./HOW_TO_DEPLOY.md)**

This guide explains:
- How to upload files in detail
- What each script does
- Common issues and solutions
- How to test everything

### For Manual Deployment:
👉 **Open [VPS_DEPLOYMENT_GUIDE.md](./VPS_DEPLOYMENT_GUIDE.md)**

Use this if:
- Scripts don't work
- You want to understand every detail
- You want to do it manually

### For Quick Commands:
👉 **Open [DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)**

Use this for:
- Restarting services
- Viewing logs
- Updating your app
- Troubleshooting

---

## 🆘 Troubleshooting

### "I ran the script but it failed"
1. Check the error message
2. Look at logs: `journalctl -u xperience-backend -n 50`
3. See the troubleshooting section in HOW_TO_DEPLOY.md

### "My domain shows 'Connection refused'"
- DNS not propagated yet → Wait 10-15 minutes
- Check DNS: `nslookup the-xperience.com`

### "502 Bad Gateway"
- Backend not running → Check: `systemctl status xperience-backend`
- Restart: `systemctl restart xperience-backend`

### "Something else is broken"
- Check all services: `systemctl status xperience-backend`, `pm2 status`, `systemctl status nginx`
- Check logs in `/var/log/`
- See [HOW_TO_DEPLOY.md](./HOW_TO_DEPLOY.md) troubleshooting section

---

## ✅ Success Checklist

Your deployment is successful when:
- [ ] Backend deployed (script finished without errors)
- [ ] Frontend deployed (script finished without errors)
- [ ] Nginx configured (script finished without errors)
- [ ] DNS configured in domain registrar
- [ ] Can access https://the-xperience.com
- [ ] Can access https://api.the-xperience.com/actuator/health
- [ ] Can sign in to your app
- [ ] No errors in browser console
- [ ] All services auto-start (test by rebooting VPS)

---

## 🔍 Quick Commands

After deployment, use these commands:

### Check Status
```bash
systemctl status xperience-backend  # Backend status
pm2 status                          # Frontend status
systemctl status nginx              # Web server status
```

### View Logs
```bash
journalctl -u xperience-backend -f  # Backend logs
pm2 logs xperience-frontend         # Frontend logs
tail -f /var/log/nginx/*.log        # Web server logs
```

### Restart Services
```bash
systemctl restart xperience-backend  # Restart backend
pm2 restart xperience-frontend       # Restart frontend
systemctl restart nginx              # Restart web server
```

---

## ⏱️ Time Estimate

- **File upload**: 10-20 minutes (depends on internet speed)
- **Running scripts**: 20-30 minutes (mostly automated)
- **DNS propagation**: 10-15 minutes (waiting)

**Total**: ~45 minutes to 1 hour

---

## 💡 Pro Tips

1. **Test locally first**: Make sure backend runs on port 8080 before deploying
2. **Strong passwords**: Use strong database password
3. **Save passwords**: Write down your database password!
4. **Check logs**: Always check logs if something doesn't work
5. **DNS takes time**: Be patient, DNS can take 10-15 minutes

---

## 🎓 What You're Getting

After following this guide, you'll have:

✅ **Professional production setup**
- Java backend running as system service
- Next.js frontend with PM2 process manager
- Nginx as reverse proxy
- Free SSL certificate (HTTPS)
- Auto-restart on crashes
- Auto-start on server reboot
- Proper logging

✅ **Easy maintenance**
- Simple commands to restart services
- Easy to view logs
- Easy to update

✅ **Secure setup**
- HTTPS enabled
- Database not exposed to internet
- Proper security headers

---

## 🚀 Let's Get Started!

1. **Upload your files** to VPS
2. **Run the 3 scripts** (automated!)
3. **Configure DNS** in your domain registrar
4. **Wait 15 minutes** for DNS
5. **Visit your site**: https://the-xperience.com

**You've got this!** 🎉

---

## 📞 Next Steps

**Right now:**
1. Open [HOW_TO_DEPLOY.md](./HOW_TO_DEPLOY.md)
2. Follow the "Automated Deployment" path
3. Start uploading files to your VPS

**After deployment:**
1. Test everything
2. Save [DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md) for daily commands

---

## ❓ Questions?

All your questions are answered in:
- **[HOW_TO_DEPLOY.md](./HOW_TO_DEPLOY.md)** - Main guide
- **[VPS_DEPLOYMENT_GUIDE.md](./VPS_DEPLOYMENT_GUIDE.md)** - Detailed guide
- **[DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)** - Command reference
- **[DEPLOYMENT_FILES_SUMMARY.md](./DEPLOYMENT_FILES_SUMMARY.md)** - File overview

---

## 🎊 Ready to Deploy!

Everything is prepared. Just follow the steps and you'll have your app live in less than an hour!

**Good luck! 🚀**

---

_P.S. After 2 days of struggling, you deserve an easy deployment. These scripts will handle all the complex stuff for you!_ 😊

