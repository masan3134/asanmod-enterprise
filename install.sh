#!/bin/bash
# ASANMOD v1.0.0: Single-Command Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/USER/REPO/main/install.sh | bash

set -e

PROJECT_NAME="${1:-asan-factory}"

echo "🚀 ASANMOD v1.0.0: Enterprise Template Installer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Clone repository
echo "📦 Cloning template..."
git clone https://github.com/masan3134/ikaicursor.git "$PROJECT_NAME"
cd "$PROJECT_NAME/packages/asan-enterprise-template"

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 3: Initialize project
echo "⚙️  Initializing project..."
node scripts/mod-tools/asan-init.js

# Step 4: Success message
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ASANMOD Template installed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📂 Project location: $(pwd)"
echo ""
echo "📋 Next steps:"
echo "   1. cd $PROJECT_NAME/packages/asan-enterprise-template"
echo "   2. Edit .env and set DATABASE_URL"
echo "   3. cat docs/GHOST_DEV_PROTOCOL.md"
echo "   4. node scripts/mod-tools/asan-wizard.js"
echo ""
echo "🧙‍♂️ Ghost-Dev Protocol Active"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
