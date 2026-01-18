#!/bin/bash
# ASANMOD v3.1.0: SAFE DEV RESTART
# Usage: ./scripts/mod-tools/restart-dev.sh

echo "🛑 Stopping Dev Processes..."
pm2 stop app-dev 2>/dev/null || true

echo "🧹 Cleaning Ports (Zombie Slayer Lite)..."
fuser -k 3000/tcp 2>/dev/null || true

echo "🏗️  Starting Dev Environment..."
# Ensure environment variables are loaded correctly by PM2
pm2 restart ecosystem.config.cjs --only "app-dev" --update-env

echo "✅ Dev Environment Restarted."
echo "   App: http://localhost:3000"
