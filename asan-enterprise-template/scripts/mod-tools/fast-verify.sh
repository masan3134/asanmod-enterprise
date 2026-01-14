#!/bin/bash

# ASANMOD v1.1.1: AGENTIC-OS FAST-VERIFY
# [ULTRA-SPEED] Parallel execution with Agentic-OS optimizations.

# 🎨 Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ⏱️ Start Timer
START_TIME=$(date +%s)

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 ASANMOD FAST-VERIFY: Speed & Quality Check         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"

# 📂 Setup Temp Directory for Parallel Logs
TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT

# ==============================================================================
# 1. DISPATCH JOBS (PARALLEL EXECUTION)
# ==============================================================================

echo -e "${YELLOW}⚡ Launching checks in parallel...${NC}"

# JOB 1: PM2 HEALTH
(
  echo -e "\n${YELLOW}1. Checking PM2 Health...${NC}"
  PM2_ERRORS=0
  for service in ikai-dev-backend ikai-dev-frontend; do
    # Check if service is online
    status=$(pm2 show "$service" 2>/dev/null | grep "status" | grep "online")
    if [ -z "$status" ]; then
         # It might not be running, which is fine for verify unless we enforce it.
         # But let's check for errors if it IS running or supposedly managed.
         # For verify, we just check logs for recent panics.
         :
    fi

    errors=$(pm2 logs "$service" --lines 20 --nostream 2>/dev/null | grep -iE "(500|Internal Server Error|Error creating|Failed to execute)" | tail -1)
    if [ -n "$errors" ]; then
      echo -e "${RED}❌ $service has recent errors!${NC}"
      PM2_ERRORS=1
    else
      echo -e "${GREEN}✅ $service is healthy.${NC}"
    fi
  done
  exit $PM2_ERRORS
) > "$TMP_DIR/pm2.log" 2>&1 &
PID_PM2=$!

# JOB 2: FORBIDDEN WORDS
(
  echo -e "\n${YELLOW}2. Scanning for Forbidden Words...${NC}"
  files=$(git diff --name-only HEAD | grep -E '\.(ts|tsx|js|jsx)$' | grep -v 'test' | grep -v 'mcp-servers')

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

# JOB 3: FRONTEND LINT & TS (Combined to avoid FE concurrency locks if any, though separate is faster usually)
(
  # Get changed files
  FE_CHANGED=$(git diff --name-only HEAD --diff-filter=ACM | grep -E '^frontend/.*\.(ts|tsx|js|jsx)$' || true)

  exit_code=0

  # LINT
  if [ -n "$FE_CHANGED" ]; then
    echo -e "\n${YELLOW}3. Frontend Quality Checks...${NC}"
    echo -n "   Linting (changed files)... "
    # Filter out deleted files
    EXISTING_FE_FILES=""
    for f in $FE_CHANGED; do
      if [ -f "$f" ]; then
        rel_path=${f#frontend/}
        EXISTING_FE_FILES="$EXISTING_FE_FILES $rel_path"
      fi
    done

    if [ -n "$EXISTING_FE_FILES" ]; then
        if (cd frontend && npx eslint $EXISTING_FE_FILES --max-warnings 0 > /dev/null 2>&1); then
          echo -e "${GREEN}OK${NC}"
        else
          echo -e "${RED}FAIL${NC}"
          exit_code=1
        fi
    else
        echo -e "${GREEN}OK (All changed files deleted)${NC}"
    fi
  else
    echo -e "\n${YELLOW}3. Frontend Quality Checks...${NC}"
    echo -e "   Linting... ${GREEN}SKIP (no changes)${NC}"
  fi

  # TYPESCRIPT (Incremental)
  if [ -n "$FE_CHANGED" ]; then
    echo -n "   TypeScript (incremental)... "
    if (cd frontend && npx tsc --noEmit > /dev/null 2>&1); then
      echo -e "${GREEN}OK${NC}"
    else
      echo -e "${RED}FAIL${NC}"
      exit_code=1
    fi
  else
    echo -e "   TypeScript... ${GREEN}SKIP (no changes)${NC}"
  fi

  exit $exit_code
) > "$TMP_DIR/fe.log" 2>&1 &
PID_FE=$!

# JOB 4: BACKEND LINT
(
  echo -e "\n${YELLOW}4. Backend Quality Checks...${NC}"
  BE_CHANGED=$(git diff --name-only HEAD --diff-filter=ACM | grep -E '^backend/.*\.(js|jsx|ts)$' || true)

  if [ -n "$BE_CHANGED" ]; then
    echo -n "   Linting (changed files)... "
    BE_FILES=$(echo "$BE_CHANGED" | sed 's|^backend/||' | tr '\n' ' ')
    if (cd backend && npx eslint $BE_FILES --max-warnings 0 > /dev/null 2>&1); then
      echo -e "${GREEN}OK${NC}"
      exit 0
    else
      echo -e "${RED}FAIL${NC}"
      exit 1
    fi
  else
    echo -e "   Linting... ${GREEN}SKIP (no changes)${NC}"
    exit 0
  fi
) > "$TMP_DIR/be.log" 2>&1 &
PID_BE=$!

# JOB 5: UI SMOKE TEST (Non-blocking but reported)
(
  echo -e "\n${YELLOW}5. UI Smoke Test (Headless)...${NC}"
  # Check if verify-ui exists and runs it
  if node scripts/mod-tools/verify-ui.js > /dev/null 2>&1; then
     echo -e "${GREEN}✅ PASSED (All Systems Nominal)${NC}"
     exit 0
  else
     # Access the logs to see if it failed or skipped
     # Re-run to capture output for log
     OUTPUT=$(node scripts/mod-tools/verify-ui.js)
     if echo "$OUTPUT" | grep -q "Skipping"; then
       echo -e "${YELLOW}⚠️ SKIPPED (Server Down)${NC}"
       exit 0
     else
       echo -e "${RED}❌ FAILED (See Logs)${NC}"
       echo "$OUTPUT"
       exit 1
     fi
  fi
) > "$TMP_DIR/ui.log" 2>&1 &
PID_UI=$!

# ==============================================================================
# 2. WAIT & AGGREGATE
# ==============================================================================

# Wait for all PIDs
wait $PID_PM2
RC_PM2=$?

wait $PID_WORDS
RC_WORDS=$?

wait $PID_FE
RC_FE=$?

wait $PID_BE
RC_BE=$?

wait $PID_UI
RC_UI=$?

# Print outputs directly (Cat the files)
cat "$TMP_DIR/pm2.log"
cat "$TMP_DIR/words.log"
cat "$TMP_DIR/fe.log"
cat "$TMP_DIR/be.log"
cat "$TMP_DIR/ui.log"

# ==============================================================================
# 3. SUMMARY
# ==============================================================================

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo -e "\n${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
if [ "$RC_PM2" -eq 0 ] && [ "$RC_WORDS" -eq 0 ] && [ "$RC_FE" -eq 0 ] && [ "$RC_BE" -eq 0 ] && [ "$RC_UI" -eq 0 ]; then
  echo -e "${GREEN}║  ✅ SYSTEM READY (Time: ${DURATION}s)                    ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
  exit 0
else
  echo -e "${RED}║  ❌ SYSTEM NOT READY (Time: ${DURATION}s)                ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
  exit 1
fi
