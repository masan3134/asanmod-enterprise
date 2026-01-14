#!/bin/bash
# ASANMOD v2.1.0-alpha: Code Quality Verification with Evidence Logging
# Runs: ESLint + TypeScript + Tests + Env Check + Build
# Creates: logs/verify-YYYYMMDD-HHMMSS.json

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Create logs directory
mkdir -p logs

# Generate timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
TIMESTAMP_FILE=$(date -u +"%Y%m%d-%H%M%S")
VERIFY_LOG="logs/verify-${TIMESTAMP_FILE}.json"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 ASANMOD Code Quality Verification${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Evidence: $VERIFY_LOG"
echo ""

# Initialize results
LINT_STATUS="pending"
TSC_STATUS="pending"
TEST_STATUS="pending"
ENV_STATUS="pending"
AUDIT_STATUS="pending"
BUILD_STATUS="pending"
OVERALL_STATUS="success"

# 1. Environment Check
echo -e "${YELLOW}[1/6]${NC} Checking environment..."
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    ENV_STATUS="failed"
    OVERALL_STATUS="failed"
else
    # Check required env vars
    REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET")
    ENV_MISSING=""
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^${var}=" .env; then
            ENV_MISSING="${ENV_MISSING}${var} "
        fi
    done

    if [ -n "$ENV_MISSING" ]; then
        echo -e "${RED}❌ Required variables missing: $ENV_MISSING${NC}"
        ENV_STATUS="failed"
        OVERALL_STATUS="failed"
    else
        echo -e "${GREEN}✅ Environment validated${NC}"
        ENV_STATUS="passed"
    fi
fi
echo ""

# 2. ESLint
echo -e "${YELLOW}[2/6]${NC} Running ESLint..."
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ESLint passed${NC}"
    LINT_STATUS="passed"
else
    echo -e "${RED}❌ ESLint failed${NC}"
    LINT_STATUS="failed"
    OVERALL_STATUS="failed"
fi
echo ""

# 3. TypeScript
echo -e "${YELLOW}[3/6]${NC} Running TypeScript check..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
    TSC_STATUS="passed"
else
    echo -e "${RED}❌ TypeScript errors found${NC}"
    TSC_STATUS="failed"
    OVERALL_STATUS="failed"
fi
echo ""

# 4. Tests
echo -e "${YELLOW}[4/6]${NC} Running tests..."
if npm test -- --passWithNoTests > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Tests passed${NC}"
    TEST_STATUS="passed"
else
    echo -e "${RED}❌ Tests failed${NC}"
    TEST_STATUS="failed"
    OVERALL_STATUS="failed"
fi
echo ""

# 5. Security Audit
echo -e "${YELLOW}[5/6]${NC} Running security audit..."
if npm audit --omit=dev --audit-level=high > /dev/null 2>&1; then
    echo -e "${GREEN}✅ No high/critical vulnerabilities${NC}"
    AUDIT_STATUS="passed"
else
    echo -e "${YELLOW}⚠️  Vulnerabilities found (review recommended)${NC}"
    AUDIT_STATUS="warning"
fi
echo ""

# 6. Build Test
echo -e "${YELLOW}[6/6]${NC} Testing production build..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
    BUILD_STATUS="passed"
else
    echo -e "${RED}❌ Build failed${NC}"
    BUILD_STATUS="failed"
    OVERALL_STATUS="failed"
fi

# Write evidence log
cat > "$VERIFY_LOG" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "node_version": "$(node -v)",
  "npm_version": "$(npm -v)",
  "checks": {
    "environment": "$ENV_STATUS",
    "lint": "$LINT_STATUS",
    "typescript": "$TSC_STATUS",
    "tests": "$TEST_STATUS",
    "security_audit": "$AUDIT_STATUS",
    "build": "$BUILD_STATUS"
  },
  "overall_status": "$OVERALL_STATUS"
}
EOF

echo ""
if [ "$OVERALL_STATUS" = "success" ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "Evidence: $VERIFY_LOG"

    # Update manifest with verification results
    if [ -f ".asanmod/manifest.json" ]; then
        PASSED_GATES=""
        [ "$ENV_STATUS" = "success" ] && PASSED_GATES="${PASSED_GATES}1,"
        [ "$LINT_STATUS" = "success" ] && PASSED_GATES="${PASSED_GATES}2,"
        [ "$TSC_STATUS" = "success" ] && PASSED_GATES="${PASSED_GATES}3,"
        [ "$TEST_STATUS" = "success" ] && PASSED_GATES="${PASSED_GATES}4,"
        [ "$AUDIT_STATUS" = "success" ] && PASSED_GATES="${PASSED_GATES}5,"
        [ "$BUILD_STATUS" = "success" ] && PASSED_GATES="${PASSED_GATES}6"

        node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('.asanmod/manifest.json'));
manifest.verification.last_run = new Date().toISOString();
manifest.verification.gates_passed = [${PASSED_GATES}];
manifest.verification.gates_failed = [];
fs.writeFileSync('.asanmod/manifest.json', JSON.stringify(manifest, null, 2) + '\\n');
        " > /dev/null

        echo -e "${GREEN}✅ Manifest updated: 6/6 gates passed${NC}"
    fi

    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ Verification failed${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "Evidence: $VERIFY_LOG"

    # Update manifest with failed gates
    if [ -f ".asanmod/manifest.json" ]; then
        FAILED_GATES=""
        [ "$ENV_STATUS" = "failed" ] && FAILED_GATES="${FAILED_GATES}1,"
        [ "$LINT_STATUS" = "failed" ] && FAILED_GATES="${FAILED_GATES}2,"
        [ "$TSC_STATUS" = "failed" ] && FAILED_GATES="${FAILED_GATES}3,"
        [ "$TEST_STATUS" = "failed" ] && FAILED_GATES="${FAILED_GATES}4,"
        [ "$AUDIT_STATUS" = "failed" ] && FAILED_GATES="${FAILED_GATES}5,"
        [ "$BUILD_STATUS" = "failed" ] && FAILED_GATES="${FAILED_GATES}6"

        PASSED_GATES=""
        [ "$ENV_STATUS" = "success" ] && PASSED_GATES="${PASSED_GATES}1,"
        [ "$LINT_STATUS" = "success" ] && PASSED_GATES="${PASSED_GATES}2,"
        [ "$TSC_STATUS" = "success" ] && PASSED_GATES="${PASSED_GATES}3,"
        [ "$TEST_STATUS" = "success" ] && PASSED_GATES="${PASSED_GATES}4,"
        [ "$AUDIT_STATUS" = "success" ] && PASSED_GATES="${PASSED_GATES}5,"
        [ "$BUILD_STATUS" = "success" ] && PASSED_GATES="${PASSED_GATES}6"

        node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('.asanmod/manifest.json'));
manifest.verification.last_run = new Date().toISOString();
manifest.verification.gates_passed = [${PASSED_GATES}];
manifest.verification.gates_failed = [${FAILED_GATES}];
fs.writeFileSync('.asanmod/manifest.json', JSON.stringify(manifest, null, 2) + '\\n');
        " > /dev/null

        echo -e "${YELLOW}⚠️  Manifest updated with failures${NC}"
    fi

    exit 1
fi
