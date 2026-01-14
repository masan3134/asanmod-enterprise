#!/bin/bash
# ASANMOD v2.0.1: Code Quality Verification
# Runs: ESLint + TypeScript + Build Check

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 ASANMOD Code Quality Verification${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. ESLint
echo -e "${YELLOW}[1/3]${NC} Running ESLint..."
if npm run lint; then
    echo -e "${GREEN}✅ ESLint passed${NC}"
else
    echo -e "${RED}❌ ESLint failed${NC}"
    exit 1
fi

echo ""

# 2. TypeScript
echo -e "${YELLOW}[2/3]${NC} Running TypeScript check..."
if npx tsc --noEmit; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
else
    echo -e "${RED}❌ TypeScript errors found${NC}"
    exit 1
fi

echo ""

# 3. Build Test
echo -e "${YELLOW}[3/3]${NC} Testing production build..."
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All checks passed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
