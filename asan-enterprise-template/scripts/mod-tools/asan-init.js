#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log("🚀 ASANMOD v1.0.0: Initializing Project Factory...");

const PROJECT_ROOT = process.cwd();
const ENV_PATH = path.join(PROJECT_ROOT, ".env");
const EXAMPLE_ENV_PATH = path.join(PROJECT_ROOT, ".env.example");

// 1. Create .env if not exists
if (!fs.existsSync(ENV_PATH)) {
  if (fs.existsSync(EXAMPLE_ENV_PATH)) {
    console.log("📝 Creating .env from .env.example...");
    fs.copyFileSync(EXAMPLE_ENV_PATH, ENV_PATH);
  } else {
    console.log("📝 Creating initial .env file...");
    fs.writeFileSync(ENV_PATH, "DATABASE_URL=postgresql://user:pass@localhost:5432/db_name\nNODE_ENV=development\n");
  }
} else {
  console.log("✅ .env already exists.");
}

// 2. Create required directories
const dirs = [".asanmod/state", ".asanmod/logs", ".asanmod/artifacts"];
dirs.forEach(dir => {
  const dirPath = path.join(PROJECT_ROOT, dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`📂 Creating directory: ${dir}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

console.log("\n✨ ASANMOD INITIALIZATION COMPLETE.");
console.log("👉 Next steps (Ghost-Dev Protocol):");
console.log("   1. Check your .env file and set DATABASE_URL.");
console.log("   2. Run 'npm install'.");
console.log("   3. PERFORM STRATEGIC INTERVIEW (Ask the 4 core questions from docs/GHOST_DEV_PROTOCOL.md).");
console.log("   4. Once answered, run 'asan verify' and start OTONOM production.");
