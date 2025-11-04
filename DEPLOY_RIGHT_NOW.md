# 🚀 Deploy Right Now - Your Files Are Ready!

Since your files are already on the VPS (`/srv/`), you can deploy **right now**!

---

## ⚡ Super Quick Deploy (3 Commands!)

### If Scripts Are Already on VPS:

```bash
# SSH into VPS
ssh root@your-vps-ip

# Run the 3 scripts
cd /root
chmod +x *.sh

./deploy-backend.sh          # 5 min - will find JAR in /srv/
./deploy-frontend.sh         # 10 min - uses /srv/xperience-front/
./setup-nginx-subdomain.sh   # 5 min - sets up app.the-xperience.com
```

### If Scripts NOT on VPS Yet:

**On Windows (from your project folder):**
```powershell
cd "D:\Ali projet\the-xperience-front"

scp deploy-backend.sh root@your-vps-ip:/root/
scp deploy-frontend.sh root@your-vps-ip:/root/
scp setup-nginx-subdomain.sh root@your-vps-ip:/root/
```

**Then on VPS:**
```bash
ssh root@your-vps-ip
cd /root
chmod +x *.sh

./deploy-backend.sh
./deploy-frontend.sh
./setup-nginx-subdomain.sh
```

---

## 📝 Script Questions

### deploy-backend.sh will ask:
- ✅ **Database password**: Choose a strong password (save it!)
- ✅ **Google Client ID**: Press Enter to use default

### deploy-frontend.sh will ask:
- ✅ **API URL**: Enter `https://api.the-xperience.com`

### setup-nginx-subdomain.sh will ask:
- ✅ **Setup SSL**: Answer `y` (yes)
- It will configure SSL for both app and api subdomains

---

## 🌐 Before You Start: Add DNS Records

**Go to your domain registrar** (where you manage the-xperience.com):

Add these 2 A records:
```
Type: A
Name: app
Value: Your-VPS-IP
TTL: 3600

Type: A
Name: api  
Value: Your-VPS-IP
TTL: 3600
```

**Don't change existing records!** Your landing page stays as is.

---

## ✅ After Running Scripts

### 1. Wait 10-15 minutes for DNS propagation

### 2. Test Everything:

```bash
# Test API
curl https://api.the-xperience.com/actuator/health
# Should return: {"status":"UP"}

# Test in browser
https://app.the-xperience.com
# Should show your LMS login page
```

### 3. Check Services:

```bash
systemctl status xperience-backend    # Should be "active (running)"
pm2 status                             # Should show "online"
systemctl status nginx                 # Should be "active (running)"
```

---

## 🎯 Your Final Setup

After deployment:

```
the-xperience.com        → Landing page (Hostinger - unchanged)
                            ↓
                    [Click "Accéder à la plateforme"]
                            ↓
app.the-xperience.com    → LMS App (VPS - your courses)
api.the-xperience.com    → Backend API (VPS)
```

---

## 📍 What the Scripts Found

The scripts will automatically:

1. **Find your JAR file** in `/srv/`
2. **Organize it** to `/srv/the-xperience-back/`
3. **Use your frontend** from `/srv/xperience-front/`
4. **Configure everything** automatically!

No manual configuration needed! 🎉

---

## 🆘 If Something Goes Wrong

### Script can't find JAR file:
```bash
# Check where it is
ls -lh /srv/*.jar

# If it's in a subdirectory
find /srv -name "*.jar"
```

### Script can't find frontend:
```bash
# Check if it exists
ls /srv/xperience-front/package.json

# If it's in a different location, move it:
mv /srv/your-frontend-folder /srv/xperience-front
```

### Backend won't start:
```bash
# Check logs
journalctl -u xperience-backend -n 50

# Check if database is running
systemctl status postgresql
```

### Frontend won't build:
```bash
# Check if Node.js is installed
node -v

# If not, the script will install it
```

---

## 🎉 You're Almost There!

Your files are ready, just run the scripts and you're done!

**Estimated time**: 20-30 minutes (mostly automated!)

---

## 📞 What to Do Right Now

1. **Check if scripts are on VPS**: `ssh root@your-vps-ip` then `ls /root/*.sh`
2. **If not, upload them** (see commands above)
3. **Add DNS records** for app and api subdomains
4. **Run the 3 scripts** in order
5. **Wait 15 minutes** for DNS
6. **Test**: Visit `https://app.the-xperience.com`
7. **Success!** 🎊

---

**Let's deploy! 🚀**

