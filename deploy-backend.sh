#!/bin/bash

# The Xperience Backend Deployment Script
# Run this script on your VPS to deploy the backend

set -e  # Exit on error

echo "======================================"
echo "The Xperience - Backend Deployment"
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

echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
apt update
apt install -y openjdk-17-jdk postgresql postgresql-contrib

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo -e "${YELLOW}Step 2: Setting up PostgreSQL database...${NC}"
# Check if database already exists
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw xperience2_db; then
    echo -e "${YELLOW}Database already exists, skipping creation${NC}"
else
    read -p "Enter database password for xperience_user: " DB_PASSWORD
    
    sudo -u postgres psql <<EOF
CREATE DATABASE xperience2_db;
CREATE USER xperience_user WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE xperience2_db TO xperience_user;
\c xperience2_db
GRANT ALL ON SCHEMA public TO xperience_user;
EOF
    
    echo -e "${GREEN}✓ Database created${NC}"
fi
echo ""

echo -e "${YELLOW}Step 3: Creating backend directory...${NC}"
mkdir -p /srv/the-xperience-back
cd /srv/the-xperience-back

echo -e "${GREEN}✓ Directory created${NC}"
echo ""

echo -e "${YELLOW}Step 4: Creating environment file...${NC}"
if [ ! -f /srv/the-xperience-back/.env ]; then
    read -p "Enter database password: " DB_PASSWORD
    read -p "Enter Google Client ID (or press enter to use default): " GOOGLE_CLIENT_ID
    
    GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-"128297296458-8nj8i8ej0mcrq5drskb2iargscjl3s59.apps.googleusercontent.com"}
    
    cat > /srv/the-xperience-back/.env <<EOF
DATABASE_URL=jdbc:postgresql://localhost:5432/xperience2_db
DATABASE_USERNAME=xperience_user
DATABASE_PASSWORD=$DB_PASSWORD
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
EOF
    
    chmod 600 /srv/the-xperience-back/.env
    echo -e "${GREEN}✓ Environment file created${NC}"
else
    echo -e "${YELLOW}Environment file already exists${NC}"
fi
echo ""

echo -e "${YELLOW}Step 5: Creating systemd service...${NC}"

# Find JAR file in /srv/ first, then check /srv/the-xperience-back/
JAR_FILE=$(find /srv -maxdepth 1 -name "*.jar" | head -n 1)

if [ -z "$JAR_FILE" ]; then
    # Try in subdirectory
    JAR_FILE=$(find /srv/the-xperience-back -name "*.jar" | head -n 1)
fi

if [ -z "$JAR_FILE" ]; then
    echo -e "${RED}No JAR file found in /srv/ or /srv/the-xperience-back/${NC}"
    echo -e "${RED}Please upload your JAR file first!${NC}"
    echo -e "${YELLOW}Current files in /srv/:${NC}"
    ls -la /srv/
    exit 1
fi

echo -e "Found JAR file: ${GREEN}$JAR_FILE${NC}"

# If JAR is in /srv/, move it to /srv/the-xperience-back/
if [[ "$JAR_FILE" == "/srv/"*.jar ]]; then
    echo -e "${YELLOW}Moving JAR file to /srv/the-xperience-back/...${NC}"
    mv "$JAR_FILE" /srv/the-xperience-back/
    JAR_FILE="/srv/the-xperience-back/$(basename $JAR_FILE)"
    echo -e "${GREEN}✓ JAR file moved to $JAR_FILE${NC}"
fi

cat > /etc/systemd/system/xperience-backend.service <<EOF
[Unit]
Description=The Xperience Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/srv/the-xperience-back
EnvironmentFile=/srv/the-xperience-back/.env

ExecStart=/usr/bin/java -jar -Xmx512m -Xms256m $JAR_FILE

Restart=always
RestartSec=10

StandardOutput=append:/var/log/xperience-backend.log
StandardError=append:/var/log/xperience-backend-error.log

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✓ Systemd service created${NC}"
echo ""

echo -e "${YELLOW}Step 6: Starting backend service...${NC}"
systemctl daemon-reload
systemctl enable xperience-backend
systemctl restart xperience-backend

echo -e "${GREEN}✓ Backend service started${NC}"
echo ""

echo -e "${YELLOW}Checking service status...${NC}"
sleep 3
systemctl status xperience-backend --no-pager

echo ""
echo -e "${YELLOW}Testing backend health endpoint...${NC}"
sleep 2

if curl -f http://localhost:8080/actuator/health 2>/dev/null; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ Backend deployed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
else
    echo ""
    echo -e "${YELLOW}Backend might still be starting...${NC}"
    echo -e "${YELLOW}Check logs with: journalctl -u xperience-backend -f${NC}"
fi

echo ""
echo "Useful commands:"
echo "  View logs: journalctl -u xperience-backend -f"
echo "  Restart: systemctl restart xperience-backend"
echo "  Status: systemctl status xperience-backend"
echo ""

