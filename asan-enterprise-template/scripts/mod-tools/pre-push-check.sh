#!/bin/bash

# ASANMOD v1.1.1: PRE-PUSH GUARD
# Limits direct pushes to PROD and enforces last-minute verification.

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

current_branch=$(git rev-parse --abbrev-ref HEAD)

# 1. Block Direct Push to Main/Prod
if [[ "$current_branch" == "main" || "$current_branch" == "prod" || "$current_branch" == "production" ]]; then
  echo -e "${RED}🛑 CRITICAL: Direct push to '$current_branch' is FORBIDDEN.${NC}"
  echo -e "${YELLOW}👉 Use Pull Requests or './scripts/mod-tools/deploy-prod.sh' for releases.${NC}"
  exit 1
fi

# 2. Run Fast Verify
echo "🔍 Running Pre-Push Verification..."
npm run verify

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Verification failed. Fix issues before pushing.${NC}"
    exit 1
fi

exit 0
