#!/bin/bash
# ASANMOD v1.1.1: SAFE DEV RESTART
# Usage: ./scripts/mod-tools/restart-dev.sh

echo "🛑 Stopping Dev Processes..."
pm2 stop ikai-dev-frontend ikai-dev-backend

echo "🧹 Cleaning Ports (Zombie Slayer Lite)..."
fuser -k 3000/tcp || true
fuser -k 3001/tcp || true

echo "🏗️  Starting Dev Environment..."
# Ensure environment variables are loaded correctly by PM2
pm2 restart ecosystem.config.cjs --only "ikai-dev-frontend,ikai-dev-backend" --update-env

echo "✅ Dev Environment Restarted."
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
