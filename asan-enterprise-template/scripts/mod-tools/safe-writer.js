#!/usr/bin/env node
/**
 * ASANMOD v7.0: SAFE WRITER (The Gatekeeper)
 * Implements Surgical "Try-Catch" Writes for Agents using Neuro-Map.
 *
 * Usage: node safe-writer.js <target_file> <source_temp_file>
 *
 * Logic:
 * 1. Backup target file.
 * 2. Overwrite target with source.
 * 3. Run Verification (npm run verify).
 * 4. Pass? -> Delete backup.
 * 5. Fail? -> Restore backup.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

const log = (msg, color = colors.reset) =>
  console.log(`${color}[SAFE-WRITE] ${msg}${colors.reset}`);
const die = (msg) => {
  console.error(`${colors.red}[FATAL] ${msg}${colors.reset}`);
  process.exit(1);
};

// Args
const targetFile = process.argv[2];
const sourceFile = process.argv[3];

if (!targetFile || !sourceFile) {
  die("Usage: node safe-writer.js <target_file> <source_temp_file>");
}

const rootDir = process.cwd();
const absTarget = path.resolve(rootDir, targetFile);
const absSource = path.resolve(rootDir, sourceFile);

if (!fs.existsSync(absSource)) {
  die(`Source file not found: ${absSource}`);
}

// Ensure target directory exists
const targetDir = path.dirname(absTarget);
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const backupFile = `${absTarget}.bak`;
let isNewFile = false;

try {
  // 1. BACKUP
  if (fs.existsSync(absTarget)) {
    log(`Backing up ${targetFile}...`, colors.blue);
    fs.copyFileSync(absTarget, backupFile);
  } else {
    isNewFile = true;
    log(`Creating new file ${targetFile}...`, colors.blue);
  }

  // 2. OVERWRITE
  log(
    `Writing new content from ${path.basename(sourceFile)}...`,
    colors.yellow
  );
  fs.copyFileSync(absSource, absTarget);

  // 2.5 [THE SENTINEL] REAL-TIME REGEX GUARD (Fail Fast)
  log(`Scanning for forbidden patterns (Rule 0)...`, colors.blue);
  const content = fs.readFileSync(absTarget, "utf-8");

  const forbiddenPatterns = [
    {
      regex: /:\s*any\b/,
      msg: "TYPE SAFETY VIOLATION: usage of 'any' is strictly forbidden.",
    },
    {
      regex: /console\.log\(/,
      msg: "OBSERVABILITY VIOLATION: console.log() is forbidden in Production code. Use Logger.",
    },
    {
      regex: /(minio|redis|postgres|milvus):(?!\/\/)/,
      msg: "ARCHITECTURE VIOLATION: Docker service hostnames found. Use '127.0.0.1' for Native PM2.",
    },
  ];

  // Specific check for .env files or config files related to hostnames
  const isEnv = targetFile.includes(".env") || targetFile.includes("config");

  for (const rule of forbiddenPatterns) {
    // Docker check only applies to config/env files usually, but good to be safe globally
    // Console log is blocking everywhere for now based on strict rule
    if (rule.regex.test(content)) {
      // Allow console.log in non-prod scripts if needed? For now strict block as per Plan.
      // Exception: safe-writer itself needs console.log, but we are scanning TARGET file.

      const lines = content.split("\n");
      lines.forEach((line, i) => {
        if (rule.regex.test(line)) {
          console.error(
            `${colors.red}>> Line ${i + 1}: ${line.trim()}${colors.reset}`
          );
        }
      });
      throw new Error(`[SENTINEL BLOCK] ${rule.msg}`);
    }
  }

  // 3. VERIFY (SURGICAL)
  log(`Verifying integrity (Surgical)...`, colors.blue);
  // ASANMOD v7: Use surgical-verify.js instead of full verify
  // This calculates blast radius and checks only relevant files.
  // We pass absolute path of the TARGET file (which now contains the new content)
  execSync(`node scripts/mod-tools/surgical-verify.js "${absTarget}"`, {
    stdio: "pipe",
  });

  // 4. SUCCESS -> COMMIT
  log(`✅ Verification PASSED. Commit confirmed.`, colors.green);
  if (fs.existsSync(backupFile)) {
    fs.unlinkSync(backupFile);
  }
  process.exit(0);
} catch (e) {
  // 5. FAIL -> ROLLBACK
  log(`❌ Verification FAILED. Rolling back...`, colors.red);

  if (isNewFile) {
    if (fs.existsSync(absTarget)) fs.unlinkSync(absTarget);
  } else if (fs.existsSync(backupFile)) {
    try {
      fs.copyFileSync(backupFile, absTarget);
      fs.unlinkSync(backupFile);
      log(`Rollback successful. Original file restored.`, colors.green);
    } catch (restoreErr) {
      die(
        `CRITICAL: Failed to restore backup! System in inconsistent state. Error: ${restoreErr.message}`
      );
    }
  }

  // Output the verification error details
  if (e.stderr) {
    console.error(colors.red + "--- VERIFICATION ERRORS ---" + colors.reset);
    console.error(e.stderr.toString());
    console.error(e.stdout.toString());
  } else {
    console.error(e.message);
  }

  process.exit(1);
}
