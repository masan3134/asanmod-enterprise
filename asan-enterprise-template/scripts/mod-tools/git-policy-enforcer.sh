#!/bin/bash

# ASANMOD v10.0 - GIT POLICY ENFORCER
# Usage: ./git-policy-enforcer.sh <commit_message_file>
# v10: Now includes interaction guard for large changes

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1. MESSAGE FORMAT CHECK
# Regex: Starts with "ID: ", followed by Task ID (uppercase/dash), then " | ", then message.
# Example: "ID: AUTH-001 | Added login validation"
REGEX='^ID: [A-Z0-9-]+ \| .+'

if [[ ! "$COMMIT_MSG" =~ $REGEX ]]; then
    echo "❌ ASANMOD BLOCK: Invalid Commit Message Format."
    echo "Expected: ID: <TASK-ID> | <Message>"
    echo "Example: ID: AUTH-001 | Added login validation"
    echo "Consult ASANMOD_MASTER_MANUAL.md for details."
    exit 1
fi

# 2. CONTENT CHECK (Surgical Safety)
# Check for forbidden patterns in staged files.

# List staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

# Check for console.log in server code (Allow specific logger usage)
for FILE in $STAGED_FILES; do
    if [[ "$FILE" == *"src/server/"* ]] && [[ "$FILE" == *".ts" ]]; then
        if grep -q "console.log" "$FILE"; then
             echo "❌ ASANMOD BLOCK: Forbidden 'console.log' found in server file: $FILE"
             echo "Use the official Logger instead."
             exit 1
        fi
    fi
done

# 3. v10 INTERACTION GUARD
# Large changes or critical files require option selection [1-5]
if [ -f "$SCRIPT_DIR/interaction-guard.cjs" ]; then
    node "$SCRIPT_DIR/interaction-guard.cjs" check "$COMMIT_MSG_FILE"
    if [ $? -ne 0 ]; then
        exit 1
    fi
fi

# 4. v10 DECISION LOG
# Auto-archive the decision from commit message
if [ -f "$SCRIPT_DIR/decision-logger.cjs" ]; then
    node "$SCRIPT_DIR/decision-logger.cjs" log-commit "$COMMIT_MSG_FILE" 2>/dev/null || true
fi

echo "✅ ASANMOD POLICY v10: PASS"
exit 0


