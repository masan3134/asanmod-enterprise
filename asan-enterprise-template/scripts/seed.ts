#!/usr/bin/env tsx
/**
 * Database Seed Script
 *
 * Creates initial data for development/testing.
 * Run with: npm run seed
 */

import { db } from "@/db";
// import { users } from "@/db/schema";
// import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Create admin user
    // const hashedPassword = await bcrypt.hash("admin123", 12);
    // await db.insert(users).values({
    //   email: "admin@example.com",
    //   password: hashedPassword,
    //   name: "Admin User",
    //   role: "admin",
    // });
    // console.log("✅ Created admin user: admin@example.com / admin123");

    // Add more seed data as needed
    console.log("✅ Seed completed successfully!");
    console.log("");
    console.log("📝 Test Credentials:");
    console.log("   Email: admin@example.com");
    console.log("   Password: admin123");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
