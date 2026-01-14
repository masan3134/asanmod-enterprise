#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

/**
 * 🧙‍♂️ ASANMOD v2.0.1: First-Run Wizard
 * Complete autonomous project setup
 */

const PROJECT_ROOT = process.cwd();
const COLORS = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  bold: '\x1b[1m',
};

function log(msg, color = COLORS.reset) {
  console.log(`${color}${msg}${COLORS.reset}`);
}

function header(title) {
  console.log('\n' + '═'.repeat(60));
  log(`  ${title}`, COLORS.cyan + COLORS.bold);
  console.log('═'.repeat(60));
}

// Check if already installed
function isInstalled() {
  return fs.existsSync(path.join(PROJECT_ROOT, '.asanmod/installed.lock'));
}

// Pre-flight checks
function runPreFlight() {
  header('🔍 PRE-FLIGHT CHECK');
  let allPassed = true;

  // Node version
  const nodeVersion = process.version.slice(1).split('.')[0];
  const nodeOk = parseInt(nodeVersion) >= 18;
  log(`  Node.js: v${process.version} ${nodeOk ? '✅' : '❌'}`, nodeOk ? COLORS.green : COLORS.red);
  if (!nodeOk) allPassed = false;

  // Git
  try {
    execSync('git --version', { stdio: 'ignore' });
    log('  Git: ✅', COLORS.green);
  } catch {
    log('  Git: ❌ (not installed)', COLORS.red);
    allPassed = false;
  }

  // PostgreSQL
  try {
    execSync('psql --version', { stdio: 'ignore' });
    log('  PostgreSQL: ✅', COLORS.green);
  } catch {
    log('  PostgreSQL: ⚠️ (not found, will need DATABASE_URL in .env)', COLORS.yellow);
  }

  // npm packages
  const hasNodeModules = fs.existsSync(path.join(PROJECT_ROOT, 'node_modules'));
  log(`  Dependencies: ${hasNodeModules ? '✅' : '⚠️ Run npm install'}`, hasNodeModules ? COLORS.green : COLORS.yellow);

  return allPassed;
}

// Create readline interface
function createPrompt() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

// Ask question
function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(`${COLORS.yellow}${question}${COLORS.reset} `, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Update asanmod-core.json
function updateConfig(projectName, projectDesc, modules) {
  const configPath = path.join(PROJECT_ROOT, 'docs/asanmod-core.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config.name = projectName;
    config.description = projectDesc;
    config.modules = modules;
    config.lastUpdated = new Date().toISOString();
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    log('  ✅ docs/asanmod-core.json updated', COLORS.green);
  }
}

// Update project.mdc
function updateProjectMdc(projectName, projectDesc) {
  const mdcPath = path.join(PROJECT_ROOT, 'project.mdc');
  if (fs.existsSync(mdcPath)) {
    let content = fs.readFileSync(mdcPath, 'utf8');
    content = content.replace(/\[PROJECT_NAME\]/g, projectName);
    content = content.replace(/\[PROJECT_DESCRIPTION\]/g, projectDesc);
    content = content.replace('[WIZARD_WILL_FILL]', new Date().toISOString().split('T')[0]);
    fs.writeFileSync(mdcPath, content);
    log('  ✅ project.mdc updated', COLORS.green);
  }
}

// Update .env from .env.example
function createEnvFile(dbName) {
  const envExamplePath = path.join(PROJECT_ROOT, '.env.example');
  const envPath = path.join(PROJECT_ROOT, '.env');

  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    let content = fs.readFileSync(envExamplePath, 'utf8');
    content = content.replace(
      'postgresql://user:password@localhost:5432/dbname',
      `postgresql://postgres:postgres@localhost:5432/${dbName}`
    );
    fs.writeFileSync(envPath, content);
    log('  ✅ .env created', COLORS.green);
  } else if (fs.existsSync(envPath)) {
    log('  ⚠️ .env already exists, skipped', COLORS.yellow);
  }
}

