#!/usr/bin/env tsx
/**
 * Database Seed Script
 *
 * Creates initial data for development/testing.
 * Run with: npm run seed
 */

import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Create test users
    const testPassword = await hashPassword("test123");

    const testUsers = [
      {
        email: "admin@example.com",
        name: "Admin User",
        password: await hashPassword("admin123"),
        role: "admin",
      },
      {
        email: "user@example.com",
        name: "Test User",
        password: testPassword,
        role: "user",
      },
      {
        email: "demo@example.com",
        name: "Demo User",
        password: testPassword,
        role: "user",
      },
    ];

    for (const user of testUsers) {
      await db.insert(users).values(user).onConflictDoNothing();
      console.log(`✅ Created user: ${user.email}`);
    }

    console.log("");
    console.log("✅ Seed completed successfully!");
    console.log("");
    console.log("📝 Test Credentials:");
    console.log("   Admin: admin@example.com / admin123");
    console.log("   User:  user@example.com / test123");
    console.log("   Demo:  demo@example.com / test123");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
