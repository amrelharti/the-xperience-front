# 🎯 Deploying LMS at /app Subdirectory

## Your Setup

You want:
- ✅ **`the-xperience.com`** → Existing landing page (Hostinger)
- ✅ **`the-xperience.com/app`** → Your LMS application (Next.js)
- ✅ **`api.the-xperience.com`** → Your Backend API (Spring Boot)

This guide shows you how to configure Nginx to serve both!

---

## 🏗️ Architecture

```
the-xperience.com
     ↓
   Nginx
     ↓
  ┌──┴──┐
  ↓     ↓
Root    /app
(Landing) (LMS)
Hostinger Next.js
Website   (Port 3000)
```

---

## 📝 Configuration Steps

### Option 1: Keep Landing Page on Hostinger, LMS on VPS

If your landing page is hosted on Hostinger's web hosting (not VPS):

**This won't work easily** because Hostinger web hosting and VPS are separate. You'd need to:
1. Move landing page to VPS, OR
2. Use a subdomain for LMS (e.g., `app.the-xperience.com`)

**Recommended: Use `app.the-xperience.com`** for your LMS.

---

### Option 2: Both on Same VPS (Recommended)

If you move your landing page to the VPS or it's already there:

#### Step 1: Upload Landing Page
```bash
# Create directory for landing page
mkdir -p /var/www/the-xperience.com

# Upload your landing page files to:
# /var/www/the-xperience.com/
```

#### Step 2: Configure Next.js for Subdirectory

Update `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/app',  // Add this line
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
}

export default nextConfig
```

#### Step 3: Update Nginx Configuration

Create this Nginx config:

```nginx
server {
    listen 80;
    server_name the-xperience.com www.the-xperience.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/the-xperience.com.access.log;
    error_log /var/log/nginx/the-xperience.com.error.log;

    # Root location - Landing page
    location / {
        root /var/www/the-xperience.com;
        index index.html index.htm;
        try_files $uri $uri/ =404;
    }

    # LMS Application at /app
    location /app {
        proxy_pass http://localhost:3000/app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Next.js static files
    location /app/_next/static {
        proxy_pass http://localhost:3000/app/_next/static;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Next.js other files
    location /app/_next {
        proxy_pass http://localhost:3000/app/_next;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### Option 3: Use Subdomain (Easiest!)

**Recommended approach:** Use `app.the-xperience.com` for your LMS.

#### Advantages:
- ✅ No conflicts with landing page
- ✅ Easier to manage
- ✅ Cleaner URLs
- ✅ No Next.js configuration changes needed
- ✅ Landing page stays on Hostinger

#### DNS Configuration:
Add one A record:
- **A Record**: `app` → Your VPS IP

#### Nginx Configuration:
```nginx
# Landing page stays on Hostinger
# (No changes needed)

# LMS on VPS - app.the-xperience.com
server {
    listen 80;
    server_name app.the-xperience.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/app.the-xperience.com.access.log;
    error_log /var/log/nginx/app.the-xperience.com.error.log;

    # Proxy to Next.js frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files optimization
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        proxy_cache_bypass $http_pragma $http_authorization;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

---

## 🎯 My Recommendation: Use Subdomain

Based on your setup (landing page on Hostinger), here's what I recommend:

### Setup:
- **`the-xperience.com`** → Keep on Hostinger (landing page)
- **`app.the-xperience.com`** → LMS on VPS
- **`api.the-xperience.com`** → Backend on VPS

### Why?
1. ✅ No need to move landing page
2. ✅ Simpler configuration
3. ✅ Easier to manage separately
4. ✅ Better performance (each on optimal hosting)
5. ✅ Cleaner URLs

---

## 🚀 Quick Setup for Subdomain Approach

### Step 1: Update DNS
Add this A record in your domain registrar:
- **A Record**: `app` → Your VPS IP

### Step 2: Update Nginx Script

Save this as `setup-nginx-subdomain.sh`:

```bash
#!/bin/bash

echo "Setting up Nginx for app.the-xperience.com..."

# API subdomain config
cat > /etc/nginx/sites-available/api.the-xperience.com <<'EOF'
server {
    listen 80;
    server_name api.the-xperience.com;

    client_max_body_size 100M;
    
    access_log /var/log/nginx/api.the-xperience.com.access.log;
    error_log /var/log/nginx/api.the-xperience.com.error.log;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# App subdomain config
cat > /etc/nginx/sites-available/app.the-xperience.com <<'EOF'
server {
    listen 80;
    server_name app.the-xperience.com;

    access_log /var/log/nginx/app.the-xperience.com.access.log;
    error_log /var/log/nginx/app.the-xperience.com.error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
EOF

# Enable sites
ln -sf /etc/nginx/sites-available/api.the-xperience.com /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/app.the-xperience.com /etc/nginx/sites-enabled/

# Test and reload
nginx -t && systemctl reload nginx

echo "✅ Nginx configured!"
echo ""
echo "Now run SSL setup:"
echo "certbot --nginx -d app.the-xperience.com"
echo "certbot --nginx -d api.the-xperience.com"
```

### Step 3: Run Deployment
```bash
# Make script executable
chmod +x setup-nginx-subdomain.sh

# Deploy backend (same as before)
./deploy-backend.sh

# Deploy frontend (same as before)
./deploy-frontend.sh

# Setup Nginx with subdomain
./setup-nginx-subdomain.sh

# Setup SSL
certbot --nginx -d app.the-xperience.com
certbot --nginx -d api.the-xperience.com
```

### Step 4: Update Backend CORS
In your backend `application.properties`:
```properties
app.allowed-origins=https://app.the-xperience.com,https://api.the-xperience.com
```

### Step 5: Update Frontend API URL
In `/srv/xperience-front/.env.production`:
```bash
NEXT_PUBLIC_API_URL=https://api.the-xperience.com
```

---

## 🔄 Final Structure

```
the-xperience.com (Hostinger)
    ↓
Landing Page
(Career Coaching Website)
    ↓
[Button: "Accéder à la plateforme"]
    ↓
Links to: app.the-xperience.com
    ↓
Your LMS (VPS)
```

### Update Landing Page
Add a button/link on your landing page that goes to:
```html
<a href="https://app.the-xperience.com">Accéder à la plateforme</a>
```

---

## ✅ Final Checklist

- [ ] DNS: `app.the-xperience.com` → VPS IP
- [ ] DNS: `api.the-xperience.com` → VPS IP
- [ ] Backend deployed on VPS
- [ ] Frontend deployed on VPS
- [ ] Nginx configured for subdomains
- [ ] SSL certificates for both subdomains
- [ ] Backend CORS updated
- [ ] Frontend API URL updated
- [ ] Landing page link updated to point to `app.the-xperience.com`
- [ ] Test: `https://app.the-xperience.com` works
- [ ] Test: `https://api.the-xperience.com/actuator/health` works
- [ ] Test: Can sign in and use LMS

---

## 🎉 Result

Your users will:
1. Visit **the-xperience.com** (landing page on Hostinger)
2. Click "Accéder à la plateforme" or sign in button
3. Get redirected to **app.the-xperience.com** (LMS on VPS)
4. Use the full LMS application

Perfect separation of marketing site and application!

---

## 📝 Summary

**Recommended Setup:**
```
Landing:  https://the-xperience.com        (Hostinger)
LMS App:  https://app.the-xperience.com    (VPS)
API:      https://api.the-xperience.com    (VPS)
```

**Why This Works:**
- Landing page stays fast on Hostinger
- LMS runs on powerful VPS
- Clean separation of concerns
- Easy to manage separately
- Professional setup

---

Need help implementing this? Let me know which approach you prefer!

