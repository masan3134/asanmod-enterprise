/**
 * IKAI Brain System - Auto-Import Module
 * Automatically imports ASANMOD data (rules, MCPs, patterns) on startup
 * and keeps them up-to-date
 *
 * @module auto-update/autoImport
 * @version 1.0.0
 * @created 2025-12-24
 */

import { initDatabase } from "../store/sqlite.js";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run ASANMOD data import script
 */
export function autoImportASANMODData(): {
  success: boolean;
  rules?: number;
  mcps?: number;
  patterns?: number;
  error?: string;
} {
  try {
    const scriptPath = join(__dirname, "../../scripts/import-asanmod-data.ts");

    console.log("🔄 Auto-import: Running ASANMOD data import...");

    // Run import script
    const output = execSync(`node --loader ts-node/esm "${scriptPath}"`, {
      cwd: join(__dirname, "../.."),
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });

    // Parse output to extract counts
    const rulesMatch = output.match(/Rules:\s+(\d+)\/(\d+)/);
    const mcpsMatch = output.match(/MCPs:\s+(\d+)\/(\d+)/);
    const asanmodPatternsMatch = output.match(
      /ASANMOD Patterns:\s+(\d+)\/(\d+)/
    );
    const ikaiPatternsMatch = output.match(/IKAI Patterns:\s+(\d+)\/(\d+)/);

    const rules = rulesMatch ? parseInt(rulesMatch[1]) : 0;
    const mcps = mcpsMatch ? parseInt(mcpsMatch[1]) : 0;
    const asanmodPatterns = asanmodPatternsMatch
      ? parseInt(asanmodPatternsMatch[1])
      : 0;
    const ikaiPatterns = ikaiPatternsMatch ? parseInt(ikaiPatternsMatch[1]) : 0;
    const totalPatterns = asanmodPatterns + ikaiPatterns;

    console.log(
      `   → Imported: ${rules} rules, ${mcps} MCPs, ${totalPatterns} patterns`
    );

    return {
      success: true,
      rules,
      mcps,
      patterns: totalPatterns,
    };
  } catch (error: any) {
    console.error(`   ❌ Auto-import failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Run relations population script
 */
export function autoPopulateRelations(): {
  success: boolean;
  relations?: number;
  error?: string;
} {
  try {
    const scriptPath = join(__dirname, "../../scripts/populate-relations.ts");

    console.log("🔄 Auto-import: Populating relations...");

    // Run populate script
    const output = execSync(`node --loader ts-node/esm "${scriptPath}"`, {
      cwd: join(__dirname, "../.."),
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });

    // Parse output to extract relation count
    const addedMatch = output.match(/Added:\s+(\d+)/);
    const relations = addedMatch ? parseInt(addedMatch[1]) : 0;

    console.log(`   → Populated: ${relations} relations`);

    return {
      success: true,
      relations,
    };
  } catch (error: any) {
    console.error(`   ❌ Auto-populate relations failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check if auto-import is needed (by checking last import time or data freshness)
 */
export function shouldAutoImport(): boolean {
  // For now, always import on startup
  // In future, could check last import time or data freshness
  return true;
}

/**
 * Main auto-import function
 */
export async function runAutoImport(): Promise<{
  success: boolean;
  imported?: {
    rules: number;
    mcps: number;
    patterns: number;
    relations: number;
  };
  error?: string;
}> {
  if (!shouldAutoImport()) {
    return {
      success: true,
      imported: {
        rules: 0,
        mcps: 0,
        patterns: 0,
        relations: 0,
      },
    };
  }

  console.log("🔄 Auto-import: Starting automatic data import...");

  // Import ASANMOD data
  const importResult = autoImportASANMODData();
  if (!importResult.success) {
    return {
      success: false,
      error: `ASANMOD data import failed: ${importResult.error}`,
    };
  }

  // Populate relations
  const relationsResult = autoPopulateRelations();
  if (!relationsResult.success) {
    return {
      success: false,
      error: `Relations population failed: ${relationsResult.error}`,
    };
  }

  return {
    success: true,
    imported: {
      rules: importResult.rules || 0,
      mcps: importResult.mcps || 0,
      patterns: importResult.patterns || 0,
      relations: relationsResult.relations || 0,
    },
  };
}
