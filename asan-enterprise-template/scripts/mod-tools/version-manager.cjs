/**
 * ASANMOD v1.0.0: VERSION MANAGER
 * Single source of truth for versioning.
 *
 * Features:
 * - Read version from asanmod-core.json
 * - Bump patch version (1.0.0 → 1.0.1)
 * - Sync version across all files
 * - Validate version consistency
 */
const fs = require("fs");
const path = require("path");

// Configuration
const CONFIG = {
  CORE_FILE: path.join(process.cwd(), "docs", "asanmod-core.json"),
  FILES_TO_SYNC: [
    { path: "AGENT.md", pattern: /ASANMOD v[\d.]+/g, template: "ASANMOD v{VERSION}" },
    { path: "docs/AGENT_QUICK_REF.md", pattern: /v[\d.]+/g, template: "v{VERSION}", headerOnly: true },
    { path: ".cursorrules", pattern: /ASANMOD v[\d.]+/g, template: "ASANMOD v{VERSION}" },
    { path: "GEMINI.md", pattern: /ASANMOD v[\d.]+/g, template: "ASANMOD v{VERSION}" },
    { path: "CURSOR.md", pattern: /ASANMOD v[\d.]+/g, template: "ASANMOD v{VERSION}" },
    { path: "CLAUDE.md", pattern: /ASANMOD v[\d.]+/g, template: "ASANMOD v{VERSION}" },
  ],
};

/**
 * Read core config
 */
function readCore() {
  if (!fs.existsSync(CONFIG.CORE_FILE)) {
    throw new Error(`Core file not found: ${CONFIG.CORE_FILE}`);
  }
  return JSON.parse(fs.readFileSync(CONFIG.CORE_FILE, "utf-8"));
}

/**
 * Write core config
 */
function writeCore(config) {
  config.lastUpdated = new Date().toISOString();
  fs.writeFileSync(CONFIG.CORE_FILE, JSON.stringify(config, null, 2));
}

/**
 * Get current version
 */
function getVersion() {
  const config = readCore();
  return config.version;
}

/**
 * Bump patch version (1.0.0 → 1.0.1)
 */
function bumpVersion() {
  const config = readCore();
  const [major, minor, patch] = config.version.split(".").map(Number);
  const newVersion = `${major}.${minor}.${patch + 1}`;

  config.version = newVersion;
  writeCore(config);

  return { oldVersion: `${major}.${minor}.${patch}`, newVersion };
}

/**
 * Sync version to all files
 */
function syncVersion() {
  const version = getVersion();
  const results = [];

  for (const file of CONFIG.FILES_TO_SYNC) {
    const filePath = path.join(process.cwd(), file.path);

    if (!fs.existsSync(filePath)) {
      results.push({ file: file.path, status: "SKIPPED", reason: "File not found" });
      continue;
    }

    let content = fs.readFileSync(filePath, "utf-8");
    const replacement = file.template.replace("{VERSION}", version);

    // For header-only updates, only update the first 20 lines
    if (file.headerOnly) {
      const lines = content.split("\n");
      const header = lines.slice(0, 20).join("\n");
      const rest = lines.slice(20).join("\n");
      const newHeader = header.replace(file.pattern, replacement);
      content = newHeader + "\n" + rest;
    } else {
      content = content.replace(file.pattern, replacement);
    }

    fs.writeFileSync(filePath, content);
    results.push({ file: file.path, status: "UPDATED", version });
  }

  return results;
}

/**
 * Validate version consistency
 */
function validateVersion() {
  const version = getVersion();
  const issues = [];
  const checked = [];

  for (const file of CONFIG.FILES_TO_SYNC) {
    const filePath = path.join(process.cwd(), file.path);

    if (!fs.existsSync(filePath)) {
      checked.push({ file: file.path, status: "SKIPPED" });
      continue;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const expectedPattern = file.template.replace("{VERSION}", version);

    if (!content.includes(expectedPattern)) {
      issues.push({ file: file.path, expected: expectedPattern, found: "MISMATCH" });
    } else {
      checked.push({ file: file.path, status: "OK" });
    }
  }

  return {
    version,
    valid: issues.length === 0,
    issues,
    checked,
  };
}

/**
 * Show version info
 */
function showVersion() {
  const config = readCore();
  console.log(`
╔════════════════════════════════════════════════════════╗
║  🛡️  ASANMOD VERSION INFO                              ║
╠════════════════════════════════════════════════════════╣
║  Version:      ${config.version.padEnd(40)}║
║  Last Updated: ${config.lastUpdated.padEnd(40)}║
║  Name:         ${config.name.substring(0, 40).padEnd(40)}║
╚════════════════════════════════════════════════════════╝
`);
}

// CLI interface
if (require.main === module) {
  const action = process.argv[2];

  const actions = {
    show: () => {
      showVersion();
    },

    get: () => {
      console.log(getVersion());
    },

    bump: () => {
      const { oldVersion, newVersion } = bumpVersion();
      console.log(`✅ Version bumped: ${oldVersion} → ${newVersion}`);

      // Auto-sync after bump
      console.log("\n📤 Syncing version to all files...");
      const results = syncVersion();
      results.forEach((r) => {
        console.log(`  ${r.status === "UPDATED" ? "✅" : "⏭️"} ${r.file}: ${r.status}`);
      });
    },

    sync: () => {
      console.log("📤 Syncing version to all files...");
      const results = syncVersion();
      results.forEach((r) => {
        console.log(`  ${r.status === "UPDATED" ? "✅" : "⏭️"} ${r.file}: ${r.status}`);
      });
    },

    validate: () => {
      console.log("🔍 Validating version consistency...\n");
      const result = validateVersion();

      console.log(`Version: ${result.version}`);
      console.log(`Status:  ${result.valid ? "✅ VALID" : "❌ INVALID"}\n`);

      if (result.issues.length > 0) {
        console.log("Issues:");
        result.issues.forEach((i) => {
          console.log(`  ❌ ${i.file}: Expected "${i.expected}"`);
        });
        process.exit(1);
      } else {
        console.log("Checked files:");
        result.checked.forEach((c) => {
          console.log(`  ✅ ${c.file}`);
        });
      }
    },
  };

  if (actions[action]) {
    actions[action]();
  } else {
    console.log(`Usage: node version-manager.cjs <action>
Actions:
  show      - Show version info
  get       - Get current version (plain text)
  bump      - Bump patch version (1.0.0 → 1.0.1) and sync
  sync      - Sync version to all files
  validate  - Validate version consistency across files`);
  }
}

module.exports = {
  getVersion,
  bumpVersion,
  syncVersion,
  validateVersion,
};
