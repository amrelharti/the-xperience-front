#!/bin/bash

# The Xperience Frontend Deployment Script
# Run this script on your VPS to deploy the frontend

set -e  # Exit on error

echo "======================================"
echo "The Xperience - Frontend Deployment"
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

echo -e "${YELLOW}Step 1: Installing Node.js and PM2...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt install -y nodejs
    echo -e "${GREEN}✓ Node.js installed${NC}"
else
    echo -e "${GREEN}✓ Node.js already installed ($(node -v))${NC}"
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo -e "${GREEN}✓ PM2 installed${NC}"
else
    echo -e "${GREEN}✓ PM2 already installed${NC}"
fi

echo ""

echo -e "${YELLOW}Step 2: Checking frontend directory...${NC}"
if [ ! -d "/srv/xperience-front" ]; then
    echo -e "${RED}Frontend directory not found at /srv/xperience-front${NC}"
    echo -e "${RED}Please upload your frontend code first!${NC}"
    exit 1
fi

cd /srv/xperience-front
echo -e "${GREEN}✓ Frontend directory found${NC}"
echo ""

echo -e "${YELLOW}Step 3: Creating environment file...${NC}"
read -p "Enter your API URL (e.g., https://api.the-xperience.com): " API_URL

cat > /srv/xperience-front/.env.production <<EOF
NEXT_PUBLIC_API_URL=$API_URL
NODE_ENV=production
PORT=3000
EOF

echo -e "${GREEN}✓ Environment file created${NC}"
echo ""

echo -e "${YELLOW}Step 4: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo -e "${YELLOW}Step 5: Building Next.js application...${NC}"
npm run build
echo -e "${GREEN}✓ Build completed${NC}"
echo ""

echo -e "${YELLOW}Step 6: Creating PM2 ecosystem file...${NC}"
cat > /srv/xperience-front/ecosystem.config.js <<'EOF'
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
EOF

echo -e "${GREEN}✓ PM2 ecosystem file created${NC}"
echo ""

echo -e "${YELLOW}Step 7: Starting frontend with PM2...${NC}"

# Stop if already running
pm2 delete xperience-frontend 2>/dev/null || true

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

echo -e "${GREEN}✓ Frontend started with PM2${NC}"
echo ""

echo -e "${YELLOW}Checking PM2 status...${NC}"
pm2 status

echo ""
echo -e "${YELLOW}Testing frontend...${NC}"
sleep 2

if curl -f http://localhost:3000 2>/dev/null > /dev/null; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ Frontend deployed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
else
    echo -e "${YELLOW}Frontend might still be starting...${NC}"
    echo -e "${YELLOW}Check logs with: pm2 logs xperience-frontend${NC}"
fi

echo ""
echo "Useful commands:"
echo "  View logs: pm2 logs xperience-frontend"
echo "  Restart: pm2 restart xperience-frontend"
echo "  Status: pm2 status"
echo "  Monitor: pm2 monit"
echo ""

