# 🚀 Quick Deploy Card - Your Setup

## Your Situation
✅ Landing page exists at: **the-xperience.com** (Hostinger)  
🎯 Want LMS at: **the-xperience.com/app** or subdomain

## ⚡ Recommended: Use Subdomain

```
the-xperience.com        → Landing page (stays on Hostinger)
app.the-xperience.com    → LMS app (VPS)
api.the-xperience.com    → Backend (VPS)
```

---

## 🎯 Deploy in 5 Steps (30 minutes)

### 1️⃣ Add DNS Records (2 min)
Go to your domain registrar, add:
```
A    app    →    Your-VPS-IP
A    api    →    Your-VPS-IP
```

### 2️⃣ Upload Files to VPS (10 min)
```bash
# Upload to VPS:
/srv/the-xperience-back/    → Backend JAR file
/srv/xperience-front/       → Frontend code
/root/                      → Scripts (.sh files)
```

### 3️⃣ Deploy Backend (5 min)
```bash
ssh root@your-vps-ip
chmod +x *.sh
./deploy-backend.sh
```

### 4️⃣ Deploy Frontend (8 min)
```bash
./deploy-frontend.sh
# Enter: https://api.the-xperience.com
```

### 5️⃣ Setup Nginx + SSL (5 min)
```bash
./setup-nginx-subdomain.sh
# Answer 'yes' for SSL
```

---

## ✅ Test (after 15 min)

```bash
# 1. Test API
curl https://api.the-xperience.com/actuator/health

# 2. Visit in browser
https://app.the-xperience.com

# 3. Try to sign in
```

---

## 🔗 Update Landing Page

Add this link to your landing page (on Hostinger):

```html
<a href="https://app.the-xperience.com">
    Accéder à la plateforme
</a>
```

---

## 📝 Quick Commands

**View Logs:**
```bash
journalctl -u xperience-backend -f    # Backend
pm2 logs xperience-frontend           # Frontend
```

**Restart:**
```bash
systemctl restart xperience-backend   # Backend
pm2 restart xperience-frontend        # Frontend
systemctl restart nginx               # Nginx
```

**Status:**
```bash
systemctl status xperience-backend
pm2 status
systemctl status nginx
```

---

## 🆘 Issues?

**"app subdomain not working"**
→ Wait 15 min for DNS, check: `nslookup app.the-xperience.com`

**"502 Bad Gateway"**
→ Backend not running: `systemctl restart xperience-backend`

**"CORS error"**
→ Check backend CORS config includes `app.the-xperience.com`

---

## 📖 Full Guides

- **Your scenario**: [SETUP_WITH_LANDING_PAGE.md](./SETUP_WITH_LANDING_PAGE.md)
- **Step-by-step**: [HOW_TO_DEPLOY.md](./HOW_TO_DEPLOY.md)
- **Detailed manual**: [VPS_DEPLOYMENT_GUIDE.md](./VPS_DEPLOYMENT_GUIDE.md)
- **Commands**: [DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)

---

## 🎯 Final Result

```
User Journey:

1. Visit: the-xperience.com
   → Sees landing page (career coaching)

2. Click: "Accéder à la plateforme"
   → Redirects to: app.the-xperience.com

3. Arrive at: app.the-xperience.com
   → LMS login/signup
   → Access courses, dashboard, etc.
```

**Perfect separation! 🎉**

---

## 📞 Need Help?

1. Open: **SETUP_WITH_LANDING_PAGE.md** (your specific scenario)
2. Follow steps 1-5
3. Check troubleshooting section if issues

---

**You're ready to deploy! 🚀**

