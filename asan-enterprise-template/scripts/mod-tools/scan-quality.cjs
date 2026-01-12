#!/usr/bin/env node

/**
 * ASANMOD v5.0 - QUALITY SCANNER (Rule 0-SCAN)
 *
 * Purpose: Aggregates all code quality issues (Lint/TS/Prettier) into a single
 * actionable report for Agents to perform "Batch/Surgical" fixes.
 *
 * Logic:
 * 1. Scans Frontend & Backend (Parallel).
 * 2. Categorizes errors:
 *    - [AUTO]: Prettier/Simple Lint (Safe to auto-fix).
 *    - [MANUAL]: TypeScript/Complex Lint (Requires Agent logic).
 * 3. Outputs a clean Summary for the Agent.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Colors
const REL = "\x1b[0m"; // Reset
const RED = "\x1b[31m";
const GRN = "\x1b[32m";
const YEL = "\x1b[33m";
const CYN = "\x1b[36m";
const BLU = "\x1b[34m";

console.log(
  `${CYN}╔════════════════════════════════════════════════════════╗${REL}`
);
console.log(
  `${CYN}║  🔍 ASANMOD QUALITY SCANNER (Batch Diagnosis)          ║${REL}`
);
console.log(
  `${CYN}╚════════════════════════════════════════════════════════╝${REL}`
);

const report = {
  frontend: { eslint: [], tsc: [], prettier: [] },
  backend: { eslint: [], tsc: [], prettier: [] },
  root: { prettier: [] },
};

let hasErrors = false;

function execute(command, cwd) {
  try {
    return execSync(command, {
      cwd,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (e) {
    return e.stdout || e.message; // Return output even on failure
  }
}

// 1. FRONTEND SCAN
console.log(`\n${BLU}👉 Scanning FRONTEND...${REL}`);
const frontendPath = path.join(process.cwd(), "frontend");

// FE ESLint
const feLint = execute("IKAI_ENV=dev npx eslint . --format json", frontendPath);
try {
  const json = JSON.parse(feLint);
  json.forEach((file) => {
    file.messages.forEach((msg) => {
      report.frontend.eslint.push({
        file: path.relative(frontendPath, file.filePath),
        line: msg.line,
        rule: msg.ruleId,
        message: msg.message,
        type: msg.fix ? "AUTO" : "MANUAL",
      });
      hasErrors = true;
    });
  });
} catch (e) {
  /* Invalid JSON or no output */
}

// FE TypeScript
const feTsc = execute("npx tsc --noEmit --pretty false", frontendPath);
feTsc.split("\n").forEach((line) => {
  if (line.includes("error TS")) {
    report.frontend.tsc.push({ message: line.trim() });
    hasErrors = true;
  }
});

// FE Prettier
const fePrettier = execute(
  "npx prettier --check . --ignore-path .prettierignore",
  frontendPath
);
fePrettier.split("\n").forEach((line) => {
  if (line.includes("[warn]")) {
    report.frontend.prettier.push({ file: line.replace("[warn] ", "").trim() });
    // Prettier is usually auto-fixable, but we flag it
    hasErrors = true;
  }
});

// 2. BACKEND SCAN
console.log(`${BLU}👉 Scanning BACKEND...${REL}`);
const backendPath = path.join(process.cwd(), "backend");

// BE ESLint
const beLint = execute("npx eslint . --format json", backendPath);
try {
  const json = JSON.parse(beLint);
  json.forEach((file) => {
    file.messages.forEach((msg) => {
      report.backend.eslint.push({
        file: path.relative(backendPath, file.filePath),
        line: msg.line,
        rule: msg.ruleId,
        message: msg.message,
        type: msg.fix ? "AUTO" : "MANUAL",
      });
      hasErrors = true;
    });
  });
} catch (e) {
  /* error */
}

// BE TypeScript
const beTsc = execute("npx tsc --noEmit --pretty false", backendPath);
beTsc.split("\n").forEach((line) => {
  if (line.includes("error TS")) {
    report.backend.tsc.push({ message: line.trim() });
    hasErrors = true;
  }
});

// 3. REPORT GENERATION
console.log(`\n${CYN}📊 DIAGNOSTIC REPORT:${REL}`);

if (!hasErrors) {
  console.log(`${GRN}✅ ALL SYSTEMS GREEN. NO ACTIONS REQUIRED.${REL}`);
  process.exit(0);
}

// Print Frontend Issues
if (
  report.frontend.eslint.length > 0 ||
  report.frontend.tsc.length > 0 ||
  report.frontend.prettier.length > 0
) {
  console.log(`\n${YEL}📦 [FRONTEND ISSUES]${REL}`);

  // ESLint
  if (report.frontend.eslint.length > 0) {
    console.log(`  ${RED}Lint / Rules:${REL}`);
    report.frontend.eslint.forEach((err) => {
      const badge =
        err.type === "AUTO" ? `${GRN}[AUTO]${REL}` : `${RED}[MANUAL]${REL}`;
      console.log(
        `    ${badge} ${err.file}:${err.line} - ${err.message} (${err.rule})`
      );
    });
  }

  // TSC
  if (report.frontend.tsc.length > 0) {
    console.log(`  ${RED}TypeScript (MANUAL FIX REQUIRED):${REL}`);
    report.frontend.tsc
      .slice(0, 10)
      .forEach((msg) => console.log(`    ${msg}`));
    if (report.frontend.tsc.length > 10)
      console.log(`    ... and ${report.frontend.tsc.length - 10} more.`);
  }

  // Prettier
  if (report.frontend.prettier.length > 0) {
    console.log(`  ${YEL}Formatting (Run 'npm run fix:format'):${REL}`);
    console.log(`    ${report.frontend.prettier.length} files detected.`);
  }
}

// Print Backend Issues
if (report.backend.eslint.length > 0 || report.backend.tsc.length > 0) {
  console.log(`\n${YEL}📦 [BACKEND ISSUES]${REL}`);
  if (report.backend.eslint.length > 0) {
    report.backend.eslint.forEach((err) => {
      const badge =
        err.type === "AUTO" ? `${GRN}[AUTO]${REL}` : `${RED}[MANUAL]${REL}`;
      console.log(`    ${badge} ${err.file}:${err.line} - ${err.message}`);
    });
  }
}

console.log(`\n${CYN}🤖 AGENT INSTRUCTIONS (PROTOCOL):${REL}`);
console.log(
  `1. Run ${GRN}npm run fix:all${REL} first to resolve [AUTO] issues.`
);
console.log(`2. Then, ANALYZE the ${RED}[MANUAL]${REL} items above.`);
console.log(
  `3. Use ${BLU}replace_file_content${REL} to surgically fix manual errors.`
);
console.log(`4. Run ${YEL}npm run scan${REL} again to verify.`);

process.exit(1);
