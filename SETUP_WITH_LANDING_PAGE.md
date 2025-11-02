# 🎯 Setup Guide: LMS App with Existing Landing Page

## Your Current Situation

✅ You have: **the-xperience.com** (landing page on Hostinger)  
🎯 You want: LMS app accessible at a URL

From your landing page at https://the-xperience.com, I can see it's your career coaching marketing website.

---

## 🎨 Recommended Setup

```
┌─────────────────────────────────────────────┐
│  the-xperience.com (Hostinger)              │
│  Landing Page - Career Coaching Website     │
│                                             │
│  [Button: "Accéder à la plateforme"] ──┐   │
└─────────────────────────────────────────┼───┘
                                          │
                                          ↓
                    ┌─────────────────────────────────┐
                    │  app.the-xperience.com (VPS)    │
                    │  Your LMS Application           │
                    │  - Courses                      │
                    │  - Student Dashboard            │
                    │  - Admin Panel                  │
                    └─────────────────────────────────┘
```

### URLs:
- **Landing Page**: `https://the-xperience.com` (stays on Hostinger)
- **LMS Application**: `https://app.the-xperience.com` (VPS)
- **Backend API**: `https://api.the-xperience.com` (VPS)

---

## 🚀 Quick Setup (30 minutes)

### Step 1: Configure DNS (5 minutes)

Go to your domain registrar and add these **2 new A records**:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `app` | Your VPS IP | 3600 |
| A | `api` | Your VPS IP | 3600 |

**Don't touch your existing records!** Your main domain stays on Hostinger.

**Example:**
- If your VPS IP is `123.45.67.89`:
  - `app` → `123.45.67.89`
  - `api` → `123.45.67.89`

### Step 2: Deploy Backend & Frontend (15 minutes)

SSH into your VPS:

```bash
ssh root@your-vps-ip

# Make scripts executable
cd /root
chmod +x deploy-backend.sh deploy-frontend.sh setup-nginx-subdomain.sh

# Deploy backend
./deploy-backend.sh
# Enter database password when prompted

# Deploy frontend
./deploy-frontend.sh
# Enter: https://api.the-xperience.com when asked for API URL
```

### Step 3: Configure Nginx for Subdomains (5 minutes)

```bash
# Run the subdomain nginx setup
./setup-nginx-subdomain.sh

# Answer 'yes' when asked about SSL
```

### Step 4: Update Backend Configuration (2 minutes)

Edit the backend configuration:

```bash
nano /srv/the-xperience-back/application.properties
```

Find and update this line:
```properties
app.allowed-origins=https://app.the-xperience.com,https://api.the-xperience.com
```

Restart backend:
```bash
systemctl restart xperience-backend
```

### Step 5: Update Landing Page (5 minutes)

Update your landing page on Hostinger to link to the LMS app.

**In your landing page HTML**, update the button/link:

```html
<!-- Find this button on your landing page -->
<a href="https://app.the-xperience.com" class="button-primary">
    Accéder à la plateforme
</a>

<!-- Or for the contact form submission -->
<form action="https://app.the-xperience.com/auth/signin">
    <!-- form fields -->
    <button>Je m'inscris</button>
</form>
```

---

## ✅ Verification Checklist

After 10-15 minutes (DNS propagation), verify:

- [ ] **Landing page still works**: https://the-xperience.com ✅
- [ ] **LMS app loads**: https://app.the-xperience.com ✅
- [ ] **API responds**: https://api.the-xperience.com/actuator/health ✅
- [ ] **HTTPS works** (green padlock) on all URLs ✅
- [ ] **Can sign in** to LMS app ✅
- [ ] **Button on landing page** goes to LMS app ✅

---

## 🔄 User Flow

1. **User visits**: `the-xperience.com`
   - Sees your marketing content
   - Reads about your coaching services
   
2. **User clicks**: "Accéder à la plateforme" or "Cliquez-ici pour rejoindre la formation"
   - Gets redirected to: `app.the-xperience.com`
   
3. **User arrives at**: `app.the-xperience.com`
   - Sees login/signup page
   - Can access the full LMS

Perfect separation! 🎉

---

## 📝 Configuration Summary

