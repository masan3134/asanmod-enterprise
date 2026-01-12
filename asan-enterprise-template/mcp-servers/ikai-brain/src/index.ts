/**
 * IKAI Brain System - Main Entry Point
 * Brain Daemon that learns from git commits and provides error solutions
 *
 * @module index
 * @version 1.0.0
 * @created 2025-12-13
 *
 * Features:
 * - SQLite-based knowledge store
 * - Git commit learning with BRAIN block parsing
 * - Error solution storage and retrieval
 * - Memory MCP synchronization
 * - HTTP API for agent queries
 */

import { initDatabase, closeDatabase, getBrainStats } from "./store/sqlite.js";
import { startServer } from "./api/server.js";
import {
  fullSync,
  incrementalSync,
  importFromMemoryMCP,
} from "./sync/memoryMcp.js";
import { learnFromRecentCommits } from "./learners/git.js";
import { runAutoImport } from "./auto-update/autoImport.js";

// Configuration
const PORT = parseInt(process.env.BRAIN_PORT || "8250", 10);
const PROJECT_ROOT =
  process.env.PROJECT_ROOT || "/home/root/projects/ikaicursor";

// Set project root for git commands
process.env.PROJECT_ROOT = PROJECT_ROOT;

// Set Memory MCP path if not set
if (!process.env.MEMORY_FILE_PATH) {
  process.env.MEMORY_FILE_PATH = `${PROJECT_ROOT}/.memory/memory.jsonl`;
}

/**
 * Graceful shutdown handler
 */
