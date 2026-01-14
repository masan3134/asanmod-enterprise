#!/bin/bash
# ASANMOD v2.1.0-alpha: System Health Check
# Checks dev and prod servers

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏥 ASANMOD System Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Timestamp: $(date)"
echo ""

# Check PM2
echo "🔍 Checking PM2..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "online"; then
        echo -e "${GREEN}✅ PM2 is running${NC}"
        pm2 list
    else
        echo -e "${YELLOW}⚠️  PM2 running but no processes online${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  PM2 not installed${NC}"
fi

echo ""

# Check ports
echo "🔍 Checking application ports..."

check_port() {
    local port=$1
    local name=$2

    if curl -f http://localhost:$port > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name (port $port) - OK${NC}"
        return 0
    else
        echo -e "${RED}❌ $name (port $port) - FAILED${NC}"
        return 1
    fi
}

# Development
check_port 3000 "Dev Frontend"

# Production
check_port 3002 "Prod Frontend"

echo ""

# Check database
echo "🔍 Checking database connection..."
if [ -f ".env" ]; then
    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}✅ DATABASE_URL configured${NC}"
    else
        echo -e "${RED}❌ DATABASE_URL not found in .env${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Health check complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Update manifest.json with results
if [ -f ".asanmod/manifest.json" ]; then
    DEV_STATUS="stopped"
    PROD_STATUS="stopped"
    DB_STATUS="unknown"

    curl -f http://localhost:3000 > /dev/null 2>&1 && DEV_STATUS="running"
    curl -f http://localhost:3002 > /dev/null 2>&1 && PROD_STATUS="running"
    grep -q "DATABASE_URL" .env 2>/dev/null && DB_STATUS="configured"

    node scripts/mod-tools/manifest-update.cjs health dev_server "$DEV_STATUS" > /dev/null
    node scripts/mod-tools/manifest-update.cjs health prod_server "$PROD_STATUS" > /dev/null
    node scripts/mod-tools/manifest-update.cjs health db_connection "$DB_STATUS" > /dev/null

    echo -e "${GREEN}✅ Manifest updated${NC}"
fi
