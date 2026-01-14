/**
 * ═══════════════════════════════════════════════════════════════════
 * ASANMOD v1.1.1: ENVIRONMENT HELPER
 * ═══════════════════════════════════════════════════════════════════
 *
 * Single source of truth for ports, paths, and environment config.
 * All scripts should import from here instead of hardcoding values.
 *
 * Usage:
 *   const env = require('./env-helper.cjs');
 *   console.log(env.port('backend', 'prod')); // 8204
 *   console.log(env.port('frontend', 'dev')); // 3000
 *   console.log(env.paths.scripts); // /home/root/projects/ikaicursor/scripts/mod-tools/
 */

const fs = require("fs");
const path = require("path");

// Load core config
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const CORE_CONFIG_PATH = path.join(PROJECT_ROOT, "docs/asanmod-core.json");

let coreConfig;
try {
  coreConfig = JSON.parse(fs.readFileSync(CORE_CONFIG_PATH, "utf8"));
} catch (err) {
  console.error("❌ ASANMOD: Failed to load asanmod-core.json");
  console.error("   Path:", CORE_CONFIG_PATH);
  process.exit(1);
}

/**
 * Get port for a service
 * @param {'frontend'|'backend'|'brain'} service
 * @param {'dev'|'prod'} env
 * @returns {number}
 */
function port(service, env = "dev") {
  const envConfig = coreConfig.network[env];
  if (!envConfig) {
    throw new Error(`Unknown environment: ${env}`);
  }
  const p = envConfig[service];
  if (!p) {
    throw new Error(`Unknown service: ${service} for env: ${env}`);
  }
  return p;
}

/**
 * Get PM2 service name
 * @param {'frontend'|'backend'|'brain'} service
 * @param {'dev'|'prod'} env
 * @returns {string}
 */
function pm2Name(service, env = "dev") {
  const names = {
    "dev-frontend": "ikai-dev-frontend",
    "dev-backend": "ikai-dev-backend",
    "prod-frontend": "ikai-prod-frontend",
    "prod-backend": "ikai-prod-backend",
    "prod-brain": "ikai-brain",
  };
  const key = `${env}-${service}`;
  const name = names[key];
  if (!name) {
    throw new Error(`Unknown service: ${service} for env: ${env}`);
  }
  return name;
}

/**
 * Get database URL
 * @param {'dev'|'prod'} env
 * @returns {string}
 */
function databaseUrl(env = "dev") {
  const dbName = env === "prod" ? "ikai_prod_db" : "ikai_dev_db";
  return `postgresql://ikaiuser:ikaipass2025@localhost:5432/${dbName}?timezone=Europe/Istanbul`;
}

/**
 * Check if current environment is production
 * @returns {boolean}
 */
function isProduction() {
  return (
    process.env.NODE_ENV === "production" || process.env.IKAI_ENV === "prod"
  );
}

/**
 * Get current environment
 * @returns {'dev'|'prod'}
 */
function currentEnv() {
  return isProduction() ? "prod" : "dev";
}

// Export everything
module.exports = {
  // Core config
  version: coreConfig.version,
  name: coreConfig.name,

  // Paths
  paths: {
    root: PROJECT_ROOT,
    scripts: path.join(PROJECT_ROOT, "scripts/mod-tools"),
    docs: path.join(PROJECT_ROOT, "docs"),
    backend: path.join(PROJECT_ROOT, "backend"),
    frontend: path.join(PROJECT_ROOT, "frontend"),
    state: path.join(PROJECT_ROOT, ".state"),
    coreConfig: CORE_CONFIG_PATH,
  },

  // Network
  port,
  pm2Name,
  binding: coreConfig.network.prod.binding || "127.0.0.1",

  // Database
  databaseUrl,
  redis: {
    dev: "redis://localhost:6379/0",
    prod: "redis://localhost:6379/1",
  },

  // Environment
  isProduction,
  currentEnv,

  // Rules
  rules: coreConfig.rules,

  // Big 5 Tools
  big5Tools: coreConfig.big5Tools,

  // Safe zones for editing
  safeZones: coreConfig.safeZones,

  // Raw config access (if needed)
  raw: coreConfig,
};