### DNS Records (in your domain registrar):
```
Type   Name   Value           Purpose
----   ----   -----           -------
A      @      Hostinger IP    Landing page
A      www    Hostinger IP    Landing page www
A      app    VPS IP          LMS application
A      api    VPS IP          Backend API
```

### Hostinger (Web Hosting):
- Hosts: `the-xperience.com`
- Files: Your landing page HTML/CSS/JS

### VPS (Your Hostinger VPS):
- Hosts: `app.the-xperience.com` (Frontend)
- Hosts: `api.the-xperience.com` (Backend)
- Services: Nginx, PM2, Java, PostgreSQL

---

## 🎨 Landing Page Integration

Add this to your landing page to link to the LMS:

### Navigation Menu:
```html
<nav>
    <a href="https://the-xperience.com">Accueil</a>
    <a href="https://the-xperience.com#testimonials">Témoignages</a>
    <a href="https://the-xperience.com#offers">Offres</a>
    <a href="https://app.the-xperience.com">Mon Compte</a>
    <a href="https://app.the-xperience.com/auth/signin" class="btn-primary">
        Connexion
    </a>
</nav>
```

### Call-to-Action Buttons:
```html
<!-- Main CTA -->
<a href="https://app.the-xperience.com/auth/signin" class="cta-button">
    Cliquez-ici pour rejoindre la formation
</a>

<!-- After payment/enrollment -->
<a href="https://app.the-xperience.com/courses" class="access-button">
    Accéder à mes cours
</a>
```

---

## 🔐 Security Note

Your setup will be:
- ✅ **HTTPS** on all domains (secure)
- ✅ **Separate** hosting (landing page failure won't affect LMS)
- ✅ **CORS configured** (only your domains can access API)
- ✅ **Firewall enabled** (only necessary ports open)

---

## 📊 Performance Benefits

### Landing Page (Hostinger Web Hosting):
- ⚡ Fast loading (optimized for static sites)
- 💰 Cost-effective
- 🌍 CDN enabled (if Hostinger provides it)

### LMS App (VPS):
- 🚀 Full control and resources
- 💪 Handles complex operations
- 📈 Scalable

Best of both worlds!

---

## 🆘 Troubleshooting

### "app.the-xperience.com doesn't work"
```bash
# Check DNS propagation
nslookup app.the-xperience.com

# Should show your VPS IP
# If not, wait 10-15 more minutes

# Check if frontend is running
pm2 status

# Check Nginx
systemctl status nginx
```

### "Landing page stopped working"
Don't worry! Your landing page is on Hostinger, not the VPS. The VPS deployment doesn't affect it.

### "API returns CORS error"
```bash
# Update CORS origins
nano /srv/the-xperience-back/application.properties

# Make sure it includes:
app.allowed-origins=https://app.the-xperience.com,https://api.the-xperience.com

# Restart backend
systemctl restart xperience-backend
```

---

## 🎯 Final Result

After setup:

```
Your Users:
    ↓
Landing Page (the-xperience.com)
    - Marketing content
    - Service description
    - Pricing
    - Contact form
    ↓
[Click "Accéder à la plateforme"]
    ↓
LMS App (app.the-xperience.com)
    - Sign in / Sign up
    - Dashboard
    - Courses
    - Progress tracking
    - Admin panel
```

Perfect professional setup! ✨

---

## 📞 Next Steps

1. **Right now**: Follow Step 1-5 above
2. **After DNS propagates** (10-15 min): Test all URLs
3. **Update landing page**: Add link to LMS app
4. **Inform users**: Send them to `app.the-xperience.com`

---

## 💡 Pro Tips

1. **Add the link prominently** on your landing page
2. **Use clear CTA**: "Accéder à ma formation" or "Connexion"
3. **Test the flow**: Landing → Click button → LMS loads
4. **Mobile responsive**: Make sure both sites work on mobile
5. **Consistent branding**: Use same colors/logo on both

---

## 🎉 You're Ready!

This setup gives you:
- ✅ Professional landing page (marketing)
- ✅ Powerful LMS app (learning platform)
- ✅ Clean separation (easy to manage)
- ✅ HTTPS everywhere (secure)
- ✅ Scalable (grow as you add students)

Let's get started! 🚀

