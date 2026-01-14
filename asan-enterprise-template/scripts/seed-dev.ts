import { db } from '../src/db';
import { users } from '../src/db/schema/users';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding development data...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data (Users Only)...');
  try {
    await db.delete(users);
    console.log('✅ Users cleared\n');
  } catch (e) {
    console.log('⚠️  Could not clear users (table might not exist yet), skipping...\n');
  }

  // Create test users
  console.log('👤 Creating test users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);

  try {
    const [testUser, adminUser] = await db.insert(users).values([
      {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
      },
      {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedAdminPassword,
      },
    ]).returning();

    console.log(`✅ Created 2 users: ${testUser.email}, ${adminUser.email}\n`);
  } catch (e) {
    console.error('❌ Failed to create users. Did you run npm run db:push first?\n', e);
    throw e;
  }

  // Universal Logic: Search for other tables to seed optionally
  // This makes the template extensible without breaking the seed script
  console.log('🔍 Checking for additional tables to seed...');

  // NOTE: Agents can add custom seeding logic below for their specific business logic (e.g., leads, products)
  // Example:
  // if (db.query.leads) { ... seed leads ... }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Test Accounts:');
  console.log('  👤 test@example.com  / password123 (User)');
  console.log('  👑 admin@example.com / admin123    (Admin)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

seed()
  .then(() => {
    console.log('✅ Seed complete!\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
