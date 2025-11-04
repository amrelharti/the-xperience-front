# Complete VPS Deployment Guide for The Xperience
## Hostinger VPS Deployment

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Database Setup (PostgreSQL)](#database-setup)
4. [Backend Deployment (Spring Boot)](#backend-deployment)
5. [Frontend Deployment (Next.js)](#frontend-deployment)
6. [Nginx Configuration](#nginx-configuration)
7. [SSL Certificate Setup](#ssl-certificate)
8. [Environment Variables](#environment-variables)
9. [Monitoring & Logs](#monitoring)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Prerequisites

Your current setup:
- **Backend**: `/srv/the-xperience-back/` (JAR file)
- **Frontend**: `/srv/xperience-front/`
- **Domain**: the-xperience.com
- **API Domain**: api.the-xperience.com

---

## 🖥️ Server Setup

### 1. Connect to your VPS
```bash
ssh root@your-vps-ip
```

### 2. Update System
```bash
apt update && apt upgrade -y
```

### 3. Install Required Software
```bash
# Install Java 17 (for Spring Boot)
apt install openjdk-17-jdk -y

# Install Node.js 18+ (for Next.js)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PM2 (Process Manager)
npm install -g pm2

# Install Nginx
apt install nginx -y

# Install PostgreSQL
apt install postgresql postgresql-contrib -y

# Install certbot (for SSL)
apt install certbot python3-certbot-nginx -y
```

### 4. Verify Installations
```bash
java -version          # Should show Java 17
node -v                # Should show v18+
npm -v                 # Should show npm version
psql --version         # Should show PostgreSQL version
nginx -v               # Should show nginx version
```

---

## 🗄️ Database Setup

### 1. Create PostgreSQL Database
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE xperience2_db;
CREATE USER xperience_user WITH PASSWORD 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE xperience2_db TO xperience_user;

# Grant schema permissions
\c xperience2_db
GRANT ALL ON SCHEMA public TO xperience_user;

# Exit
\q
```

### 2. Configure PostgreSQL for Remote Access (if needed)
```bash
# Edit postgresql.conf
nano /etc/postgresql/14/main/postgresql.conf

# Find and change:
listen_addresses = 'localhost'  # Keep it localhost for security

# Edit pg_hba.conf
nano /etc/postgresql/14/main/pg_hba.conf

# Add this line:
local   all             xperience_user                          md5

# Restart PostgreSQL
systemctl restart postgresql
```

---

## ☕ Backend Deployment (Spring Boot)

### 1. Prepare Backend Directory
```bash
cd /srv/the-xperience-back
# Your JAR file should be here
ls -la  # Should see your .jar file
```

### 2. Create Environment Configuration
```bash
nano /srv/the-xperience-back/.env
```

Add this content:
```properties
DATABASE_URL=jdbc:postgresql://localhost:5432/xperience2_db
DATABASE_USERNAME=xperience_user
DATABASE_PASSWORD=YourSecurePassword123!
GOOGLE_CLIENT_ID=128297296458-8nj8i8ej0mcrq5drskb2iargscjl3s59.apps.googleusercontent.com
```

### 3. Create Systemd Service for Backend
```bash
nano /etc/systemd/system/xperience-backend.service
```

Add this content:
```ini
[Unit]
Description=The Xperience Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/srv/the-xperience-back
EnvironmentFile=/srv/the-xperience-back/.env

# Update the JAR filename to match yours
ExecStart=/usr/bin/java -jar -Xmx512m -Xms256m /srv/the-xperience-back/backend.jar

# Restart configuration
Restart=always
RestartSec=10

# Logging
StandardOutput=append:/var/log/xperience-backend.log
StandardError=append:/var/log/xperience-backend-error.log

[Install]
WantedBy=multi-user.target
```

### 4. Start Backend Service
```bash
# Reload systemd
systemctl daemon-reload

# Enable service to start on boot
systemctl enable xperience-backend

# Start the service
systemctl start xperience-backend

# Check status
systemctl status xperience-backend

# View logs
tail -f /var/log/xperience-backend.log
```

### 5. Test Backend
```bash
# Test the health endpoint
curl http://localhost:8080/actuator/health
```

---

## ⚡ Frontend Deployment (Next.js)

### 1. Prepare Frontend Directory
```bash
cd /srv/xperience-front
```

### 2. Create Environment Variables
```bash
nano /srv/xperience-front/.env.production
```

Add this content:
```bash
NEXT_PUBLIC_API_URL=https://api.the-xperience.com
NODE_ENV=production
```

### 3. Install Dependencies and Build
```bash
cd /srv/xperience-front

# Install dependencies
npm install

# Build the Next.js app
npm run build

# Test the build locally first
npm start
# Press Ctrl+C to stop
```

### 4. Create PM2 Ecosystem File
```bash
nano /srv/xperience-front/ecosystem.config.js
```

Add this content:
```javascript
module.exports = {
  apps: [{
    name: 'xperience-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/srv/xperience-front',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/xperience-frontend-error.log',
    out_file: '/var/log/xperience-frontend.log',
    time: true
  }]
};
```

### 5. Start Frontend with PM2
```bash
# Start the app
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Enable PM2 to start on boot
pm2 startup systemd
# Follow the command it gives you

# Check status
pm2 status
pm2 logs xperience-frontend
```

---

## 🌐 Nginx Configuration

### 1. Create Nginx Configuration for Backend (API)
```bash
nano /etc/nginx/sites-available/api.the-xperience.com
```

Add this content:
```nginx
server {
    listen 80;
    server_name api.the-xperience.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Increased buffer sizes for large requests
    client_max_body_size 100M;
    client_body_buffer_size 128k;

    # Logging
    access_log /var/log/nginx/api.the-xperience.com.access.log;
    error_log /var/log/nginx/api.the-xperience.com.error.log;

    # Proxy to Spring Boot backend
    location / {
        proxy_pass http://localhost:8080;
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
}
```

### 2. Create Nginx Configuration for Frontend
```bash
nano /etc/nginx/sites-available/the-xperience.com
```

Add this content:
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

### 3. Enable Nginx Sites
```bash
# Create symbolic links
ln -s /etc/nginx/sites-available/api.the-xperience.com /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/the-xperience.com /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Reload nginx
systemctl reload nginx

# Check status
systemctl status nginx
```

---

## 🔒 SSL Certificate Setup

### 1. Setup DNS First
Before running certbot, ensure your DNS is pointing to your VPS:
- **A Record**: `the-xperience.com` → Your VPS IP
- **A Record**: `www.the-xperience.com` → Your VPS IP
- **A Record**: `api.the-xperience.com` → Your VPS IP

### 2. Obtain SSL Certificates
```bash
# For frontend domain
certbot --nginx -d the-xperience.com -d www.the-xperience.com

# For backend API domain
certbot --nginx -d api.the-xperience.com
```

Follow the prompts:
1. Enter your email
2. Agree to terms
3. Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### 3. Auto-renewal Test
```bash
# Test renewal
certbot renew --dry-run

# Certbot will automatically renew certificates
```

---

## 🔧 Environment Variables

### Update Backend application.properties

Update `/srv/the-xperience-back/application.properties` or create an `application-prod.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/xperience2_db
spring.datasource.username=xperience_user
spring.datasource.password=YourSecurePassword123!

# Server
server.port=8080

# CORS - Update with your actual domains
app.allowed-origins=https://the-xperience.com,https://www.the-xperience.com,https://api.the-xperience.com

# Domain
app.domain=the-xperience.com

# JWT (Keep your existing secret)
app.jwt-secret-base64=FyK1Gp2vVkp+0cA08Ttbi6pCtvMb9BBkqS9+3i6CvP1dyhWm2Eeo8RStRjVTTa3lW+nI0Q9iOxXhvl7mXhind0902==
app.jwt-alg=HS256
app.jwt-ttl-seconds=604800

# Google OAuth
GOOGLE_CLIENT_ID=128297296458-8nj8i8ej0mcrq5drskb2iargscjl3s59.apps.googleusercontent.com
app.google-client-id=${GOOGLE_CLIENT_ID}

# Vimeo (Keep your existing credentials)
vimeo.client-id=a6413cb5698fc09077a8d380734e83df303db194
vimeo.client-secret=raDexf5ljIkFDZUUsN0QOE7UzYCdHBDQuRGTm/Eog04QJbnym54sNHBr1P3bFJziE0aRG2AL3mJ7dDH7HTge+QOb7aI4Y4YxHfHibQRPalDS1XAl5DFZH5YzCqbE4uYH
vimeo.access-token=84904dd11670b2b6f433767e723527c7
vimeo.access.token=${vimeo.access-token}
vimeo.api.base.url=https://api.vimeo.com

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.format_sql=false

# Logging
logging.level.root=INFO
logging.level.org.springframework.security=WARN

# Actuator
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=always
management.endpoints.web.base-path=/actuator
```

### Update Frontend API URL

Create or update API utility file to use environment variable:

```bash
nano /srv/xperience-front/.env.production
```

```bash
NEXT_PUBLIC_API_URL=https://api.the-xperience.com
NODE_ENV=production
PORT=3000
```

After updating, rebuild:
```bash
cd /srv/xperience-front
npm run build
pm2 restart xperience-frontend
```

---

## 📊 Monitoring & Logs

### View Backend Logs
```bash
# Systemd logs
journalctl -u xperience-backend -f

# Log files
tail -f /var/log/xperience-backend.log
tail -f /var/log/xperience-backend-error.log
```

### View Frontend Logs
```bash
# PM2 logs
pm2 logs xperience-frontend

# Or specific log files
tail -f /var/log/xperience-frontend.log
tail -f /var/log/xperience-frontend-error.log
```

### View Nginx Logs
```bash
# Access logs
tail -f /var/log/nginx/the-xperience.com.access.log
tail -f /var/log/nginx/api.the-xperience.com.access.log

# Error logs
tail -f /var/log/nginx/the-xperience.com.error.log
tail -f /var/log/nginx/api.the-xperience.com.error.log
```

### Service Status Commands
```bash
# Backend
systemctl status xperience-backend

# Frontend
pm2 status
pm2 monit

# Nginx
systemctl status nginx

# PostgreSQL
systemctl status postgresql
```

---

## 🚨 Troubleshooting

### Backend Not Starting

1. **Check if port 8080 is free**:
```bash
netstat -tlnp | grep 8080
```

2. **Check Java version**:
```bash
java -version
```

3. **Check database connection**:
```bash
sudo -u postgres psql -d xperience2_db -U xperience_user
```

4. **View detailed logs**:
```bash
journalctl -u xperience-backend -n 100 --no-pager
```

### Frontend Not Building/Starting

1. **Check Node version**:
```bash
node -v  # Should be 18+
```

2. **Clear cache and rebuild**:
```bash
cd /srv/xperience-front
rm -rf .next
rm -rf node_modules
npm install
npm run build
pm2 restart xperience-frontend
```

3. **Check if port 3000 is free**:
```bash
netstat -tlnp | grep 3000
```

### Nginx Issues

1. **Test configuration**:
```bash
nginx -t
```

2. **Check if ports 80/443 are open**:
```bash
netstat -tlnp | grep -E '80|443'
```

3. **Check firewall**:
```bash
ufw status
ufw allow 80/tcp
ufw allow 443/tcp
```

### Database Connection Issues

1. **Check PostgreSQL is running**:
```bash
systemctl status postgresql
```

2. **Test connection**:
```bash
psql -h localhost -U xperience_user -d xperience2_db
```

3. **Check password in .env file**:
```bash
cat /srv/the-xperience-back/.env
```

### SSL Certificate Issues

1. **Check certificate status**:
```bash
certbot certificates
```

2. **Manually renew**:
```bash
certbot renew
```

3. **Check DNS propagation**:
```bash
dig the-xperience.com
dig api.the-xperience.com
```

---

## 🔄 Common Maintenance Commands

### Restart Services
```bash
# Restart backend
systemctl restart xperience-backend

# Restart frontend
pm2 restart xperience-frontend

# Restart nginx
systemctl restart nginx

# Restart PostgreSQL
systemctl restart postgresql
```

### Update Backend
```bash
# Stop service
systemctl stop xperience-backend

# Upload new JAR file to /srv/the-xperience-back/

# Start service
systemctl start xperience-backend

# Check logs
tail -f /var/log/xperience-backend.log
```

### Update Frontend
```bash
cd /srv/xperience-front

# Pull latest changes (if using git)
# git pull

# Install dependencies
npm install

# Rebuild
npm run build

# Restart with PM2
pm2 restart xperience-frontend
```

### Database Backup
```bash
# Create backup
pg_dump -U xperience_user xperience2_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -U xperience_user -d xperience2_db < backup_20231101_120000.sql
```

---

## 🎯 Quick Deployment Checklist

- [ ] VPS server updated (`apt update && apt upgrade`)
- [ ] Java 17 installed
- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and database created
- [ ] Backend JAR file in `/srv/the-xperience-back/`
- [ ] Backend systemd service created and started
- [ ] Backend environment variables configured
- [ ] Backend running on port 8080 (test with curl)
- [ ] Frontend code in `/srv/xperience-front/`
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend built (`npm run build`)
- [ ] Frontend PM2 service running
- [ ] Frontend running on port 3000
- [ ] Nginx installed and configured
- [ ] Both nginx sites enabled
- [ ] DNS records pointing to VPS IP
- [ ] SSL certificates obtained and installed
- [ ] CORS origins updated in backend
- [ ] API URL updated in frontend
- [ ] Firewall configured (ports 80, 443, 22 open)
- [ ] All services set to start on boot
- [ ] Logs verified and accessible

---

## 📞 Next Steps

1. **Follow this guide step by step**
2. **Test each service individually before moving to the next**
3. **Check logs frequently**
4. **Once everything is working, test the entire flow**:
   - Visit https://the-xperience.com
   - Try to sign in
   - Test API calls
   - Check if data loads correctly

---

## 🆘 Still Having Issues?

If you follow this guide and still have issues, check:
1. What error messages appear in logs?
2. Which service is failing? (Backend, Frontend, Nginx, Database?)
3. Are all domains pointing to the correct IP?
4. Are environment variables set correctly?

Share the specific error messages and I can help you debug further!

---

**Good luck with your deployment! 🚀**

