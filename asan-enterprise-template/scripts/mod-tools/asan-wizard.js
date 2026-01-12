#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 🧙‍♂️ ASANMOD v1.0.0: Zero-Manual Wizard
 * Handles the "Ghost-Dev" initialization phase.
 */

const PROJECT_ROOT = process.cwd();

async function runWizard() {
  console.log("\x1b[36m%s\x1b[0m", "\n🛡️  ASANMOD v1.0.0: Ghost-Dev Otonom Kurulum Protokolü");
  console.log("------------------------------------------------------------");

  const payloadQuestions = [
    "1. İSİM & KİMLİK: Projenin ticari adı ve sloganı nedir?",
    "2. PROBLEM & ÇÖZÜM: Bu SaaS hangi sorunu çözüyor? Ana değer önermesi nedir?",
    "3. KRİTİK AKIŞ: Bir kullanıcının yapacağı en temel 3-5 adım nedir?",
    "4. VERİ VARLIKLARI (ENTITIES): Sistemde neleri (Tablo bazlı) takip etmeliyiz?",
    "5. PARA AKIŞI: Ödeme sistemi/Abonelik olacak mı?",
    "6. DIŞ DÜNYA: Mail, Dosya, SMS gibi servis ihtiyaçları var mı?",
    "7. GÖRSEL VİBE: Tasarım tonu nasıl olmalı? (Modern, Kurumsal, Minimal?)"
  ];

  console.log("\n💬 [GHOST-DEV]: Efendim, projeyi başlatmak için mülakat dökümünü bekliyorum:\n");
  payloadQuestions.forEach(q => console.log(`   \x1b[33m${q}\x1b[0m`));

  console.log("\n------------------------------------------------------------");
  console.log("🚀 AGENT BU BİLGİLERLE ŞUNLARI OTONOM YERLEŞTİRECEK:");
  console.log("   ✅ src/db/schema.ts (Drizzle Entities)");
  console.log("   ✅ src/server/ (tRPC Routers & Business Logic)");
  console.log("   ✅ src/app/ (Shadcn/UI & Responsive Pages)");
  console.log("   ✅ .env & asanmod.config.json (System Hardened)");
  console.log("   ✅ initialized.lock (ASANMOD Sealed)");
}

// Helper: Config güncelleme
function patchConfig(updates) {
  const configPath = path.join(PROJECT_ROOT, 'asanmod.config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const patched = { ...config, ...updates };
  fs.writeFileSync(configPath, JSON.stringify(patched, null, 2));
}

// Helper: Initialized Lock
function createLock() {
  const lockDir = path.join(PROJECT_ROOT, '.asanmod/state');
  if (!fs.existsSync(lockDir)) fs.mkdirSync(lockDir, { recursive: true });
  fs.writeFileSync(path.join(lockDir, 'initialized.lock'), JSON.stringify({
    initializedAt: new Date().toISOString(),
    protocol: "Ghost-Dev v1.0.0"
  }, null, 2));
}

if (require.main === module) {
  runWizard();
}

module.exports = { patchConfig, createLock };
