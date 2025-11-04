# 🚀 Quick Start Deployment Guide

## Prerequisites
- VPS server (Hostinger)
- Domain names: `the-xperience.com` and `api.the-xperience.com`
- Backend JAR file
- Frontend code

---

## 📦 What You Need to Upload to VPS

### 1. Backend Files
Upload to `/srv/the-xperience-back/`:
- Your Spring Boot JAR file (e.g., `backend.jar`)

### 2. Frontend Files
Upload to `/srv/xperience-front/`:
- All your Next.js source code
- package.json
- next.config.mjs
- All app/ and components/ directories

### 3. Deployment Scripts (from this repository)
Upload to `/root/` or any directory:
- `deploy-backend.sh`
- `deploy-frontend.sh`
- `setup-nginx.sh`

---

## 🎯 Step-by-Step Deployment (The Easy Way)

### 1. Connect to Your VPS
```bash
ssh root@your-vps-ip
```

### 2. Upload Files
Use FileZilla, SCP, or any SFTP client:
```bash
# From your local machine
scp your-backend.jar root@your-vps-ip:/srv/the-xperience-back/
scp -r ./frontend-folder/* root@your-vps-ip:/srv/xperience-front/
scp *.sh root@your-vps-ip:/root/
```

### 3. Make Scripts Executable
```bash
cd /root
chmod +x deploy-backend.sh deploy-frontend.sh setup-nginx.sh
```

### 4. Deploy Backend
```bash
./deploy-backend.sh
```
Follow the prompts:
- Enter database password
- Enter Google Client ID (or press enter for default)

### 5. Deploy Frontend
```bash
./deploy-frontend.sh
```
Follow the prompts:
- Enter API URL (e.g., `https://api.the-xperience.com`)

### 6. Setup Nginx
```bash
./setup-nginx.sh
```
Follow the prompts:
- Enter frontend domain (e.g., `the-xperience.com`)
- Enter API domain (e.g., `api.the-xperience.com`)
- Choose yes for SSL setup

### 7. Configure DNS
In your domain registrar (Namecheap, GoDaddy, etc.):
- **A Record**: `the-xperience.com` → Your VPS IP
- **A Record**: `www.the-xperience.com` → Your VPS IP
- **A Record**: `api.the-xperience.com` → Your VPS IP

Wait 5-10 minutes for DNS propagation.

### 8. Test Your Deployment
```bash
# Test backend
curl http://localhost:8080/actuator/health

# Test frontend
curl http://localhost:3000

# Test via domain (after DNS propagation)
curl https://the-xperience.com
curl https://api.the-xperience.com/actuator/health
```

---

## 🔍 Verify Everything is Running

```bash
# Check backend
systemctl status xperience-backend

# Check frontend
pm2 status

# Check nginx
systemctl status nginx

# Check PostgreSQL
systemctl status postgresql
```

---

## 📝 View Logs

### Backend Logs
```bash
journalctl -u xperience-backend -f
# or
tail -f /var/log/xperience-backend.log
```

### Frontend Logs
```bash
pm2 logs xperience-frontend
# or
tail -f /var/log/xperience-frontend.log
```

### Nginx Logs
```bash
tail -f /var/log/nginx/the-xperience.com.access.log
tail -f /var/log/nginx/api.the-xperience.com.access.log
```

---

## 🔄 Common Commands

### Restart Services
```bash
# Backend
systemctl restart xperience-backend

# Frontend
pm2 restart xperience-frontend

# Nginx
systemctl restart nginx
```

### Stop Services
```bash
# Backend
systemctl stop xperience-backend

# Frontend
pm2 stop xperience-frontend

# Nginx
systemctl stop nginx
```

### View Service Status
```bash
systemctl status xperience-backend
pm2 status
systemctl status nginx
```

---

## 🆘 Troubleshooting

### Backend Not Starting
```bash
# Check logs
journalctl -u xperience-backend -n 50 --no-pager

# Check if port 8080 is being used
netstat -tlnp | grep 8080

# Check database connection
sudo -u postgres psql -d xperience2_db -U xperience_user
```

