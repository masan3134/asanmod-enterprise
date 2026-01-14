import { db } from '../src/db';
import { users, todos } from '../src/db/schema/todos';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding development data...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await db.delete(todos);
  await db.delete(users);
  console.log('✅ Data cleared\n');

  // Create test users
  console.log('👤 Creating test users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);

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

  console.log(`✅ Created 2 users\n`);

  // Create sample todos
  console.log('📝 Creating sample todos...');
  await db.insert(todos).values([
    {
      userId: testUser.id,
      title: 'Buy groceries',
      completed: false,
    },
    {
      userId: testUser.id,
      title: 'Finish ASANMOD template improvements',
      completed: true,
    },
    {
      userId: testUser.id,
      title: 'Review agent feedback',
      completed: false,
    },
    {
      userId: adminUser.id,
      title: 'Check system logs',
      completed: false,
    },
  ]);
  console.log('✅ Created 4 todos\n');

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
