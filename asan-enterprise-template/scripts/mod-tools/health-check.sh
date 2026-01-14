#!/bin/bash
# ASANMOD v2.0.1: System Health Check
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
