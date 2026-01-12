#!/bin/bash

# ASANMOD v5.0 - ROLLBACK PROTOCOL
# ID: OPS-004
# Emergency UNDO button. Reverts git and reloads PM2.

# Colors
RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${RED}---------------------------------------------------"
echo -e "🚨 ASANMOD EMERGENCY ROLLBACK PROTOCOL"
echo -e "---------------------------------------------------${NC}"

echo "⚠️  WARNING: This will:"
echo "1. Hard reset Git to HEAD~1 (Previous Commit)"
echo "2. Force PM2 to reload Production ecosystem"
echo ""
echo -e "${YELLOW}Are you sure? (Type 'CONFIRM' to proceed)${NC}"
read -r response

if [ "$response" != "CONFIRM" ]; then
    echo "❌ Rollback aborted."
    exit 1
fi

# 1. Git Rollback
echo ""
echo "🔙 Rolling back Git..."
if git reset --hard HEAD~1; then
    echo -e "${GREEN}✅ Git reset successful.${NC}"
else
    echo -e "${RED}❌ Git reset FAILED! Manual intervention required.${NC}"
    exit 1
fi

# 2. PM2 Reload
echo ""
echo "🔄 Reloading Production Ecosystem..."
if bash scripts/mod-tools/deploy-prod.sh --skip-pull; then
    echo -e "${GREEN}✅ Production reloaded successfully.${NC}"
else
    echo -e "${RED}❌ PM2 Reload FAILED! Check logs immediately.${NC}"
    exit 1
fi

echo ""
echo "---------------------------------------------------"
echo -e "${GREEN}✅ ROLLBACK COMPLETE. System restored to previous state.${NC}"
