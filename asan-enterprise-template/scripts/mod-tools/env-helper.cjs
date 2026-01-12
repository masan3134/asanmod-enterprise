/**
 * ═══════════════════════════════════════════════════════════════════
 * ASANMOD v1.0.0: TEMPLATE ENVIRONMENT HELPER
 * ═══════════════════════════════════════════════════════════════════
 *
 * Single source of truth for ports, paths, and environment config.
 */

const path = require("path");
const loader = require("./config-loader.cjs");

// Load Configuration
const loaded = loader.load();

if (!loaded) {
  console.error("❌ ASANMOD FATAL: No configuration found!");
  process.exit(1);
}

const config = loaded.config;
const PROJECT_ROOT = path.resolve(__dirname, "../..");

function getPort(service, env = "dev") {
  const infra = config.infrastructure;
  const target = infra[service];
  if (!target) throw new Error(`Unknown service: ${service}`);
  return env === 'prod' ? (target.prodPort || target.port) : target.port;
}

function getDbUrl(env = "dev") {
  if (env === 'prod') return process.env.DATABASE_URL_PROD || loaded.env.DATABASE_URL_PROD;
  return process.env.DATABASE_URL || loaded.env.DATABASE_URL;
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

module.exports = {
  version: config.version,
  name: config.name,

  paths: {
    root: PROJECT_ROOT,
    scripts: path.join(PROJECT_ROOT, "scripts/mod-tools"),
    docs: path.join(PROJECT_ROOT, "docs"),
    src: path.join(PROJECT_ROOT, "src"),
    state: path.join(PROJECT_ROOT, ".asanmod/state"),
    logs: path.join(PROJECT_ROOT, ".asanmod/logs"),
  },

  port: getPort,
  binding: (config.infrastructure.frontend.prodBinding || "0.0.0.0"),

  pm2Name: (service, env = "dev") => {
    return `${config.name}-${env}-${service}`;
  },

  databaseUrl: getDbUrl,
  isProduction,
  currentEnv: () => isProduction() ? "prod" : "dev",
  rules: config.rules || {},
  raw: config
};
