#!/bin/bash
# ASANMOD v2.0.1: Single-Command Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/masan3134/asanmod-enterprise/main/install.sh | bash

set -e

PROJECT_NAME="${1:-my-app}"

echo "🚀 ASANMOD v2.0.1: Enterprise Template Installer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Clone repository
echo "📦 Cloning template..."
git clone https://github.com/masan3134/asanmod-enterprise.git "$PROJECT_NAME"
cd "$PROJECT_NAME/asan-enterprise-template"

# Step 2: Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Step 3: Run wizard
echo ""
echo "🧙 Running setup wizard..."
npm run wizard

# Step 4: Success message
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ASANMOD Template installed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📂 Project location: $(pwd)"
echo ""
echo "📋 Next steps:"
echo "   1. cd $PROJECT_NAME/asan-enterprise-template"
echo "   2. Update .env with your DATABASE_URL"
echo "   3. npm run db:push"
echo "   4. npm run seed (optional)"
echo "   5. npm run dev"
echo ""
echo "📚 Documentation: README.md & docs/GETTING_STARTED.md"
echo "🤖 Agent Protocol: GEMINI.md (or CURSOR.md / CLAUDE.md)"
echo ""
echo "🎯 ASANMOD v2.0.1 - Production Ready"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