### Frontend Not Starting
```bash
# Check logs
pm2 logs xperience-frontend --lines 50

# Rebuild
cd /srv/xperience-front
rm -rf .next
npm run build
pm2 restart xperience-frontend
```

### Nginx Issues
```bash
# Test configuration
nginx -t

# Check if ports are available
netstat -tlnp | grep -E '80|443'

# Reload configuration
systemctl reload nginx
```

### Database Issues
```bash
# Check PostgreSQL status
systemctl status postgresql

# Test connection
psql -h localhost -U xperience_user -d xperience2_db

# Check database exists
sudo -u postgres psql -l
```

---

## 🔐 Security Checklist

- [ ] Strong database password set
- [ ] Backend `.env` file has restricted permissions (600)
- [ ] Firewall configured (UFW):
  ```bash
  ufw allow 22/tcp   # SSH
  ufw allow 80/tcp   # HTTP
  ufw allow 443/tcp  # HTTPS
  ufw enable
  ```
- [ ] SSL certificates installed
- [ ] Database only accessible from localhost
- [ ] JWT secret is secure and not the default
- [ ] Regular backups configured

---

## 📦 Update Deployment

### Update Backend
```bash
# Stop service
systemctl stop xperience-backend

# Upload new JAR file to /srv/the-xperience-back/

# Start service
systemctl start xperience-backend

# Check status
systemctl status xperience-backend
```

### Update Frontend
```bash
cd /srv/xperience-front

# Upload new code or git pull
# git pull

# Install dependencies (if package.json changed)
npm install

# Rebuild
npm run build

# Restart
pm2 restart xperience-frontend
```

---

## 🗄️ Database Backup

### Manual Backup
```bash
# Create backup
pg_dump -U xperience_user xperience2_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -U xperience_user -d xperience2_db < backup_20231101_120000.sql
```

### Automated Daily Backup
```bash
# Create backup script
cat > /usr/local/bin/backup-xperience-db.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
mkdir -p $BACKUP_DIR
pg_dump -U xperience_user xperience2_db > $BACKUP_DIR/xperience_$(date +%Y%m%d_%H%M%S).sql
# Keep only last 7 days
find $BACKUP_DIR -name "xperience_*.sql" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-xperience-db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-xperience-db.sh") | crontab -
```

---

## 🌐 Port Reference

- **Backend (Spring Boot)**: 8080 (internal only)
- **Frontend (Next.js)**: 3000 (internal only)
- **Nginx**: 80 (HTTP), 443 (HTTPS)
- **PostgreSQL**: 5432 (localhost only)

---

## ✅ Final Checklist

After deployment, verify:
- [ ] Can access https://the-xperience.com
- [ ] Can access https://api.the-xperience.com
- [ ] Can sign in with credentials
- [ ] Can sign in with Google
- [ ] Dashboard loads correctly
- [ ] API calls work (check browser console)
- [ ] Images load correctly
- [ ] All links work
- [ ] No console errors
- [ ] Backend logs show no errors
- [ ] Frontend logs show no errors

---

## 📚 Need More Details?

See the complete guide: **VPS_DEPLOYMENT_GUIDE.md**

---

## 🎉 Success!

If everything is working:
1. ✅ Your backend is running on https://api.the-xperience.com
2. ✅ Your frontend is running on https://the-xperience.com
3. ✅ SSL is configured
4. ✅ All services start automatically on boot

**Your app is now live! 🚀**

---

## 📞 Getting Help

If you're stuck:
1. Check the logs (backend, frontend, nginx)
2. Verify DNS propagation: https://dnschecker.org
3. Test each service individually (backend → frontend → nginx)
4. Check firewall settings
5. Verify environment variables are correct

Common issues:
- **502 Bad Gateway**: Backend not running or wrong port
- **504 Gateway Timeout**: Backend taking too long to start
- **Connection Refused**: Service not started or firewall blocking
- **DNS errors**: DNS not propagated yet (wait 10-15 minutes)

