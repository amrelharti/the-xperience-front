# 🚀 How to Deploy Your App to Hostinger VPS

## 📄 What I've Created for You

I've prepared **4 helpful files** to make your deployment smooth:

1. **VPS_DEPLOYMENT_GUIDE.md** - Complete detailed guide (if you want to do it manually step-by-step)
2. **DEPLOYMENT_QUICK_START.md** - Quick reference and cheat sheet
3. **Automated Scripts**:
   - `deploy-backend.sh` - Automatically deploys your Spring Boot backend
   - `deploy-frontend.sh` - Automatically deploys your Next.js frontend  
   - `setup-nginx.sh` - Automatically configures Nginx with SSL

---

## 🎯 Choose Your Path

### Path 1: Automated Deployment (Recommended - Easy! 😊)
Use the scripts I created. Just run them and answer a few questions.

### Path 2: Manual Deployment (For Learning)
Follow the detailed guide step by step.

---

## 🏃‍♂️ Quick Deploy (Path 1 - Recommended)

### Step 1: Prepare Your Files

On your local machine, make sure you have:
- ✅ Your backend JAR file compiled
- ✅ All frontend source code
- ✅ The 3 deployment scripts (from this directory)

### Step 2: Connect to Your VPS

```bash
ssh root@your-vps-ip
```

### Step 3: Upload Everything

**Option A: Using FileZilla (GUI)**
1. Download FileZilla (free FTP client)
2. Connect to your VPS using SFTP
3. Upload backend JAR to: `/srv/the-xperience-back/`
4. Upload frontend code to: `/srv/xperience-front/`
5. Upload the 3 `.sh` scripts to: `/root/`

**Option B: Using SCP (Command Line)**
```bash
# From your local machine (Windows PowerShell or Git Bash)

# Upload backend
scp path/to/your-backend.jar root@your-vps-ip:/srv/the-xperience-back/

# Upload frontend (entire folder)
scp -r "D:\Ali projet\the-xperience-front" root@your-vps-ip:/srv/xperience-front/

# Upload scripts
scp deploy-backend.sh root@your-vps-ip:/root/
scp deploy-frontend.sh root@your-vps-ip:/root/
scp setup-nginx.sh root@your-vps-ip:/root/
```

### Step 4: Run the Deployment Scripts

SSH into your VPS and run:

```bash
# Connect to VPS
ssh root@your-vps-ip

# Make scripts executable
cd /root
chmod +x deploy-backend.sh deploy-frontend.sh setup-nginx.sh

# 1. Deploy Backend (5-10 minutes)
./deploy-backend.sh
# It will ask for:
# - Database password (choose a strong one)
# - Google Client ID (press Enter for default)

# 2. Deploy Frontend (10-15 minutes)
./deploy-frontend.sh
# It will ask for:
# - API URL: enter https://api.the-xperience.com

# 3. Setup Nginx and SSL (5 minutes)
./setup-nginx.sh
# It will ask for:
# - Frontend domain: the-xperience.com
# - API domain: api.the-xperience.com
# - Setup SSL: yes
```

### Step 5: Configure DNS

Go to your domain provider (Namecheap, GoDaddy, etc.) and add these records:

| Type | Name | Value |
|------|------|-------|
| A | @ | Your VPS IP |
| A | www | Your VPS IP |
| A | api | Your VPS IP |

**Wait 10-15 minutes** for DNS to propagate.

### Step 6: Test Everything

```bash
# Test backend
curl https://api.the-xperience.com/actuator/health

# Open in browser
https://the-xperience.com
```

---

## 🎓 Manual Deploy (Path 2 - Learn Everything)

If you want to understand every step and do it manually:

1. Open **VPS_DEPLOYMENT_GUIDE.md**
2. Follow each section carefully
3. This will teach you exactly how everything works

---

## 📋 What Each Script Does

### `deploy-backend.sh`
- ✅ Installs Java 17
- ✅ Installs and configures PostgreSQL
- ✅ Creates database and user
- ✅ Creates environment file
- ✅ Creates systemd service for auto-start
- ✅ Starts your backend
- ✅ Tests if it's working

### `deploy-frontend.sh`
- ✅ Installs Node.js 18+
- ✅ Installs PM2 process manager
- ✅ Creates environment file
- ✅ Installs npm dependencies
- ✅ Builds your Next.js app
- ✅ Starts frontend with PM2
- ✅ Configures auto-start on boot
- ✅ Tests if it's working

