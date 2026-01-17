#!/usr/bin/env node
/**
 * ASANMOD DB Sync Check - UNIVERSAL VERSION
 * DEV ve PROD veritabanlarını karşılaştırır.
 * Bu script ASLA veri değiştirmez, sadece farkları raporlar.
 *
 * Kullanım: npm run db:sync-check
 *
 * Credentials şuradan okunur:
 * 1. Environment variables (DATABASE_URL_DEV, DATABASE_URL_PROD)
 * 2. .env.dev / .env.prod dosyaları
 * 3. asanmod.config.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();

console.log(`
╔════════════════════════════════════════════════════════════╗
║  🔄 ASANMOD DB SYNC CHECK                                  ║
║  ⚠️  SALT-OKUNUR: Hiçbir değişiklik yapılmaz               ║
╚════════════════════════════════════════════════════════════╝
`);

// Parse .env file
function parseEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf-8');
  const result = {};
  content.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length) {
      result[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
  return result;
}

// Load config
function loadConfig() {
  const configPath = path.join(PROJECT_ROOT, 'asanmod.config.json');
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

// Get database URL
function getDbUrl(env) {
  // 1. Check environment variables
  const envVarName = `DATABASE_URL_${env.toUpperCase()}`;
  if (process.env[envVarName]) {
    return process.env[envVarName];
  }

  // 2. Check .env files
  const envFile = env === 'prod' ? '.env.prod' : '.env.dev';
  const envPath = path.join(PROJECT_ROOT, envFile);
  const envVars = parseEnvFile(envPath);
  if (envVars.DATABASE_URL) {
    return envVars.DATABASE_URL;
  }

  // 3. Check asanmod.config.json
  const config = loadConfig();
  if (config.database && config.database[env] && config.database[env].connectionString) {
    return config.database[env].connectionString;
  }

  return null;
}

// Find Prisma schema
function findPrismaSchema() {
  const possiblePaths = [
    path.join(PROJECT_ROOT, 'prisma/schema.prisma'),
    path.join(PROJECT_ROOT, 'src/prisma/schema.prisma'),
    path.join(PROJECT_ROOT, 'backend/prisma/schema.prisma'),
    path.join(PROJECT_ROOT, 'drizzle/schema.ts') // Drizzle support
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const DEV_URL = getDbUrl('dev');
const PROD_URL = getDbUrl('prod');
const SCHEMA_PATH = findPrismaSchema();

// Validate
if (!DEV_URL) {
  console.log('⚠️  DEV database URL bulunamadı');
  console.log('   .env.dev dosyasına DATABASE_URL ekleyin');
}
if (!PROD_URL) {
  console.log('⚠️  PROD database URL bulunamadı');
  console.log('   .env.prod dosyasına DATABASE_URL ekleyin');
}
if (!DEV_URL || !PROD_URL) {
  console.log('\n   Veya asanmod.config.json içinde database.dev ve database.prod tanımlayın');
  process.exit(1);
}

console.log('📊 DEV → PROD Karşılaştırması yapılıyor...\n');

try {
  // Use Prisma migrate diff
  const diffCmd = `npx prisma migrate diff --from-url "${PROD_URL}" --to-url "${DEV_URL}" --script 2>&1`;

  let diff;
  try {
    diff = execSync(diffCmd, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      cwd: PROJECT_ROOT
    });
  } catch (e) {
    diff = e.stdout || '';
  }

  // Analyze differences
  const addColumns = (diff.match(/ADD COLUMN/g) || []).length;
  const dropColumns = (diff.match(/DROP COLUMN/g) || []).length;
  const alterColumns = (diff.match(/ALTER COLUMN/g) || []).length;
  const createIndexes = (diff.match(/CREATE.*INDEX/g) || []).length;
  const addFKs = (diff.match(/ADD CONSTRAINT.*FOREIGN/g) || []).length;
  const createTables = (diff.match(/CREATE TABLE/g) || []).length;
  const dropTables = (diff.match(/DROP TABLE/g) || []).length;
  const totalLines = diff.split('\n').length;

  console.log('   Kategori                    | Sayı  | Durum');
  console.log('   ─────────────────────────────────────────────');
  console.log(`   Eksik Sütunlar (PROD'da)    | ${String(addColumns).padStart(5)} | ${addColumns === 0 ? '✅' : '⚠️'}`);
  console.log(`   Fazla Sütunlar (PROD'da)    | ${String(dropColumns).padStart(5)} | ${dropColumns === 0 ? '✅' : '🔵'}`);
  console.log(`   Tip/Default Farkları        | ${String(alterColumns).padStart(5)} | ${alterColumns === 0 ? '✅' : '🔵'}`);
  console.log(`   Eksik Indexler              | ${String(createIndexes).padStart(5)} | ${createIndexes === 0 ? '✅' : '🟡'}`);
  console.log(`   Eksik Foreign Keys          | ${String(addFKs).padStart(5)} | ${addFKs === 0 ? '✅' : '🟡'}`);
  console.log(`   Eksik Tablolar              | ${String(createTables).padStart(5)} | ${createTables === 0 ? '✅' : '⚠️'}`);
  console.log(`   Fazla Tablolar (PROD'da)    | ${String(dropTables).padStart(5)} | ${dropTables === 0 ? '✅' : '🔵'}`);
  console.log('   ─────────────────────────────────────────────');
  console.log(`   Toplam SQL Satırı           | ${String(totalLines).padStart(5)} |`);

  // Show critical differences
  if (addColumns > 0) {
    console.log('\n⚠️  EKSİK SÜTUNLAR:');
    const cols = diff.match(/ALTER TABLE.*ADD COLUMN[^;]+/g) || [];
    cols.slice(0, 5).forEach(c => console.log('   ' + c.substring(0, 80)));
    if (cols.length > 5) console.log(`   ... ve ${cols.length - 5} daha`);
  }

  if (createTables > 0) {
    console.log('\n⚠️  EKSİK TABLOLAR:');
    const tables = diff.match(/CREATE TABLE "[^"]+"/g) || [];
    tables.forEach(t => console.log('   ' + t));
  }

  // Result
  console.log('\n' + '═'.repeat(60));
  const hasIssues = addColumns > 0 || createTables > 0;

  if (hasIssues) {
    console.log('⚠️  SYNC SORUNLARI TESPİT EDİLDİ!');
    console.log('   PROD ve DEV veritabanları arasında kritik farklar var.');
    console.log('   Manuel müdahale gerekebilir.');
    console.log('\n   📝 NOT: Bu script HİÇBİR değişiklik yapmaz.');
    console.log('   Detaylı SQL için: /tmp/db_sync_diff.sql');

    // Save diff to file
    fs.writeFileSync('/tmp/db_sync_diff.sql', diff);
    process.exit(1);
  } else if (totalLines > 10) {
    console.log('🔵 KÜÇÜK FARKLAR VAR (performans/constraint)');
    console.log('   Kritik eksik yok, sistem çalışır durumda.');
    process.exit(0);
  } else {
    console.log('✅ DB\'LER SENKRON - Önemli fark yok.');
    process.exit(0);
  }

} catch (error) {
  console.error('❌ Hata:', error.message);
  console.log('\n💡 İpucu: Prisma kurulu mu? npm install prisma');
  process.exit(1);
}
