#!/bin/bash

# ASANMOD v1.0.0: TEMPLATE FAST-VERIFY
# Optimized for Next.js 15 Monolithic Structure

# 🎨 Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ⏱️ Start Timer
START_TIME=$(date +%s)

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 ASAN-VERIFY: Speed & Quality Check                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"

# 📂 Setup Temp Directory for Parallel Logs
TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT

# ==============================================================================
# 1. DISPATCH JOBS (PARALLEL EXECUTION)
# ==============================================================================

echo -e "${YELLOW}⚡ Launching checks in parallel...${NC}"

# JOB 1: ASANMOD CONFIG VALIDATION
(
  echo -e "\n${YELLOW}1. Validating ASANMOD Config...${NC}"
  if [ -f "asanmod.config.json" ]; then
    echo -e "${GREEN}✅ asanmod.config.json found.${NC}"
    exit 0
  else
    echo -e "${RED}❌ asanmod.config.json MISSING!${NC}"
    exit 1
  fi
) > "$TMP_DIR/config.log" 2>&1 &
PID_CONFIG=$!

# JOB 2: FORBIDDEN WORDS (Across all src)
(
  echo -e "\n${YELLOW}2. Scanning for Forbidden Words...${NC}"
  # Check staged or modified files
  files=$(git diff --name-only HEAD | grep -E '\.(ts|tsx|js|jsx)$' | grep -v 'mcp-servers')

  if [ -n "$files" ]; then
    forbidden=$(echo "$files" | xargs grep -E "(TODO|FIXME|mock|dummy)" 2>/dev/null)
    if [ -n "$forbidden" ]; then
      echo -e "${RED}❌ Forbidden words found:${NC}"
      echo "$forbidden" | head -5
      exit 1
    else
      echo -e "${GREEN}✅ No forbidden words found.${NC}"
      exit 0
    fi
  else
    echo -e "${GREEN}✅ No modified files to check.${NC}"
    exit 0
  fi
) > "$TMP_DIR/words.log" 2>&1 &
PID_WORDS=$!

# JOB 3: ESLINT (Monolithic)
(
  echo -e "\n${YELLOW}3. ESLint Check...${NC}"
  if [ -f "package.json" ]; then
     if npx eslint . --max-warnings 0 > /dev/null 2>&1; then
       echo -e "${GREEN}✅ ESLint Passed.${NC}"
       exit 0
     else
       echo -e "${RED}❌ ESLint Failed.${NC}"
       exit 1
     fi
  else
    echo -e "${YELLOW}⚠️ No package.json found.${NC}"
    exit 0
  fi
) > "$TMP_DIR/lint.log" 2>&1 &
PID_LINT=$!

# JOB 4: TYPESCRIPT (Monolithic)
(
  echo -e "\n${YELLOW}4. TypeScript Check...${NC}"
  if [ -f "tsconfig.json" ]; then
     if npx tsc --noEmit > /dev/null 2>&1; then
       echo -e "${GREEN}✅ TSC Passed.${NC}"
       exit 0
     else
       echo -e "${RED}❌ TSC Failed.${NC}"
       exit 1
     fi
  else
    echo -e "${YELLOW}⚠️ No tsconfig.json found.${NC}"
    exit 0
  fi
) > "$TMP_DIR/tsc.log" 2>&1 &
PID_TSC=$!

# ==============================================================================
# 2. WAIT & AGGREGATE
# ==============================================================================

wait $PID_CONFIG
RC_CONFIG=$?

wait $PID_WORDS
RC_WORDS=$?

wait $PID_LINT
RC_LINT=$?

wait $PID_TSC
RC_TSC=$?

# Print outputs
cat "$TMP_DIR/config.log"
cat "$TMP_DIR/words.log"
cat "$TMP_DIR/lint.log"
cat "$TMP_DIR/tsc.log"

# ==============================================================================
# 3. SUMMARY
# ==============================================================================

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo -e "\n${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
if [ "$RC_CONFIG" -eq 0 ] && [ "$RC_WORDS" -eq 0 ] && [ "$RC_LINT" -eq 0 ] && [ "$RC_TSC" -eq 0 ]; then
  echo -e "${GREEN}║  ✅ SYSTEM READY (Time: ${DURATION}s)                    ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
  exit 0
else
  echo -e "${RED}║  ❌ SYSTEM NOT READY (Time: ${DURATION}s)                ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
  exit 1
fi
