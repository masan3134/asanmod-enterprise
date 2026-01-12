/**
 * VALIDATE V10 CONFIGURATION integrity
 * Usage: node scripts/mod-tools/validate-v10-config.cjs
 */
const loader = require('./config-loader.cjs');
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  yellow: '\x1b[33m'
};

console.log(`${colors.yellow}🔍 ASANMOD v1.0.0: Configuration Integrity Check${colors.reset}\n`);

const v10 = loader.loadV10();
const legacy = loader.loadLegacy();

if (!v10) {
  console.error(`${colors.red}❌ FATAL: v1.0.0 Config not found or invalid!${colors.reset}`);
  process.exit(1);
}

if (!legacy) {
  console.error(`${colors.red}❌ FATAL: Legacy Config not found! Cannot verify consistency.${colors.reset}`);
  process.exit(1);
}

let errors = 0;

function check(label, v10Val, legacyVal) {
  if (v10Val != legacyVal) { // loose equality for string/number diffs
    console.log(`${colors.red}❌ [FAIL] ${label}${colors.reset}`);
    console.log(`   Expected (Legacy): ${legacyVal}`);
    console.log(`   Actual   (v10)   : ${v10Val}`);
    errors++;
  } else {
    console.log(`${colors.green}✅ [PASS] ${label}${colors.reset}`);
  }
}

// 1. Check Infrastructure Ports
console.log("--- Infrastructure --");
check("Frontend DEV Port", v10.normalized.network.dev.frontend, legacy.config.network.dev.frontend);
check("Backend DEV Port", v10.normalized.network.dev.backend, legacy.config.network.dev.backend);
check("Frontend PROD Port", v10.normalized.network.prod.frontend, legacy.config.network.prod.frontend);
check("Binding PROD", v10.normalized.network.prod.binding, legacy.config.network.prod.binding);

// 2. Check Secrets (from ENV)
console.log("\n--- Secrets Extraction --");
check("SuperAdmin Email", v10.normalized.credentials.dev.superAdmin.email, legacy.config.credentials.dev.superAdmin.email);
check("Redis Password", v10.normalized.credentials.services.redis.password, legacy.config.credentials.services.redis.password);

// 3. Check Protocol Rules
console.log("\n--- Protocol Rules --");
check("Console Log Ban", v10.config.constraints.consoleLogBan.enabled, true); // Assuming mapped correctly
check("State TTL", v10.config.constraints.stateTtlMinutes, legacy.config.constraints.stateTTL.minutes);

console.log("\n" + "=".repeat(40));
if (errors === 0) {
  console.log(`${colors.green}🎉 SUCCESS: v1.0.0 Configuration Match 100% with Legacy${colors.reset}`);
  console.log("ASANMOD SaaS Template Abstraction is ready for Phase 3.");
} else {
  console.log(`${colors.red}💀 FAILURE: Found ${errors} inconsistencies.${colors.reset}`);
  process.exit(1);
}
