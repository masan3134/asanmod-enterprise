#!/usr/bin/env tsx
/**
 * Create Admin User Script
 *
 * Creates an admin user for initial access.
 * Run with: npm run create-admin
 */

import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

async function createAdmin() {
  console.log("👤 Creating admin user...");

  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = "Admin User";

  try {
    // Check if admin already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      console.log("⚠️  Admin user already exists");
      console.log(`   Email: ${email}`);
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const [admin] = await db
      .insert(users)
      .values({
        email,
        name,
        password: hashedPassword,
        role: "admin",
      })
      .returning();

    console.log("✅ Admin user created successfully!");
    console.log("");
    console.log("📝 Admin Credentials:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log("");
    console.log("⚠️  Please change the password after first login!");
  } catch (error) {
    console.error("❌ Failed to create admin:", error);
    process.exit(1);
  }

  process.exit(0);
}

createAdmin();