// Create installed.lock
function createLock(projectName, modules) {
  const lockDir = path.join(PROJECT_ROOT, '.asanmod');
  if (!fs.existsSync(lockDir)) fs.mkdirSync(lockDir, { recursive: true });

  const lock = {
    projectName,
    installedAt: new Date().toISOString(),
    version: '2.0.0',
    modules,
    protocol: 'ASANMOD v2.0.1 Wizard',
  };

  fs.writeFileSync(path.join(lockDir, 'installed.lock'), JSON.stringify(lock, null, 2));
  log('  ✅ .asanmod/installed.lock created', COLORS.green);
}

// Update CREDENTIALS.md
function updateCredentials(adminEmail, adminPassword) {
  const credPath = path.join(PROJECT_ROOT, 'CREDENTIALS.md');
  if (fs.existsSync(credPath)) {
    let content = fs.readFileSync(credPath, 'utf8');
    content = content.replace('[WIZARD_WILL_FILL]', adminEmail);
    content = content.replace('[WIZARD_WILL_FILL]', adminPassword);
    fs.writeFileSync(credPath, content);
    log('  ✅ CREDENTIALS.md updated', COLORS.green);
  }
}

// Main wizard
async function runWizard() {
  // Check if already installed
  if (isInstalled()) {
    header('⚠️ PROJECT ALREADY INSTALLED');
    log('\nThis project has already been initialized.');
    log('If you want to reinitialize, delete .asanmod/installed.lock first.\n');
    return;
  }

  header('🧙 ASANMOD v2.0.1 WIZARD');
  log('\nWelcome! This wizard will set up your project.\n');

  // Pre-flight
  if (!runPreFlight()) {
    log('\n❌ Pre-flight checks failed. Please fix issues above.', COLORS.red);
    return;
  }

  const rl = createPrompt();

  // Collect information
  header('📝 PROJECT INFORMATION');

  const projectName = await ask(rl, '\n  Project name:') || 'My SaaS';
  const projectDesc = await ask(rl, '  Description:') || 'A SaaS application';

  const dbName = projectName.toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_') + '_db';
  log(`  Database name will be: ${dbName}`, COLORS.cyan);

  // Module selection
  header('📦 MODULE SELECTION');
  log('\n  Select modules to enable:');
  log('  1. auth - Authentication (login/register)');
  log('  2. users - User management');
  log('  3. admin - Admin panel');
  log('  4. payments - Payment integration');
  log('  5. files - File uploads\n');

  const moduleInput = await ask(rl, '  Enter numbers (e.g., 1,2,3):') || '1,2';
  const moduleMap = { '1': 'auth', '2': 'users', '3': 'admin', '4': 'payments', '5': 'files' };
  const modules = moduleInput.split(',').map(n => moduleMap[n.trim()]).filter(Boolean);
  log(`  Selected: ${modules.join(', ')}`, COLORS.green);

  // Environment
  header('🌍 ENVIRONMENT');
  const envChoice = await ask(rl, '\n  Deploy to production with domain? (y/N):');
  const hasProd = envChoice.toLowerCase() === 'y';
  log(`  Mode: ${hasProd ? 'Development + Production' : 'Development only'}`, COLORS.cyan);

  rl.close();

  // Apply configuration
  header('⚙️ APPLYING CONFIGURATION');

  updateConfig(projectName, projectDesc, modules);
  updateProjectMdc(projectName, projectDesc);
  createEnvFile(dbName);
  updateCredentials('admin@example.com', 'admin123');
  createLock(projectName, modules);

  // Summary
  header('✅ SETUP COMPLETE');
  log(`
  Project: ${projectName}
  Database: ${dbName}
  Modules: ${modules.join(', ')}

  📋 NEXT STEPS:

  1. Update .env with your actual DATABASE_URL
  2. Run: npm run db:migrate
  3. Run: npm run seed
  4. Run: npm run dev

  🔐 Default credentials (change immediately):
     Email: admin@example.com
     Password: admin123

  🛡️ ASANMOD v2.0.1 - Iron Curtain Active
  `, COLORS.green);
}

if (require.main === module) {
  runWizard().catch(console.error);
}

module.exports = { runPreFlight, createLock };
