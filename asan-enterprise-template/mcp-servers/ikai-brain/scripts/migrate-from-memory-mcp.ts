/**
 * IKAI Brain System - Migration Script
 * Migrates existing Memory MCP data to SQLite
 *
 * @module scripts/migrate-from-memory-mcp
 * @version 1.0.0
 * @created 2025-12-13
 *
 * Usage: npx tsx scripts/migrate-from-memory-mcp.ts
 */

import { initDatabase, getBrainStats } from "../src/store/sqlite.js";
import {
  importFromMemoryMCP,
  getMemoryMCPPath,
} from "../src/sync/memoryMcp.js";

async function main(): Promise<void> {
  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  🧠 IKAI BRAIN - Memory MCP Migration");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("");

  // Check Memory MCP path
  const memoryPath = getMemoryMCPPath();
  if (!memoryPath) {
    console.error("❌ Memory MCP file not found!");
    console.log("Searched paths:");
    console.log("  - /root/.npm/_npx/.../memory.jsonl");
    console.log("  - .memory/memory.jsonl");
    process.exit(1);
  }

  console.log(`📂 Memory MCP found: ${memoryPath}`);
  console.log("");

  // Initialize database
  console.log("📦 Initializing SQLite database...");
  initDatabase();

  // Get stats before migration
  const statsBefore = getBrainStats();
  console.log("");
  console.log("📊 Database before migration:");
  console.log(`   Entities:     ${statsBefore.entities}`);
  console.log(`   Observations: ${statsBefore.observations}`);
  console.log(`   Relations:    ${statsBefore.relations}`);
  console.log("");

  // Run migration
  console.log("🔄 Migrating from Memory MCP...");
  const result = importFromMemoryMCP();
  console.log("");

  // Get stats after migration
  const statsAfter = getBrainStats();
  console.log("📊 Database after migration:");
  console.log(
    `   Entities:     ${statsAfter.entities} (+${statsAfter.entities - statsBefore.entities})`
  );
  console.log(
    `   Observations: ${statsAfter.observations} (+${statsAfter.observations - statsBefore.observations})`
  );
  console.log(
    `   Relations:    ${statsAfter.relations} (+${statsAfter.relations - statsBefore.relations})`
  );
  console.log("");

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  ✅ MIGRATION COMPLETE");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("");
  console.log("Summary:");
  console.log(`  - Imported ${result.entities} entities`);
  console.log(`  - Imported ${result.observations} observations`);
  console.log(`  - Imported ${result.relations} relations`);
  console.log("");
  console.log("Next steps:");
  console.log(
    "  1. Build Brain Daemon: cd mcp-servers/ikai-brain && npm run build"
  );
  console.log("  2. Start Brain Daemon: pm2 start ikai-brain");
  console.log("  3. Test API: curl http://localhost:8250/brain/health");
  console.log("");
}

main().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
