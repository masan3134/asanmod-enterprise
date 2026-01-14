#!/usr/bin/env node
/**
 * ASANMOD v2.1.0-alpha: Project Initialization
 * Creates required directories and initial .env
 */

const fs = require('fs');
const path = require('path');

console.log("🚀 ASANMOD v2.1.0-alpha: Initializing Project...");

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
const dirs = [".asanmod/state", ".asanmod/logs", "logs"];
dirs.forEach(dir => {
  const dirPath = path.join(PROJECT_ROOT, dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`📂 Creating directory: ${dir}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

console.log("\n✨ ASANMOD INITIALIZATION COMPLETE.");
console.log("👉 Next steps:");
console.log("   1. Edit .env file and set DATABASE_URL");
console.log("   2. Run: npm run db:push");
console.log("   3. Run: npm run seed (optional)");
console.log("   4. Run: npm run dev");
