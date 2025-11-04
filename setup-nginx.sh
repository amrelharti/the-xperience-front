#!/bin/bash

# The Xperience Nginx Setup Script
# Run this script on your VPS to configure Nginx

set -e  # Exit on error

echo "======================================"
echo "The Xperience - Nginx Configuration"
echo "======================================"
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

echo -e "${YELLOW}Step 2: Getting domain information...${NC}"
read -p "Enter your frontend domain (e.g., the-xperience.com): " FRONTEND_DOMAIN
read -p "Enter your API domain (e.g., api.the-xperience.com): " API_DOMAIN

echo ""
echo -e "${YELLOW}Step 3: Creating Nginx configuration for API...${NC}"

cat > /etc/nginx/sites-available/$API_DOMAIN <<EOF
server {
    listen 80;
    server_name $API_DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Increased buffer sizes for large requests
    client_max_body_size 100M;
    client_body_buffer_size 128k;

    # Logging
    access_log /var/log/nginx/$API_DOMAIN.access.log;
    error_log /var/log/nginx/$API_DOMAIN.error.log;

    # Proxy to Spring Boot backend
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

echo -e "${GREEN}✓ API configuration created${NC}"
echo ""

echo -e "${YELLOW}Step 4: Creating Nginx configuration for Frontend...${NC}"

cat > /etc/nginx/sites-available/$FRONTEND_DOMAIN <<EOF
server {
    listen 80;
    server_name $FRONTEND_DOMAIN www.$FRONTEND_DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/$FRONTEND_DOMAIN.access.log;
    error_log /var/log/nginx/$FRONTEND_DOMAIN.error.log;

    # Proxy to Next.js frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files optimization
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        proxy_cache_bypass \$http_pragma \$http_authorization;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
EOF

echo -e "${GREEN}✓ Frontend configuration created${NC}"
echo ""

echo -e "${YELLOW}Step 5: Enabling sites...${NC}"

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Enable API site
ln -sf /etc/nginx/sites-available/$API_DOMAIN /etc/nginx/sites-enabled/

# Enable frontend site
ln -sf /etc/nginx/sites-available/$FRONTEND_DOMAIN /etc/nginx/sites-enabled/

echo -e "${GREEN}✓ Sites enabled${NC}"
echo ""

echo -e "${YELLOW}Step 6: Testing Nginx configuration...${NC}"
nginx -t

echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
echo ""

echo -e "${YELLOW}Step 7: Restarting Nginx...${NC}"
systemctl restart nginx
systemctl enable nginx

echo -e "${GREEN}✓ Nginx restarted${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Nginx configured successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo -e "${YELLOW}Important: Make sure your DNS is configured:${NC}"
echo "  A Record: $FRONTEND_DOMAIN → Your VPS IP"
echo "  A Record: www.$FRONTEND_DOMAIN → Your VPS IP"
echo "  A Record: $API_DOMAIN → Your VPS IP"
echo ""

echo -e "${YELLOW}Next step: Setup SSL certificates${NC}"
echo ""
read -p "Do you want to setup SSL certificates now? (y/n): " SETUP_SSL

if [ "$SETUP_SSL" = "y" ] || [ "$SETUP_SSL" = "Y" ]; then
    echo ""
    echo -e "${YELLOW}Installing Certbot...${NC}"
    apt install -y certbot python3-certbot-nginx
    
    echo ""
    echo -e "${YELLOW}Obtaining SSL certificate for frontend...${NC}"
    certbot --nginx -d $FRONTEND_DOMAIN -d www.$FRONTEND_DOMAIN
    
    echo ""
    echo -e "${YELLOW}Obtaining SSL certificate for API...${NC}"
    certbot --nginx -d $API_DOMAIN
    
    echo -e "${GREEN}✓ SSL certificates installed${NC}"
    echo ""
    echo "Certbot will automatically renew certificates."
    echo "Test renewal with: certbot renew --dry-run"
else
    echo ""
    echo "To setup SSL later, run:"
    echo "  certbot --nginx -d $FRONTEND_DOMAIN -d www.$FRONTEND_DOMAIN"
    echo "  certbot --nginx -d $API_DOMAIN"
fi

echo ""
echo "Useful commands:"
echo "  Test config: nginx -t"
echo "  Reload: systemctl reload nginx"
echo "  Status: systemctl status nginx"
echo "  View logs: tail -f /var/log/nginx/*.log"
echo ""

