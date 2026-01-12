#!/bin/bash

# ASANMOD v5.0 - HEALTH CHECK PROTOCOL
# ID: OPS-002
# Checks if ASANMOD System (Prod/Dev) is Alive & Healthy.

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "---------------------------------------------------"
echo "🏥 ASANMOD SYSTEM HEALTH CHECK"
echo "---------------------------------------------------"
echo "Timestamp: $(date)"
echo ""

# 1. PM2 CHECK
echo "🔍 Checking PM2 Process Manager..."
if pm2 list | grep -q "online"; then
    echo -e "${GREEN}✅ PM2 is managing processes.${NC}"
    pm2 list
else
    echo -e "${RED}❌ PM2 is ERROR or EMPTY!${NC}"
fi

echo ""

# 2. PORT CHECK (Curl Ritual)
check_port() {
    local NAME=$1
    local URL=$2

    # Rule 0-CURL: -I -f -s
    if curl -I -f -s -o /dev/null "$URL"; then
        echo -e "${GREEN}✅ [OK] $NAME is listening at $URL${NC}"
    else
        echo -e "${RED}❌ [FAIL] $NAME is NOT responding at $URL${NC}"
    fi
}

# Check PROD (8205/8204)
echo "🔍 Checking PRODUCTION..."
check_port "PROD Frontend" "https://ikai.com.tr"
check_port "PROD Backend (Internal)" "http://localhost:8204/health"

echo ""

# Check DEV (3000/3001)
echo "🔍 Checking DEVELOPMENT..."
check_port "DEV Frontend" "http://localhost:3000"
check_port "DEV Backend" "http://localhost:3001/health"

echo ""

# 3. BRAIN CHECK (8250)
echo "🔍 Checking BRAIN..."
check_port "IKAI Brain" "http://localhost:8250/brain/health"

echo ""
echo "---------------------------------------------------"
echo "✅ Health Check Complete."
