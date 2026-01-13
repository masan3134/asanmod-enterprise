/**
 * ═══════════════════════════════════════════════════════════════════
 * ASANMOD v1.0.0: ENVIRONMENT HELPER (Universal Bridge)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Single source of truth for ports, paths, and environment config.
 * NOW POWERED BY: config-loader.cjs (v1.0.0 Config + .env)
 * Matches the 'SaaS Template' abstraction.
 */

const path = require("path");
const loader = require("./config-loader.cjs");

// Load Configuration (Auto-detect v1.0.0 or Legacy)
const loaded = loader.loadV10() || loader.loadLegacy();

if (!loaded) {
  console.error("❌ ASANMOD FATAL: No valid configuration found!");
  console.error("   Checked: asanmod.config.json AND asanmod-core.json");
  process.exit(1);
}

const config = loaded.config;
const source = loaded.source; // 'v10' or 'legacy'
const PROJECT_ROOT = path.resolve(__dirname, "../..");

// ─────────────────────────────────────────────────────────────────────────────
// ADAPTER LAYERS
// ─────────────────────────────────────────────────────────────────────────────

function getPort(service, env = "dev") {
  if (source === 'v10') {
    // v10 Structure: infrastructure.frontend.port / prodPort
    const infra = config.infrastructure;
    if (!infra) throw new Error("Invalid v10 config: missing infrastructure");

    // Map service names
    const serviceKey = service === 'brain' ? 'brain' : service;
    const target = infra[serviceKey];

    if (!target) throw new Error(`Unknown service: ${service}`);

    if (env === 'prod') {
      return target.prodPort || target.port;
    } else {
      return target.port;
    }
  } else {
    // Legacy Structure
    const envConfig = config.network[env];
    if (!envConfig) throw new Error(`Unknown environment: ${env}`);
    return envConfig[service];
  }
}

function getDbUrl(env = "dev") {
  // Use ENV variables if available (v10), fallback to config
  if (source === 'v10') {
    if (env === 'prod') return process.env.DB_CONNECTION_PROD || loaded.env.DB_CONNECTION_PROD;
    return process.env.DB_CONNECTION_DEV || loaded.env.DB_CONNECTION_DEV;
  }
  // Legacy
  const dbName = env === "prod" ? "ikai_prod_db" : "ikai_dev_db";
  return `postgresql://ikaiuser:ikaipass2025@localhost:5432/${dbName}?timezone=Europe/Istanbul`;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

function isProduction() {
  return (process.env.NODE_ENV === "production" || process.env.IKAI_ENV === "prod");
}

module.exports = {
  // Metadata
  version: config.version,
  name: config.name,
  configSource: source,

  // Paths (Normalized to Absolute)
  paths: {
    root: PROJECT_ROOT,
    scripts: path.join(PROJECT_ROOT, "scripts/mod-tools"),
    docs: path.join(PROJECT_ROOT, "docs"),
    backend: path.join(PROJECT_ROOT, "backend"),
    frontend: path.join(PROJECT_ROOT, "frontend"),
    state: path.join(PROJECT_ROOT, ".asanmod/state"), // v10 standard
    logs: path.join(PROJECT_ROOT, ".asanmod/logs"),   // v10 standard
    coreConfig: loader.paths[source === 'v10' ? 'v10' : 'legacy'],
  },

  // Network
  port: getPort,
  binding: source === 'v10'
    ? (config.infrastructure.frontend.prodBinding || "127.0.0.1")
    : (config.network.prod.binding || "127.0.0.1"),

  pm2Name: (service, env = "dev") => {
    // Standardized PM2 naming convention
    const map = {
      "dev-frontend": "ikai-dev-frontend",
      "dev-backend": "ikai-dev-backend",
      "prod-frontend": "ikai-prod-frontend",
      "prod-backend": "ikai-prod-backend",
      "prod-brain": "ikai-brain",
    };
    return map[`${env}-${service}`];
  },

  // Database
  databaseUrl: getDbUrl,
  redis: {
    dev: "redis://localhost:6379/0",
    prod: "redis://localhost:6379/1",
  },

  // Environment
  isProduction,
  currentEnv: () => isProduction() ? "prod" : "dev",

  // Rules (Direct map or Fallback)
  rules: config.rules || {},

  // Backwards Compat
  big5Tools: config.big5Tools,
  safeZones: config.safeZones,

  // Raw Access
  raw: config
};