function setupShutdownHandlers(): void {
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    try {
      // Sync to Memory MCP before shutdown
      console.log("🔄 Final sync to Memory MCP...");
      const syncResult = await fullSync();
      if (syncResult.success) {
        console.log(
          `   → Final sync complete: ${syncResult.entities} entities, ${syncResult.observations} observations synced`
        );
      } else {
        console.error(
          `   ❌ Final sync failed: ${syncResult.error || "Unknown error"}`
        );
      }

      // Close database
      closeDatabase();

      console.log("✅ Brain Daemon shut down gracefully");
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

/**
 * Main startup function
 */
async function main(): Promise<void> {
  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  🧠 IKAI BRAIN DAEMON");
  console.log("  Persistent Learning System for AI Agents");
  console.log("  Version: 1.0.0");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("");

  try {
    // Step 1: Initialize SQLite database
    console.log("📦 Step 1/6: Initializing SQLite database...");
    initDatabase();

    // Step 2: Auto-import ASANMOD data (rules, MCPs, patterns, relations)
    console.log("🔄 Step 2/6: Auto-importing ASANMOD data...");
    const autoImportResult = await runAutoImport();
    if (autoImportResult.success && autoImportResult.imported) {
      console.log(
        `   → Auto-imported: ${autoImportResult.imported.rules} rules, ${autoImportResult.imported.mcps} MCPs, ${autoImportResult.imported.patterns} patterns, ${autoImportResult.imported.relations} relations`
      );
    } else {
      console.error(
        `   ⚠️  Auto-import failed: ${autoImportResult.error || "Unknown error"}`
      );
    }

    // Step 3: Import from existing Memory MCP
    console.log("📥 Step 3/6: Importing from Memory MCP...");
    const imported = importFromMemoryMCP();
    console.log(
      `   → ${imported.entities} entities, ${imported.observations} observations, ${imported.relations} relations`
    );

    // Step 4: Learn from recent commits
    console.log("📚 Step 4/6: Learning from recent git commits...");
    const learned = await learnFromRecentCommits(50);
    console.log(
      `   → ${learned.learned} commits learned, ${learned.errors} errors`
    );

    // Step 5: Start HTTP API server
    console.log("🌐 Step 5/6: Starting HTTP API server...");
    await startServer(PORT);

    // Step 6: Initial sync to Memory MCP
    console.log("🔄 Step 6/6: Syncing to Memory MCP...");
    const syncResult = await fullSync();
    console.log(
      `   → ${syncResult.entities} entities, ${syncResult.observations} observations synced`
    );

    // Setup shutdown handlers
    setupShutdownHandlers();

    // Auto-sync to Memory MCP: Incremental every 15 min, Full every 1 hour
    let syncCounter = 0;
    const INCREMENTAL_INTERVAL = 15 * 60 * 1000; // 15 minutes
    const FULL_SYNC_INTERVAL = 60 * 60 * 1000; // 1 hour
    const FULL_SYNC_COUNT = Math.floor(
      FULL_SYNC_INTERVAL / INCREMENTAL_INTERVAL
    ); // 4 times

    // Track sync status for persistence
    let lastSyncTime = Date.now();
    let syncIntervalId: NodeJS.Timeout | null = null;
    let consecutiveFailures = 0;
    const MAX_CONSECUTIVE_FAILURES = 3;

    const runSync = async (isFullSync: boolean) => {
      try {
        const syncType = isFullSync ? "FULL" : "INCREMENTAL";
        console.log(`🔄 Auto-sync (${syncType}): Syncing to Memory MCP...`);

        // Use incremental sync for performance, full sync every 4th time (1 hour)
        const syncResult = isFullSync
          ? await fullSync()
          : await incrementalSync();

        if (syncResult.success) {
          lastSyncTime = Date.now();
          consecutiveFailures = 0; // Reset failure counter on success
          console.log(
            `   → Auto-sync (${syncType}) complete: ${syncResult.entities} entities, ${syncResult.observations} observations synced in ${syncResult.duration}ms`
          );
        } else {
          consecutiveFailures++;
          console.error(
            `   ❌ Auto-sync (${syncType}) failed: ${syncResult.error || "Unknown error"}`
          );

          // If too many failures, retry with full sync
          if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
            console.log(
              `   ⚠️  ${consecutiveFailures} consecutive failures, attempting full sync recovery...`
            );
            setTimeout(async () => {
              try {
                console.log("🔄 Auto-sync recovery (FULL)...");
                const retryResult = await fullSync();
                if (retryResult.success) {
                  consecutiveFailures = 0;
                  lastSyncTime = Date.now();
                  console.log(
                    `   → Recovery successful: ${retryResult.entities} entities synced`
                  );
                } else {
                  console.error(
                    `   ❌ Recovery failed: ${retryResult.error || "Unknown error"}`
                  );
                }
              } catch (retryError) {
                console.error(
                  "❌ Auto-sync recovery error:",
                  retryError instanceof Error
                    ? retryError.message
                    : String(retryError)
                );
              }
            }, 300000); // 5 minutes = 300000 ms
          }
        }
      } catch (error) {
        consecutiveFailures++;
        console.error(
          "❌ Auto-sync error:",
          error instanceof Error ? error.message : String(error)
        );
      }
    };

    // Start auto-sync interval
    syncIntervalId = setInterval(async () => {
      syncCounter++;
      const isFullSync = syncCounter >= FULL_SYNC_COUNT;

      if (isFullSync) {
        syncCounter = 0; // Reset counter
      }

      await runSync(isFullSync);
    }, INCREMENTAL_INTERVAL);

    // Store interval ID for cleanup
    const autoSyncInterval = syncIntervalId;

    // Clear interval on shutdown
    const cleanupSync = () => {
      if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
        syncIntervalId = null;
      }
    };

    process.on("SIGTERM", cleanupSync);
    process.on("SIGINT", cleanupSync);

    // Log sync status on startup
    console.log(
      `   → Auto-sync configured: Incremental every ${INCREMENTAL_INTERVAL / 1000 / 60}min, Full every ${FULL_SYNC_INTERVAL / 1000 / 60}min`
    );

    // Print stats
    const stats = getBrainStats();
    console.log("");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  ✅ BRAIN DAEMON READY");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("");
    console.log("📊 Brain Statistics:");
    console.log(`   Entities:         ${stats.entities}`);
    console.log(`   Observations:     ${stats.observations}`);
    console.log(`   Relations:        ${stats.relations}`);
    console.log(`   Error Solutions:  ${stats.error_solutions}`);
    console.log(`   Git Commits:      ${stats.git_commits}`);
    console.log(`   Code Patterns:    ${stats.code_patterns}`);
    console.log(`   BRAIN Commits:    ${stats.brain_commits}`);
    console.log("");
    console.log("🔗 API Endpoints:");
    console.log(`   Health:           http://localhost:${PORT}/brain/health`);
    console.log(`   Stats:            http://localhost:${PORT}/brain/stats`);
    console.log(
      `   Find Solution:    http://localhost:${PORT}/brain/find-solution`
    );
    console.log(
      `   Learn Commit:     http://localhost:${PORT}/brain/learn-commit`
    );
    console.log(`   Query:            http://localhost:${PORT}/brain/query`);
    console.log(`   Patterns:         http://localhost:${PORT}/brain/patterns`);
    console.log(`   Sync:             http://localhost:${PORT}/brain/sync`);
    console.log("");
    console.log("🎯 Waiting for requests...");
    console.log("");
  } catch (error) {
    console.error("❌ Failed to start Brain Daemon:", error);
    process.exit(1);
  }
}

// Run
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
