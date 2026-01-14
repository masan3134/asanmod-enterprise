#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

/**
 * 🧙‍♂️ ASANMOD v2.1.0-alpha: First-Run Wizard
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
async function runPreFlight(rl) {
  header('🔍 SYSTEM AUDIT & PRE-FLIGHT');
  let allPassed = true;
  const missingCritical = [];
  const missingOptional = [];

  // 1. Node.js
  const nodeVersion = process.version.slice(1);
  const majorNode = parseInt(nodeVersion.split('.')[0]);
  const nodeOk = majorNode >= 18;
  log(`  Node.js: v${nodeVersion} ${nodeOk ? '✅' : '❌'}`, nodeOk ? COLORS.green : COLORS.red);
  if (!nodeOk) {
    allPassed = false;
    missingCritical.push(`Node.js >= 18 (Current: v${nodeVersion})`);
  }

  // 2. NPM
  let npmVersion = 'Unknown';
  try {
    npmVersion = execSync('npm -v', { encoding: 'utf8' }).trim();
    log(`  NPM: v${npmVersion} ✅`, COLORS.green);
  } catch {
    log('  NPM: ❌ (not found)', COLORS.red);
    allPassed = false;
    missingCritical.push('NPM');
  }

  // 3. Git
  try {
    const gitVer = execSync('git --version', { encoding: 'utf8' }).trim();
    log(`  Git: ${gitVer} ✅`, COLORS.green);
  } catch {
    log('  Git: ❌ (not installed)', COLORS.red);
    allPassed = false;
    missingCritical.push('Git');
  }

  // 4. PostgreSQL
  try {
    const pgVer = execSync('psql --version', { encoding: 'utf8' }).trim();
    log(`  PostgreSQL: ${pgVer} ✅`, COLORS.green);
  } catch {
    log('  PostgreSQL: ⚠️ (not found, expected for database)', COLORS.yellow);
    missingOptional.push('PostgreSQL (Local Server)');
  }

  // 5. PM2
  try {
    const pm2Ver = execSync('npx pm2 -v', { encoding: 'utf8' }).trim();
    log(`  PM2 (via npx): v${pm2Ver} ✅`, COLORS.green);
  } catch {
    log('  PM2: ⚠️ (not found, needed for production)', COLORS.yellow);
    missingOptional.push('PM2');
  }

  // Hardware Intro (Quick guess)
  const memoryGB = Math.round(require('os').totalmem() / (1024 * 1024 * 1024));
  const cpuCount = require('os').cpus().length;
  log(`\n  Environment: ${cpuCount} CPUs, ${memoryGB}GB RAM`, COLORS.cyan);
  log(`  Estimated Setup Footprint: ~500MB Disk, ~200MB RAM (Dev Mode)`, COLORS.cyan);

  if (missingCritical.length > 0) {
    log(`\n❌ CRITICAL MISSING: ${missingCritical.join(', ')}`, COLORS.red);
    log('Please install these before continuing.\n');
    return false;
  }

  if (missingOptional.length > 0) {
    log(`\n⚠️  OPTIONAL MISSING: ${missingOptional.join(', ')}`, COLORS.yellow);
    const answer = await ask(rl, '  Proceed anyway? (Y/n):');
    if (answer.toLowerCase() === 'n') return false;
  }

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
    let content = fs.readFileSync(configPath, 'utf8');
    content = content.replace(/\[PROJECT_NAME\]/g, projectName);
    content = content.replace(/\[PROJECT_DESCRIPTION\]/g, projectDesc);
    content = content.replace(/\[DB_USER\]/g, 'postgres');

    const config = JSON.parse(content);
    config.name = projectName;
    config.description = projectDesc;
    config.modules = modules;
    config.lastUpdated = new Date().toISOString();
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    log('  ✅ docs/asanmod-core.json updated', COLORS.green);
  }
}

// Global purge for UI files (COMPREHENSIVE - catches ALL placeholder variants)
function purgePlaceholders(projectName, projectDesc, modules) {
  const targets = [
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'CHANGELOG.md',
    'README.md',
    'project.mdc',
    'CREDENTIALS.md'
  ];

  const moduleList = modules.join(', ');
  const currentDate = new Date().toISOString().split('T')[0];

  targets.forEach(target => {
    const filePath = path.join(PROJECT_ROOT, target);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');

      // Standard placeholders
      content = content.replace(/\[PROJECT_NAME\]/g, projectName);
      content = content.replace(/\[PROJECT_DESCRIPTION\]/g, projectDesc);
      content = content.replace(/\[WIZARD_WILL_FILL_DATE\]/g, currentDate);
      content = content.replace(/\[WIZARD_WILL_FILL_MODULES\]/g, moduleList);
      content = content.replace(/\[WIZARD_WILL_FILL_DB_NAME\]/g, projectName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_db');


      // CONTEXT-AWARE: Match description and replace with appropriate value
      // Pattern: [WIZARD_WILL_FILL: some description] - BEFORE generic fallback
      content = content.replace(/\[WIZARD_WILL_FILL:\s*List of enabled modules\]/gi, moduleList);
      content = content.replace(/\[WIZARD_WILL_FILL:\s*Database name\]/gi, projectName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_db');
      content = content.replace(/\[WIZARD_WILL_FILL:\s*Project name\]/gi, projectName);

      // FALLBACK: Any remaining [WIZARD_WILL_FILL: ...] gets current date
      content = content.replace(/\[WIZARD_WILL_FILL:[^\]]*\]/g, currentDate);
      content = content.replace(/\[WIZARD_WILL_FILL\]/g, currentDate);

      fs.writeFileSync(filePath, content);
      log(`  ✅ ${target} placeholders purged`, COLORS.green);
    }
  });
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
    version: '2.1.0-alpha',
    modules,
    protocol: 'ASANMOD v2.1.0-alpha Wizard',
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
async function checkAndCreateDbUser(dbUser, rl) {
  try {
    console.log(`\n🔍 Checking DB user: ${dbUser}...`);
    execSync(`psql postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='${dbUser}'"`, { stdio: 'pipe' });
    console.log(`✅ DB user '${dbUser}' already exists.`);
  } catch (err) {
    console.log(`⚠️  DB user '${dbUser}' not found.`);
    const answer = await new Promise((resolve) => {
      rl.question(`❓ Do you want to try creating the role '${dbUser}'? (y/n): `, resolve);
    });

    if (answer.toLowerCase() === 'y') {
      try {
        console.log(`🚀 Creating role '${dbUser}'...`);
        // We use -s for superuser to make dev setup easier
        execSync(`sudo -u postgres psql -c "CREATE ROLE ${dbUser} WITH LOGIN SUPERUSER PASSWORD '${dbUser}';"`, { stdio: 'pipe' });
        console.log(`✅ Role '${dbUser}' created successfully.`);
      } catch (createErr) {
        console.log(`❌ Failed to create role: ${createErr.message}`);
        console.log(`💡 Manual fix: sudo -u postgres psql -c "CREATE ROLE ${dbUser} WITH LOGIN SUPERUSER PASSWORD '${dbUser}';"`);
      }
    }
  }
}

async function runWizard() {
  // Check if already installed
  if (isInstalled()) {
    header('⚠️ PROJECT ALREADY INSTALLED');
    log('\nThis project has already been initialized.');
    log('If you want to reinitialize, delete .asanmod/installed.lock first.\n');
    return;
  }

  const rl = createPrompt();

  header('🧙 ASANMOD v2.1.0-alpha WIZARD');
  log('\nWelcome! This wizard will set up your project.\n');

  // Pre-flight
  if (!(await runPreFlight(rl))) {
    log('\n❌ Pre-flight checks failed or cancelled.', COLORS.red);
    rl.close();
    return;
  }

  // Collect information
  header('📝 PROJECT INFORMATION');

  const projectName = await ask(rl, '\n  Project name:') || 'My SaaS';
  const projectDesc = await ask(rl, '  Description:') || 'A SaaS application';

  const dbName = projectName.toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_') + '_db';
  log(`  Database name will be: ${dbName}`, COLORS.cyan);

  const dbUser = 'postgres'; // Default for dev, wizard can be hardened later for custom users
  await checkAndCreateDbUser(dbUser, rl);

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
  purgePlaceholders(projectName, projectDesc, modules);
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

  🛡️ ASANMOD v2.1.0-alpha - Iron Curtain Active
  `, COLORS.green);

  // Update manifest to mark wizard as complete
  const manifestPath = path.join(PROJECT_ROOT, '.asanmod/manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.flags.wizard_completed = true;
    manifest.flags.placeholders_purged = true;
    manifest.state = 'configured';
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    log('\n  ✅ Manifest updated: wizard_completed = true', COLORS.green);
  }
}

if (require.main === module) {
  runWizard().catch(console.error);
}

module.exports = { runPreFlight, createLock };
