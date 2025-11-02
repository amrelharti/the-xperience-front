#!/bin/bash

# The Xperience Nginx Setup Script - Subdomain Version
# This sets up: app.the-xperience.com and api.the-xperience.com
# Leaving the-xperience.com for your landing page on Hostinger

set -e  # Exit on error

echo "======================================================="
echo "The Xperience - Nginx Configuration (Subdomain Setup)"
echo "======================================================="
echo ""
echo "This will configure:"
echo "  - app.the-xperience.com  → Your LMS (Next.js)"
echo "  - api.the-xperience.com  → Your Backend API"
echo "  - the-xperience.com      → Keeps your landing page"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt update
    apt install -y nginx
    echo -e "${GREEN}✓ Nginx installed${NC}"
else
    echo -e "${GREEN}✓ Nginx already installed${NC}"
fi
echo ""

echo -e "${YELLOW}Step 2: Creating Nginx configuration for API (api.the-xperience.com)...${NC}"

cat > /etc/nginx/sites-available/api.the-xperience.com <<'EOF'
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
EOF

echo -e "${GREEN}✓ API configuration created${NC}"
echo ""

echo -e "${YELLOW}Step 3: Creating Nginx configuration for LMS App (app.the-xperience.com)...${NC}"

cat > /etc/nginx/sites-available/app.the-xperience.com <<'EOF'
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
EOF

echo -e "${GREEN}✓ LMS App configuration created${NC}"
echo ""

echo -e "${YELLOW}Step 4: Enabling sites...${NC}"

# Remove default site if exists
rm -f /etc/nginx/sites-enabled/default

# Enable API site
ln -sf /etc/nginx/sites-available/api.the-xperience.com /etc/nginx/sites-enabled/

# Enable LMS app site
ln -sf /etc/nginx/sites-available/app.the-xperience.com /etc/nginx/sites-enabled/

echo -e "${GREEN}✓ Sites enabled${NC}"
echo ""

echo -e "${YELLOW}Step 5: Testing Nginx configuration...${NC}"
nginx -t

echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
echo ""

echo -e "${YELLOW}Step 6: Restarting Nginx...${NC}"
systemctl restart nginx
systemctl enable nginx

echo -e "${GREEN}✓ Nginx restarted${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Nginx configured successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo -e "${YELLOW}Important: Configure your DNS:${NC}"
echo "  A Record: app → Your VPS IP"
echo "  A Record: api → Your VPS IP"
echo ""
echo -e "${YELLOW}Note: Your landing page (the-xperience.com) stays on Hostinger${NC}"
echo ""

echo -e "${YELLOW}Next step: Setup SSL certificates${NC}"
echo ""
read -p "Do you want to setup SSL certificates now? (y/n): " SETUP_SSL

if [ "$SETUP_SSL" = "y" ] || [ "$SETUP_SSL" = "Y" ]; then
    echo ""
    echo -e "${YELLOW}Installing Certbot...${NC}"
    apt install -y certbot python3-certbot-nginx
    
    echo ""
    echo -e "${YELLOW}Obtaining SSL certificate for LMS app (app.the-xperience.com)...${NC}"
    certbot --nginx -d app.the-xperience.com
    
    echo ""
    echo -e "${YELLOW}Obtaining SSL certificate for API (api.the-xperience.com)...${NC}"
    certbot --nginx -d api.the-xperience.com
    
    echo -e "${GREEN}✓ SSL certificates installed${NC}"
    echo ""
    echo "Certbot will automatically renew certificates."
    echo "Test renewal with: certbot renew --dry-run"
else
    echo ""
    echo "To setup SSL later, run:"
    echo "  apt install -y certbot python3-certbot-nginx"
    echo "  certbot --nginx -d app.the-xperience.com"
    echo "  certbot --nginx -d api.the-xperience.com"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Configuration Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Your setup:"
echo "  Landing Page: https://the-xperience.com (Hostinger)"
echo "  LMS App:      https://app.the-xperience.com (VPS)"
echo "  Backend API:  https://api.the-xperience.com (VPS)"
echo ""
echo "Next steps:"
echo "  1. Make sure DNS is configured (A records for app and api)"
echo "  2. Update your backend CORS in application.properties:"
echo "     app.allowed-origins=https://app.the-xperience.com,https://api.the-xperience.com"
echo "  3. Update your frontend API URL in .env.production:"
echo "     NEXT_PUBLIC_API_URL=https://api.the-xperience.com"
echo "  4. Rebuild frontend: cd /srv/xperience-front && npm run build && pm2 restart xperience-frontend"
echo "  5. Restart backend: systemctl restart xperience-backend"
echo "  6. Add link on landing page to https://app.the-xperience.com"
echo ""
echo "Useful commands:"
echo "  Test config: nginx -t"
echo "  Reload: systemctl reload nginx"
echo "  Status: systemctl status nginx"
echo "  View logs: tail -f /var/log/nginx/*.log"
echo ""

