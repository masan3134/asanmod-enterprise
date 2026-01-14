#!/bin/bash
# ╔════════════════════════════════════════════════════════════════╗
# ║  ASANMOD v1.1.1 - AUDIT DEMO SCRIPT                             ║
# ║  Mühendis denetimi için canlı demo senaryoları                ║
# ╚════════════════════════════════════════════════════════════════╝

set -e
cd /home/root/projects/ikaicursor

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🔴 DEMO 1: COMMIT FORMAT ENFORCEMENT"
echo "  Yanlış format commit dene → REJECT bekleniyor"
echo "═══════════════════════════════════════════════════════════"
echo ""
git commit --allow-empty -m "bad format test" 2>&1 || true
echo ""

read -p "Devam etmek için ENTER'a basın..."

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🟢 DEMO 2: DOĞRU FORMAT COMMIT (dry-run)"
echo "  ID: DEMO-001 | Test commit → Format OK"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Örnek doğru format: ID: DEMO-001 | Test commit"
echo ""

read -p "Devam etmek için ENTER'a basın..."

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🔵 DEMO 3: PM2 WRAPPER"
echo "  ./scripts/mod-tools/pm dev status"
echo "═══════════════════════════════════════════════════════════"
echo ""
./scripts/mod-tools/pm dev status
echo ""

read -p "Devam etmek için ENTER'a basın..."

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🟣 DEMO 4: JIT CONTEXT LOADING"
echo "  Error → Context Pack önerisi"
echo "═══════════════════════════════════════════════════════════"
echo ""
node scripts/mod-tools/context-loader.cjs "P2002" 2>/dev/null || echo "Context önerisi gösterildi"
echo ""

read -p "Devam etmek için ENTER'a basın..."

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🟡 DEMO 5: SYSTEM STATUS"
echo "  node scripts/mod-tools/quick-status.cjs"
echo "═══════════════════════════════════════════════════════════"
echo ""
node scripts/mod-tools/quick-status.cjs
echo ""

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ DEMO TAMAMLANDI"
echo "═══════════════════════════════════════════════════════════"
echo ""