### `setup-nginx.sh`
- ✅ Installs Nginx
- ✅ Creates configuration for frontend
- ✅ Creates configuration for backend API
- ✅ Enables both sites
- ✅ Tests configuration
- ✅ Installs SSL certificates (Let's Encrypt)
- ✅ Configures HTTPS redirect

---

## 🗂️ Your VPS Structure After Deployment

```
/srv/
├── the-xperience-back/
│   ├── backend.jar (your JAR file)
│   └── .env (environment variables)
│
└── xperience-front/
    ├── app/
    ├── components/
    ├── public/
    ├── node_modules/
    ├── .next/ (built files)
    ├── package.json
    ├── .env.production
    └── ecosystem.config.js

/etc/
├── systemd/system/
│   └── xperience-backend.service
│
└── nginx/
    ├── sites-available/
    │   ├── the-xperience.com
    │   └── api.the-xperience.com
    └── sites-enabled/
        ├── the-xperience.com -> ../sites-available/the-xperience.com
        └── api.the-xperience.com -> ../sites-available/api.the-xperience.com

/var/log/
├── xperience-backend.log
├── xperience-backend-error.log
├── xperience-frontend.log
├── xperience-frontend-error.log
└── nginx/
    ├── the-xperience.com.access.log
    ├── the-xperience.com.error.log
    ├── api.the-xperience.com.access.log
    └── api.the-xperience.com.error.log
```

---

## 🔍 Verify Deployment

After running all scripts, check:

```bash
# 1. Check all services are running
systemctl status xperience-backend
pm2 status
systemctl status nginx
systemctl status postgresql

# 2. Check logs for errors
journalctl -u xperience-backend -n 20
pm2 logs xperience-frontend --lines 20

# 3. Test locally
curl http://localhost:8080/actuator/health
curl http://localhost:3000

# 4. Test via domain (after DNS propagation)
curl https://api.the-xperience.com/actuator/health
curl https://the-xperience.com
```

---

## ❗ Common Issues & Solutions

### Issue 1: "Connection refused" when accessing domain
**Solution**: DNS not propagated yet. Wait 10-15 minutes and try again.

```bash
# Check DNS propagation
nslookup the-xperience.com
nslookup api.the-xperience.com
```

### Issue 2: Backend not starting
**Solution**: Check logs and database connection

```bash
# Check logs
journalctl -u xperience-backend -n 50

# Test database
sudo -u postgres psql -d xperience2_db -U xperience_user
```

### Issue 3: Frontend showing errors
**Solution**: Rebuild and restart

```bash
cd /srv/xperience-front
rm -rf .next node_modules
npm install
npm run build
pm2 restart xperience-frontend
```

### Issue 4: 502 Bad Gateway
**Solutions**:
```bash
# Check if backend is running
systemctl status xperience-backend

# Check if port 8080 is listening
netstat -tlnp | grep 8080

# Restart backend
systemctl restart xperience-backend
```

### Issue 5: SSL certificate fails
**Solutions**:
```bash
# Make sure DNS is pointing to your server
nslookup the-xperience.com

# Make sure ports 80 and 443 are open
ufw allow 80/tcp
ufw allow 443/tcp

# Try again
certbot --nginx -d the-xperience.com -d www.the-xperience.com
```

---

## 🛠️ Useful Commands Reference

### Restart Everything
```bash
systemctl restart xperience-backend
pm2 restart xperience-frontend
systemctl restart nginx
```

### View Logs
```bash
# Backend
journalctl -u xperience-backend -f

# Frontend
pm2 logs xperience-frontend

# Nginx
tail -f /var/log/nginx/*.log
```

### Check Status
```bash
systemctl status xperience-backend
pm2 status
systemctl status nginx
```

### Stop Services
```bash
systemctl stop xperience-backend
pm2 stop xperience-frontend
systemctl stop nginx
```

---

## 📞 Still Need Help?

### Before Asking for Help, Provide:

1. **Error messages** from logs:
```bash
journalctl -u xperience-backend -n 50 > backend-logs.txt
pm2 logs xperience-frontend --lines 50 > frontend-logs.txt
```

2. **Service status**:
```bash
systemctl status xperience-backend
pm2 status
```

3. **What you've tried**:
- Which script failed?
- At what step?
- Any error messages?

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ https://the-xperience.com loads your homepage
- ✅ https://api.the-xperience.com/actuator/health returns `{"status":"UP"}`
- ✅ You can sign in
- ✅ You can view courses
- ✅ No errors in browser console
- ✅ All services start automatically after reboot

---

## 📚 Learning Resources

To understand what's happening:

1. **Systemd** (manages backend):
   - `man systemd.service`
   - https://systemd.io/

2. **PM2** (manages frontend):
   - https://pm2.keymetrics.io/docs/usage/quick-start/

3. **Nginx** (reverse proxy):
   - https://nginx.org/en/docs/beginners_guide.html

4. **Let's Encrypt** (SSL):
   - https://letsencrypt.org/getting-started/

---

## 🚀 You're Ready!

1. Upload your files
2. Run the 3 scripts
3. Configure DNS
4. Wait 10-15 minutes
5. Access your app!

**Total time: ~30-45 minutes** (mostly waiting for builds and DNS)

Good luck! 🎉

