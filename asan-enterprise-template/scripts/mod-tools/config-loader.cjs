/**
 * ═══════════════════════════════════════════════════════════════════
 * ASANMOD v1.0.0: TEMPLATE CONFIG LOADER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This version is optimized for the Enterprise Template.
 * It strictly loads from asanmod.config.json and .env.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const CONFIG_PATH = path.join(PROJECT_ROOT, "asanmod.config.json");
const ENV_PATH = path.join(PROJECT_ROOT, ".env"); // Standard .env for template

// Helper: Simple .env parser
function parseEnv(content) {
  const result = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...values] = trimmed.split('=');
    if (key && values.length > 0) {
      let val = values.join('=').trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      result[key.trim()] = val;
    }
  });
  return result;
}

function load() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`❌ ASANMOD: Configuration not found at ${CONFIG_PATH}`);
    return null;
  }

  try {
    const rawConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    const envVars = fs.existsSync(ENV_PATH)
      ? parseEnv(fs.readFileSync(ENV_PATH, "utf8"))
      : {};

    return {
      source: 'v10',
      config: rawConfig,
      env: envVars
    };
  } catch (e) {
    console.error("❌ Failed to load ASANMOD config:", e.message);
    return null;
  }
}

module.exports = {
  load,
  paths: {
    config: CONFIG_PATH,
    env: ENV_PATH
  }
};
