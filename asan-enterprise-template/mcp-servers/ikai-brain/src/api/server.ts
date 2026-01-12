/**
 * IKAI Brain System - HTTP API Server
 * Provides REST API endpoints for Brain operations
 *
 * @module api/server
 * @version 1.0.0
 * @created 2025-12-13
 */

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import {
  getBrainStats,
  searchEntities,
  getAllPatterns,
  searchPatterns,
  getRecentCommits,
  getBrainCommits,
  findSimilarErrors,
  getLastSync,
  searchCommits,
  addRule,
  getRules,
  getRuleById,
  addMcp,
  getMcps,
  getMcpByName,
  getRelations,
  Rule,
  MCP,
} from "../store/sqlite.js";
import { getMemoryMCPPath, readMemoryMCP } from "../sync/memoryMcp.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { learnFromCommit, learnFromRecentCommits } from "../learners/git.js";
import {
  findSolution,
  learnFromError,
  markSolutionResult,
  autoSuggestSolution,
} from "../learners/error.js";
import { fullSync, incrementalSync } from "../sync/memoryMcp.js";
import {
  checkPatternStatus,
  getPatternsNeedingAttention,
  getPatternSummaryForAgents,
} from "../auto-update/patternChecker.js";
import {
  QUALITY_RULES,
  PRETTIER_SETTINGS,
  generatePreWriteChecklist,
  getQualityRulesForContext,
  getCommonErrors,
} from "../data/quality-rules.js";
import {
  validateCode,
  generateSuggestions,
} from "../validators/code-quality.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Parse JSON strings in commit objects for cleaner responses
 */
function formatCommit(commit: any): any {
  if (!commit) return commit;

  const formatted = { ...commit };

  // Parse JSON string fields
  const jsonFields = [
    "files_changed",
    "tags",
    "brain_block",
    "solution_files",
    "solution_steps",
  ];
  for (const field of jsonFields) {
    if (typeof formatted[field] === "string") {
      try {
        formatted[field] = JSON.parse(formatted[field]);
      } catch {
        // Keep as string if not valid JSON
      }
    }
  }

  // Convert SQLite boolean (0/1) to JS boolean
  if ("has_brain_block" in formatted) {
    formatted.has_brain_block = Boolean(formatted.has_brain_block);
  }
  if ("is_breaking" in formatted) {
    formatted.is_breaking = Boolean(formatted.is_breaking);
  }

  return formatted;
}

/**
 * Format array of commits
 */
function formatCommits(commits: any[]): any[] {
  return commits.map(formatCommit);
}

/**
 * Format error solution for response
 */
function formatSolution(solution: any): any {
  if (!solution) return solution;

  const formatted = { ...solution };

  // Parse JSON string fields
  const jsonFields = ["solution_files", "solution_steps", "tags"];
  for (const field of jsonFields) {
    if (typeof formatted[field] === "string") {
      try {
        formatted[field] = JSON.parse(formatted[field]);
      } catch {
        // Keep as string if not valid JSON
      }
    }
  }

  return formatted;
}

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ========================================
// HEALTH & STATS ENDPOINTS
// ========================================

/**
 * GET /brain/health
 * Health check endpoint
 */
app.get("/brain/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "ikai-brain",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /brain/stats
 * Get database statistics
 */
app.get("/brain/stats", (_req: Request, res: Response) => {
  try {
    const stats = getBrainStats();
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /brain/metrics
 * Get comprehensive system metrics
 */
app.get("/brain/metrics", (req: Request, res: Response) => {
  try {
    const startTime = process.hrtime();
    const stats = getBrainStats();
    const [seconds, nanoseconds] = process.hrtime(startTime);

    // Get database size
    const dbPath = join(__dirname, "..", "..", "data", "ikai-brain.db");
    let dbSizeMb = 0;
    try {
      const { statSync } = require("fs");
      const dbStats = statSync(dbPath);
      dbSizeMb = Math.round((dbStats.size / 1024 / 1024) * 100) / 100;
    } catch (e) {
      // Ignore if file doesn't exist
    }

    res.json({
      success: true,
      metrics: {
        uptime_seconds: Math.round(process.uptime()),
        memory_usage_mb: Math.round(
          process.memoryUsage().heapUsed / 1024 / 1024
        ),
        cpu_usage_percent:
          Math.round((process.cpuUsage().user / 1000000) * 100) / 100,

        database: {
          entities: stats.entities || 0,
          error_solutions: stats.error_solutions || 0,
          git_commits: stats.git_commits || 0,
          patterns: stats.code_patterns || 0,
          size_mb: dbSizeMb,
        },

        performance: {
          last_query_ms: Math.round(seconds * 1000 + nanoseconds / 1000000),
          queries_per_minute: 0, // Rate tracking not implemented yet
          avg_response_time_ms: 0, // Response time tracking not implemented yet
        },

        health: {
          status: "healthy",
          last_sync: stats.last_sync || null,
          last_error: null, // Error tracking not implemented yet
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// ========================================
// LEARNING ENDPOINTS
// ========================================

/**
 * POST /brain/learn-commit
 * Learn from a git commit
 */
app.post("/brain/learn-commit", async (req: Request, res: Response) => {
  try {
    const { commitHash } = req.body;

    if (!commitHash) {
      return res.status(400).json({
        success: false,
        error: "commitHash is required",
      });
    }

    const result = await learnFromCommit(commitHash);
    res.json({
      success: result.success,
      message: result.message,
      commit: formatCommit(result.commit),
      brainBlock: result.brainBlock,
      errorSolution: result.errorSolution
        ? formatSolution(result.errorSolution)
        : undefined,
      pattern: result.pattern,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * POST /brain/learn-recent
 * Learn from recent commits
 */
app.post("/brain/learn-recent", async (req: Request, res: Response) => {
  try {
    const { count = 20 } = req.body;
    const result = await learnFromRecentCommits(count);
    res.json({
      success: true,
      learned: result.learned,
      errors: result.errors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * POST /brain/learn-error
 * Store a new error solution
 */
app.post("/brain/learn-error", (req: Request, res: Response) => {
  try {
    const {
      error,
      solution,
      solutionCode,
      filesChanged,
      steps,
      pattern,
      tags,
      commitHash,
    } = req.body;

    if (!error?.errorMessage || !solution) {
      return res.status(400).json({
        success: false,
        error: "error.errorMessage and solution are required",
      });
    }

    const result = learnFromError(error, solution, {
      solutionCode,
      filesChanged,
      steps,
      pattern,
      tags,
      commitHash,
    });

    res.json({
      success: true,
      id: result.id,
      pattern: result.pattern,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// ========================================
// QUERY ENDPOINTS
// ========================================

/**
 * GET /brain/find-solution
 * Find solution for an error
 */
app.get("/brain/find-solution", (req: Request, res: Response) => {
  try {
    const { error, errorType, stackTrace, filePath } = req.query;

    if (!error) {
      return res.status(400).json({
        success: false,
        error: "error query parameter is required",
      });
    }

    const result = findSolution({
      errorMessage: String(error),
      errorType: errorType ? String(errorType) : undefined,
      stackTrace: stackTrace ? String(stackTrace) : undefined,
      filePath: filePath ? String(filePath) : undefined,
    });

    // Format solutions in response
    const formatted = { ...result };
    if (formatted.solutions) {
      formatted.solutions = formatted.solutions.map(formatSolution);
    }

    res.json({
      success: true,
      ...formatted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * POST /brain/find-solution
 * Find solution for an error (POST version for complex queries)
 */
app.post("/brain/find-solution", (req: Request, res: Response) => {
  try {
    const { errorMessage, errorType, stackTrace, filePath } = req.body;

    if (!errorMessage) {
      return res.status(400).json({
        success: false,
        error: "errorMessage is required",
      });
    }

    const result = findSolution({
      errorMessage,
      errorType,
      stackTrace,
      filePath,
    });

    // Format solutions in response
    const formatted = { ...result };
    if (formatted.solutions) {
      formatted.solutions = formatted.solutions.map(formatSolution);
    }

    res.json({
      success: true,
      ...formatted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /brain/auto-suggest
 * Auto-suggest solution for common errors
 */
app.get("/brain/auto-suggest", (req: Request, res: Response) => {
  try {
    const { error } = req.query;

    if (!error) {
      return res.status(400).json({
        success: false,
        error: "error query parameter is required",
      });
    }

    const result = autoSuggestSolution({
      errorMessage: String(error),
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * POST /brain/mark-solution
 * Mark a solution as successful or failed
 */
app.post("/brain/mark-solution", (req: Request, res: Response) => {
  try {
    const { solutionId, success } = req.body;

    if (typeof solutionId !== "number" || typeof success !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "solutionId (number) and success (boolean) are required",
      });
    }

    markSolutionResult(solutionId, success);

    res.json({
      success: true,
      message: `Solution #${solutionId} marked as ${success ? "successful" : "failed"}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /brain/query
 * Query knowledge base
 * @param q - Search query
 * @param type - Filter by type: all, entities, patterns, solutions, commits
 * @param limit - Max results per category (default: 10)
 */
app.get("/brain/query", (req: Request, res: Response) => {
  try {
    const { q, type = "all", limit = "10" } = req.query;

    if (!q || String(q).trim() === "") {
      return res.status(400).json({
        success: false,
        error: "q (query) parameter is required and cannot be empty",
      });
    }

    // Normalize query string
    const rawQuery = String(q).trim();
    if (rawQuery.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Query cannot be empty",
      });
    }

    const searchLimit = Math.max(
      1,
      Math.min(parseInt(String(limit), 10) || 10, 100)
    ); // Clamp between 1-100
    const queryType = String(type).toLowerCase();
    const queryString = rawQuery; // Use normalized query

    const results: {
      entities?: any[];
      patterns?: any[];
      solutions?: any[];
      commits?: any[];
      relations?: any[];
    } = {};

    // Search based on type (with comprehensive error handling)
    if (queryType === "all" || queryType === "entities") {
      try {
        const entitiesResult = searchEntities(queryString, searchLimit);
        results.entities = Array.isArray(entitiesResult) ? entitiesResult : [];
      } catch (error) {
        console.error("Error searching entities:", error);
        results.entities = [];
      }
    }

    if (queryType === "all" || queryType === "patterns") {
      try {
        const patternsResult = searchPatterns(queryString, searchLimit);
        results.patterns = Array.isArray(patternsResult) ? patternsResult : [];
      } catch (error) {
        console.error("Error searching patterns:", error);
        results.patterns = [];
      }
    }

    if (queryType === "all" || queryType === "solutions") {
      try {
        const solutionsResult = findSimilarErrors(queryString, searchLimit);
        results.solutions = Array.isArray(solutionsResult)
          ? solutionsResult
          : [];
      } catch (error) {
        console.error("Error searching solutions:", error);
        results.solutions = [];
      }
    }

    if (queryType === "all" || queryType === "commits") {
      try {
        // Search commits by hash, message, or module
        const commitsResult = searchCommits(queryString, searchLimit);
        const formattedCommits = formatCommits(commitsResult);
        results.commits = Array.isArray(formattedCommits)
          ? formattedCommits
          : [];
      } catch (error) {
        console.error("Error searching commits:", error);
        results.commits = [];
      }
    }

    if (queryType === "all" || queryType === "relations") {
      try {
        // Search relations by entity name
        // First find entities matching the query
        const matchingEntities = searchEntities(queryString, searchLimit);
        const relations: any[] = [];
        const entityIds = new Set<string>();

        // Collect all matching entity IDs
        for (const entity of matchingEntities) {
          entityIds.add(entity.id);
        }

        // If no entities found, try direct entity lookup
        if (entityIds.size === 0) {
          // Try to find entity by exact ID match
          const directEntity = searchEntities(queryString, 1);
          if (directEntity.length > 0) {
            entityIds.add(directEntity[0].id);
          }
        }

        // Get relations for all matching entities
        for (const entityId of entityIds) {
          try {
            const entityRelations = getRelations(entityId);
            relations.push(...entityRelations);
          } catch (error) {
            console.error(`Error getting relations for ${entityId}:`, error);
          }
        }

        // Remove duplicates (same from/to/type combination)
        const uniqueRelations = relations.filter(
          (rel, index, self) =>
            index ===
            self.findIndex(
              (r) =>
                r.from_entity === rel.from_entity &&
                r.to_entity === rel.to_entity &&
                r.relation_type === rel.relation_type
            )
        );

        results.relations = uniqueRelations.slice(0, searchLimit);
      } catch (error) {
        console.error("Error searching relations:", error);
        results.relations = [];
      }
    }

    // Format solutions (with null check and error handling)
    if (
      results.solutions &&
      Array.isArray(results.solutions) &&
      results.solutions.length > 0
    ) {
      results.solutions = results.solutions.map((sol: any) => {
        try {
          return formatSolution(sol);
        } catch (error) {
          console.error("Error formatting solution:", error);
          return sol; // Return original if formatting fails
        }
      });
    }

    // Ensure all result arrays are arrays (null safety)
    results.entities = Array.isArray(results.entities) ? results.entities : [];
    results.patterns = Array.isArray(results.patterns) ? results.patterns : [];
    results.solutions = Array.isArray(results.solutions)
      ? results.solutions
      : [];
    results.commits = Array.isArray(results.commits) ? results.commits : [];
    results.relations = Array.isArray(results.relations)
      ? results.relations
      : [];

    // Calculate total results
    const totalResults =
      (results.entities?.length || 0) +
      (results.patterns?.length || 0) +
      (results.solutions?.length || 0) +
      (results.commits?.length || 0) +
      (results.relations?.length || 0);

    // Always return success with results (even if empty)
    res.json({
      success: true,
      query: queryString,
      type: queryType || "all",
      results,
      totalResults: totalResults,
    });
  } catch (error) {
    console.error("Query API error:", error);
    res.status(500).json({
      success: false,
      error: String(error),
      message: "Internal server error while processing query",
    });
  }
});

// ========================================
// PATTERN UPDATE ENDPOINTS (MUST BE BEFORE /brain/patterns)
// ========================================

/**
 * GET /brain/api/pattern-status
 * Get pattern update status (for agents)
 * Returns: current, new, updated, missing patterns
 */
app.get("/brain/api/pattern-status", (req: Request, res: Response) => {
  try {
    const report = checkPatternStatus();
    res.json({
      success: true,
      ...report,
    });
  } catch (error: any) {
    console.error("Error in /brain/patterns/status:", error);
    res.status(500).json({
      success: false,
      error: error?.message || String(error),
    });
  }
});

/**
 * GET /brain/api/pattern-check
 * Check for pattern updates (quick summary for agents)
 */
app.get("/brain/api/pattern-check", (req: Request, res: Response) => {
  console.log("✅ Route /brain/api/pattern-check called");
  try {
    const summary = getPatternSummaryForAgents();
    console.log("✅ Pattern summary:", summary);
    res.json({
      success: true,
      ...summary,
    });
  } catch (error: any) {
    console.error("❌ Error in /brain/pattern-check:", error);
    res.status(500).json({
      success: false,
      error: error?.message || String(error),
    });
  }
});

/**
 * GET /brain/api/pattern-attention
 * Get patterns that need attention (new, updated, missing)
 */
app.get("/brain/api/pattern-attention", (req: Request, res: Response) => {
  try {
    const patterns = getPatternsNeedingAttention();
    res.json({
      success: true,
      count: patterns.length,
      patterns,
    });
  } catch (error: any) {
    console.error("Error in /brain/patterns/needing-attention:", error);
    res.status(500).json({
      success: false,
      error: error?.message || String(error),
    });
  }
});

/**
 * GET /brain/patterns
 * Get all patterns or search patterns
 * Query params:
 *   - q: search query
 *   - limit: result limit
 *   - action: check|status|attention (pattern update checks)
 */
app.get("/brain/patterns", (req: Request, res: Response) => {
  try {
    const { q, limit = "20", action } = req.query;

    // Pattern update check endpoints via query param
    if (action === "check") {
      const summary = getPatternSummaryForAgents();
      return res.json({
        success: true,
        ...summary,
      });
    }

    if (action === "status") {
      const report = checkPatternStatus();
      return res.json({
        success: true,
        ...report,
      });
    }

    if (action === "attention") {
      const patterns = getPatternsNeedingAttention();
      return res.json({
        success: true,
        count: patterns.length,
        patterns,
      });
    }

    // Default: search/list patterns
    const searchLimit = parseInt(String(limit), 10);

    let patterns;
    if (q) {
      patterns = searchPatterns(String(q), searchLimit);
    } else {
      patterns = getAllPatterns();
    }

    res.json({
      success: true,
      count: patterns.length,
      patterns,
    });
  } catch (error: any) {
    console.error("Error in /brain/patterns:", error);
    res.status(500).json({
      success: false,
      error: error?.message || String(error),
    });
  }
});

// ========================================
// RULES ENDPOINTS
// ========================================

/**
 * GET /brain/rules
 * Get all rules or filter by category
 * @param category - Filter by category: altin, zorunlu, onemli
 */
app.get("/brain/rules", (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const rules = getRules(category ? String(category) : undefined);

    res.json({
      success: true,
      count: rules.length,
      rules,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /brain/rules/:id
 * Get a specific rule by ID
 */
app.get("/brain/rules/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rule = getRuleById(id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        error: `Rule '${id}' not found`,
      });
    }

    res.json({
      success: true,
      rule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * POST /brain/rules
 * Add a new rule
 */
app.post("/brain/rules", (req: Request, res: Response) => {
  try {
    const ruleData: Rule = req.body;

    if (!ruleData.id || !ruleData.name || !ruleData.content) {
      return res.status(400).json({
        success: false,
        error: "id, name, and content are required",
      });
    }

    // Set defaults
    if (!ruleData.category) ruleData.category = "onemli";
    if (!ruleData.priority) ruleData.priority = 100;
    if (ruleData.is_mandatory === undefined) ruleData.is_mandatory = false;

    const rule = addRule(ruleData);

    res.json({
      success: true,
      message: `Rule '${rule.id}' added successfully`,
      rule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * POST /brain/import/rules
 * Import multiple rules at once
 */
app.post("/brain/import/rules", (req: Request, res: Response) => {
  try {
    const { rules } = req.body;

    if (!Array.isArray(rules) || rules.length === 0) {
      return res.status(400).json({
        success: false,
        error: "rules array is required",
      });
    }

    const imported: string[] = [];
    const errors: { id: string; error: string }[] = [];

    for (const ruleData of rules) {
      try {
        if (!ruleData.id || !ruleData.name || !ruleData.content) {
          errors.push({
            id: ruleData.id || "unknown",
            error: "Missing required fields",
          });
          continue;
        }

        // Set defaults
        if (!ruleData.category) ruleData.category = "onemli";
        if (!ruleData.priority) ruleData.priority = 100;
        if (ruleData.is_mandatory === undefined) ruleData.is_mandatory = false;

        addRule(ruleData);
        imported.push(ruleData.id);
      } catch (err) {
        errors.push({ id: ruleData.id || "unknown", error: String(err) });
      }
    }

    res.json({
      success: errors.length === 0,
      imported: imported.length,
      errors: errors.length,
      importedIds: imported,
      errorDetails: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// ========================================
// MCP ENDPOINTS
// ========================================

/**
 * GET /brain/mcps
 * Get all MCPs or filter by mandatory
 * @param mandatory - Filter mandatory MCPs only (true/false)
 */
app.get("/brain/mcps", (req: Request, res: Response) => {
  try {
    const { mandatory } = req.query;

    const mandatoryOnly = String(mandatory).toLowerCase() === "true";
    const mcps = getMcps(mandatoryOnly);

    res.json({
      success: true,
      count: mcps.length,
      mcps,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /brain/mcps/:name
 * Get a specific MCP by name
 */
app.get("/brain/mcps/:name", (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    const mcp = getMcpByName(name);

    if (!mcp) {
      return res.status(404).json({
        success: false,
        error: `MCP '${name}' not found`,
      });
    }

    res.json({
      success: true,
      mcp,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * POST /brain/mcps
 * Add a new MCP
 */
app.post("/brain/mcps", (req: Request, res: Response) => {
  try {
    const mcpData: MCP = req.body;

    if (!mcpData.id || !mcpData.name || !mcpData.description) {
      return res.status(400).json({
        success: false,
        error: "id, name, and description are required",
      });
    }

    // Set defaults
    if (mcpData.is_mandatory === undefined) mcpData.is_mandatory = false;

    const mcp = addMcp(mcpData);

    res.json({
      success: true,
      message: `MCP '${mcp.id}' added successfully`,
      mcp,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * POST /brain/import/mcps
 * Import multiple MCPs at once
 */
app.post("/brain/import/mcps", (req: Request, res: Response) => {
  try {
    const { mcps } = req.body;

    if (!Array.isArray(mcps) || mcps.length === 0) {
      return res.status(400).json({
        success: false,
        error: "mcps array is required",
      });
    }

    const imported: string[] = [];
    const errors: { id: string; error: string }[] = [];

    for (const mcpData of mcps) {
      try {
        if (!mcpData.id || !mcpData.name || !mcpData.description) {
          errors.push({
            id: mcpData.id || "unknown",
            error: "Missing required fields",
          });
          continue;
        }

        // Set defaults
        if (mcpData.is_mandatory === undefined) mcpData.is_mandatory = false;

        addMcp(mcpData);
        imported.push(mcpData.id);
      } catch (err) {
        errors.push({ id: mcpData.id || "unknown", error: String(err) });
      }
    }

    res.json({
      success: errors.length === 0,
      imported: imported.length,
      errors: errors.length,
      importedIds: imported,
      errorDetails: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /brain/commits
 * Get recent commits
 */
app.get("/brain/commits", (req: Request, res: Response) => {
  try {
    const { limit = "20", brainOnly = "false" } = req.query;
    const searchLimit = parseInt(String(limit), 10);
    const onlyBrain = String(brainOnly).toLowerCase() === "true";

    const rawCommits = onlyBrain
      ? getBrainCommits(searchLimit)
      : getRecentCommits(searchLimit);

    const commits = formatCommits(rawCommits);

    res.json({
      success: true,
      count: commits.length,
      commits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// ========================================
// SYNC ENDPOINTS
// ========================================

/**
 * POST /brain/sync
 * Trigger Memory MCP sync
 */
app.post("/brain/sync", async (req: Request, res: Response) => {
  try {
    const { type = "full" } = req.body;

    let result;
    if (type === "incremental") {
      result = await incrementalSync();
    } else {
      result = await fullSync();
    }

    res.json({
      type,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /brain/sync/status
 * Get last sync status
 */
app.get("/brain/sync/status", (_req: Request, res: Response) => {
  try {
    const lastSync = getLastSync();
    res.json({
      success: true,
      lastSync,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /brain/memory-mcp/health
 * Get Memory MCP health status
 */
app.get("/brain/memory-mcp/health", (_req: Request, res: Response) => {
  try {
    const memoryPath = getMemoryMCPPath();
    const memoryData = readMemoryMCP();
    const lastSync = getLastSync();

    const entityCount = memoryData.filter((d) => d.type === "entity").length;
    const relationCount = memoryData.filter(
      (d) => d.type === "relation"
    ).length;
    const observationCount = memoryData
      .filter((d) => d.type === "entity")
      .reduce((acc, d) => acc + ((d as any).observations?.length || 0), 0);

    res.json({
      success: true,
      health: {
        memoryMCPPath: memoryPath || null,
        fileExists: memoryPath !== null,
        entityCount,
        relationCount,
        observationCount,
        totalLines: memoryData.length,
        lastSync: lastSync
          ? {
              syncedAt: lastSync.synced_at,
              status: lastSync.status,
              entitiesSynced: lastSync.entities_synced,
              observationsSynced: lastSync.observations_synced,
            }
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// ========================================
// SESSION AUDIT ENDPOINTS (v2.3)
// ========================================

/**
 * POST /brain/session-audit
 * Record session audit for MCP usage tracking
 */
app.post("/brain/session-audit", (req: Request, res: Response) => {
  try {
    const { summary, timestamp, recommendations } = req.body;

    // Log the session audit
    console.log(`[AUDIT] ${timestamp}: ${summary || "No summary"}`);
    console.log(`[AUDIT] Recommendations: ${JSON.stringify(recommendations)}`);

    res.json({
      success: true,
      message: "Session audit recorded",
      timestamp,
      mcpReminder: {
        rule: "MCP-First v2.3",
        message: "Shell komutları yerine MCP tool'larını kullan",
        mapping: "docs/workflow/MCP-TOOL-MAPPING.md",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// ========================================
// CODE QUALITY ENDPOINTS (v2.2)
// ========================================

/**
 * GET /brain/code-quality-check
 * Get quality rules and checklist before writing code
 * @param fileType - ts, tsx, js, jsx
 * @param context - frontend, backend
 */
app.get("/brain/code-quality-check", (req: Request, res: Response) => {
  try {
    const { fileType, context } = req.query;

    const ft = String(fileType || "ts");
    const ctx = String(context || "frontend");

    // Get quality rules for context
    const qualityRules = getQualityRulesForContext(ft, ctx);

    // Generate pre-write checklist
    const checklist = generatePreWriteChecklist(ft, ctx);

    // Get common errors for file type
    const commonErrors = getCommonErrors(ft, ctx);

    // Get prettier settings for context
    const prettierSettings =
      ctx === "frontend"
        ? PRETTIER_SETTINGS.frontend
        : PRETTIER_SETTINGS.backend;

    res.json({
      success: true,
      fileType: ft,
      context: ctx,
      rules: qualityRules,
      checklist,
      commonErrors,
      prettierSettings,
      criticalReminders: [
        "NO escape characters in template literals (no backslash asterisk)",
        "Run npm run lint before commit - must be 0 errors, 0 warnings",
        "--no-verify is FORBIDDEN",
        "Match existing code style exactly",
      ],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * POST /brain/validate-code
 * Validate code for quality issues
 * @body code - The code to validate
 * @body fileType - ts, tsx, js, jsx
 * @body context - frontend, backend (optional)
 */
app.post("/brain/validate-code", (req: Request, res: Response) => {
  try {
    const { code, fileType, context } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "code is required",
      });
    }

    const ft = String(fileType || "ts");
    const ctx = String(context || "frontend");

    // Get prettier settings for context
    const prettierSettings =
      ctx === "frontend"
        ? PRETTIER_SETTINGS.frontend
        : PRETTIER_SETTINGS.backend;

    // Validate code
    const issues = validateCode(code, ft, prettierSettings);

    // Generate suggestions
    const suggestions = generateSuggestions(issues);

    res.json({
      success: issues.length === 0,
      fileType: ft,
      context: ctx,
      issueCount: issues.length,
      issues,
      suggestions,
      qualityScore: Math.max(0, 100 - issues.length * 10),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /brain/quality-rules
 * Get all code quality rules (v2.2)
 */
app.get("/brain/quality-rules", (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      version: "2.2",
      count: QUALITY_RULES.length,
      rules: QUALITY_RULES,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// ========================================
// ASANMOD VERSION ENDPOINTS (v2.4)
// ========================================

// Files that contain ASANMOD version information
// Updated: 2025-12-24 - Added doc files and updated fields
const VERSION_FILES = [
  { path: ".cursorrules", fields: ["version", "tool_count"] },
  { path: ".cursor/rules/ikai.mdc", fields: ["version", "date", "tool_count"] },
  {
    path: "docs/workflow/ASANMOD-MASTER.md",
    fields: ["version", "date", "tool_count"],
  },
  {
    path: "docs/workflow/ASANMOD-REFERENCE-INDEX.md",
    fields: ["version", "date"],
  },
  {
    path: "docs/xx/MOD-BASLATMA-PROMPT.txt",
    fields: ["version", "tool_count"],
  },
  { path: "CURSOR.md", fields: ["version", "date"] },
  { path: "README.md", fields: ["version", "date"] },
  { path: "mcp-servers/asanmod-mcp/README.md", fields: ["version", "date"] },
  { path: "mcp-servers/ikai-brain/README.md", fields: ["version", "date"] },
  {
    path: "mcp-servers/ikai-brain/scripts/import-asanmod-data.ts",
    fields: ["tool_count", "date"],
  },
  { path: ".git/hooks/pre-commit", fields: ["version"] },
  { path: ".git/hooks/post-commit", fields: ["version"] },
  { path: "docs/ASANMOD-QUICK-START.md", fields: ["version", "date"] },
  { path: "docs/ASANMOD-UNIVERSAL-TEMPLATE.md", fields: ["version", "date"] },
  {
    path: "docs/ASANMOD-UNIVERSAL-REDDIT-GUIDE.md",
    fields: ["version", "date"],
  },
  { path: "docs/QUICKSTART.md", fields: ["version", "date"] },
];

import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const PROJECT_ROOT =
  process.env.PROJECT_ROOT || "/home/root/projects/ikaicursor";

interface FileStatus {
  file: string;
  exists: boolean;
  version?: string;
  toolCount?: number;
  date?: string;
  status: "ok" | "outdated" | "missing" | "error";
  errors?: string[];
}

/**
 * Extract version information from file content
 */
function extractVersionInfo(
  filePath: string,
  content: string
): { version?: string; toolCount?: number; date?: string } {
  const result: { version?: string; toolCount?: number; date?: string } = {};

  // Extract ASANMOD version
  const versionPatterns = [
    /ASANMOD v([0-9]+\.[0-9]+-?[A-Z]*)/i,
    /Version:\s*([0-9]+\.[0-9]+-?[A-Z]*)/i,
    /\*\*Version:\*\*\s*([0-9]+\.[0-9]+-?[A-Z]*)/i,
  ];

  for (const pattern of versionPatterns) {
    const match = content.match(pattern);
    if (match) {
      result.version = match[1];
      break;
    }
  }

  // Extract tool count
  const toolCountPatterns = [
    /(\d+)\s*[Tt]ools?/,
    /\| 7 \| asanmod \| \*\*YES\*\* \| (\d+) \|/,
    /tool_count:\s*(\d+)/,
    /"tool_count":\s*(\d+)/,
    /\((\d+) Total\)/,
    /✅ (\d+) Tool implement/,
  ];

  for (const pattern of toolCountPatterns) {
    const match = content.match(pattern);
    if (match) {
      result.toolCount = parseInt(match[1], 10);
      break;
    }
  }

  // Extract date
  const datePatterns = [
    /Last Updated:\s*(\d{4}-\d{2}-\d{2})/i,
    /\*\*Last Updated:\*\*\s*(\d{4}-\d{2}-\d{2})/i,
    /Updated:\s*(\d{4}-\d{2}-\d{2})/i,
  ];

  for (const pattern of datePatterns) {
    const match = content.match(pattern);
    if (match) {
      result.date = match[1];
      break;
    }
  }

  return result;
}

/**
 * GET /brain/asanmod-version
 * Get current ASANMOD version status across all files
 */
app.get("/brain/asanmod-version", (_req: Request, res: Response) => {
  try {
    const fileStatuses: FileStatus[] = [];
    const inconsistencies: string[] = [];
    let detectedVersion = "";
    let detectedToolCount = 0;
    let detectedDate = "";

    for (const fileInfo of VERSION_FILES) {
      const fullPath = path.join(PROJECT_ROOT, fileInfo.path);
      const status: FileStatus = {
        file: fileInfo.path,
        exists: false,
        status: "missing",
      };

      try {
        if (fs.existsSync(fullPath)) {
          status.exists = true;
          const content = fs.readFileSync(fullPath, "utf-8");
          const extracted = extractVersionInfo(fileInfo.path, content);

          status.version = extracted.version;
          status.toolCount = extracted.toolCount;
          status.date = extracted.date;

          // Track first detected values as reference
          if (!detectedVersion && extracted.version) {
            detectedVersion = extracted.version;
          }
          if (!detectedToolCount && extracted.toolCount) {
            detectedToolCount = extracted.toolCount;
          }
          if (!detectedDate && extracted.date) {
            detectedDate = extracted.date;
          }

          status.status = "ok";
        }
      } catch (error: any) {
        status.status = "error";
        status.errors = [error.message];
      }

      fileStatuses.push(status);
    }

    // Cross-check consistency
    for (const status of fileStatuses) {
      if (
        status.exists &&
        status.version &&
        status.version !== detectedVersion
      ) {
        if (status.status !== "error") {
          status.status = "outdated";
          inconsistencies.push(
            `${status.file}: Found v${status.version}, expected v${detectedVersion}`
          );
        }
      }
      if (
        status.exists &&
        status.toolCount &&
        status.toolCount !== detectedToolCount
      ) {
        if (
          status.status !== "error" &&
          !inconsistencies.some((i) => i.includes(status.file))
        ) {
          status.status = "outdated";
          inconsistencies.push(
            `${status.file}: Found ${status.toolCount} tools, expected ${detectedToolCount}`
          );
        }
      }
    }

    res.json({
      success: true,
      currentVersion: detectedVersion || "unknown",
      toolCount: detectedToolCount || 0,
      lastUpdated: detectedDate || new Date().toISOString().split("T")[0],
      fileStatuses,
      inconsistencies,
      isConsistent: inconsistencies.length === 0,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * POST /brain/asanmod-version
 * Update or verify ASANMOD version
 */
app.post("/brain/asanmod-version", async (req: Request, res: Response) => {
  try {
    const { action, version, toolCount, changelog } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        error: "action is required (update | verify)",
      });
    }

    if (action === "verify") {
      // Just verify consistency
      const fileStatuses: FileStatus[] = [];
      const inconsistencies: string[] = [];

      for (const fileInfo of VERSION_FILES) {
        const fullPath = path.join(PROJECT_ROOT, fileInfo.path);
        const status: FileStatus = {
          file: fileInfo.path,
          exists: false,
          status: "missing",
        };

        try {
          if (fs.existsSync(fullPath)) {
            status.exists = true;
            const content = fs.readFileSync(fullPath, "utf-8");
            const extracted = extractVersionInfo(fileInfo.path, content);

            status.version = extracted.version;
            status.toolCount = extracted.toolCount;
            status.date = extracted.date;

            // Check against expected values if provided
            if (version && extracted.version && extracted.version !== version) {
              status.status = "outdated";
              inconsistencies.push(
                `${fileInfo.path}: Expected v${version}, found v${extracted.version}`
              );
            } else if (
              toolCount &&
              extracted.toolCount &&
              extracted.toolCount !== toolCount
            ) {
              status.status = "outdated";
              inconsistencies.push(
                `${fileInfo.path}: Expected ${toolCount} tools, found ${extracted.toolCount}`
              );
            } else {
              status.status = "ok";
            }
          }
        } catch (error: any) {
          status.status = "error";
          status.errors = [error.message];
        }

        fileStatuses.push(status);
      }

      return res.json({
        success: inconsistencies.length === 0,
        action: "verify",
        expectedVersion: version,
        expectedToolCount: toolCount,
        fileStatuses,
        inconsistencies,
      });
    }

    if (action === "update") {
      if (!version || !toolCount) {
        return res.status(400).json({
          success: false,
          error: "version and toolCount are required for update action",
        });
      }

      // Execute the update script
      const scriptPath = path.join(PROJECT_ROOT, "scripts/asanmod-update.sh");

      if (!fs.existsSync(scriptPath)) {
        return res.status(500).json({
          success: false,
          error: "Update script not found: scripts/asanmod-update.sh",
        });
      }

      try {
        const changelogEntry =
          changelog || `Version update to ${version} with ${toolCount} tools`;
        const { stdout, stderr } = await execAsync(
          `bash "${scriptPath}" "${version}" ${toolCount} "${changelogEntry}"`,
          { cwd: PROJECT_ROOT }
        );

        // Parse output to get counts
        const updatedMatch = stdout.match(/Files Updated:\s*(\d+)/);
        const skippedMatch = stdout.match(/Files Skipped:\s*(\d+)/);

        const filesUpdated = updatedMatch ? parseInt(updatedMatch[1], 10) : 0;
        const filesSkipped = skippedMatch ? parseInt(skippedMatch[1], 10) : 0;

        return res.json({
          success: true,
          action: "update",
          version,
          toolCount,
          changelog: changelogEntry,
          filesUpdated,
          filesSkipped,
          timestamp: new Date().toISOString(),
          output: stdout.substring(0, 2000), // Truncate if too long
        });
      } catch (error: any) {
        return res.status(500).json({
          success: false,
          error: `Script execution failed: ${error.message}`,
          stderr: error.stderr,
        });
      }
    }

    return res.status(400).json({
      success: false,
      error: "Invalid action. Use 'update' or 'verify'",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// ========================================
// TOOL TIERS ENDPOINT
// ========================================

/**
 * GET /brain/tools/tiers
 * Get all tool tiers
 */
app.get("/brain/tools/tiers", (_req: Request, res: Response) => {
  try {
    // Import tool tiers from asanmod-mcp
    // For now, return static structure
    const tiers = {
      core: {
        count: 15,
        description: "[CORE] Günlük kullanım - Her session",
        tools: [
          "asanmod_session_start",
          "asanmod_session_audit",
          "asanmod_get_dashboard",
          "asanmod_brain_query",
          "asanmod_brain_health",
          "asanmod_brain_stats",
          "asanmod_verify_lint",
          "asanmod_verify_typescript",
          "asanmod_check_pre_commit",
          "asanmod_check_production_ready",
          "asanmod_pm2_logs",
          "asanmod_pm2_restart",
          "asanmod_get_rule",
          "asanmod_get_pattern",
          "asanmod_assign_task",
        ],
      },
      verification: {
        count: 25,
        description: "[VERIFY] Commit öncesi doğrulama",
        tools: [
          "asanmod_verify_build",
          "asanmod_verify_security",
          "asanmod_verify_rbac_patterns",
          "asanmod_verify_environment_isolation",
          "asanmod_verify_formatting",
          "asanmod_verify_imports",
          "asanmod_verify_migrations",
          "asanmod_verify_unused_code",
          "asanmod_verify_console_errors",
          "asanmod_verify_prod_protection",
          "asanmod_verify_pm2_health",
          "asanmod_verify_git_commit_message",
          "asanmod_verify_database_connection",
          "asanmod_verify_environment_variables",
          "asanmod_verify_dependencies",
          "asanmod_verify_api_endpoints",
          "asanmod_verify_code_complexity",
          "asanmod_verify_file_size",
          "asanmod_verify_documentation",
          "asanmod_verify_network_connectivity",
          "asanmod_verify_performance",
          "asanmod_verify_prod_deployment",
          "asanmod_verify_dev_prod_sync",
          "asanmod_verify_build_cache",
          "asanmod_verify_migration_sync",
        ],
      },
      brain: {
        count: 10,
        description: "[BRAIN] Öğrenme ve memory",
        tools: [
          "asanmod_brain_find_error_solution",
          "asanmod_brain_learn_error",
          "asanmod_brain_sync",
          "asanmod_brain_patterns",
          "asanmod_brain_auto_suggest",
          "asanmod_brain_mark_solution",
          "asanmod_update_memory",
          "asanmod_add_pattern",
          "asanmod_ikai_learning",
          "asanmod_auto_sync_memory_from_commit",
        ],
      },
      advanced: {
        count: 53,
        description: "[ADVANCED] Nadir kullanım",
        tools: [
          "asanmod_sync_memory_to_docs",
          "asanmod_sync_docs_to_memory",
          "asanmod_bidirectional_sync",
          "asanmod_detect_changes",
          "asanmod_detect_ikai_patterns",
          "asanmod_comprehensive_change_detection",
          "asanmod_automatic_pattern_learning",
          "asanmod_sync_memory_to_cursor_rules",
          "asanmod_cursor_settings_integration",
          "asanmod_cursor_agent_context",
          "asanmod_cursor_composer_chat_integration",
          "asanmod_test_self_update",
          "asanmod_test_context_preservation",
          "asanmod_test_ikai_specific",
          "asanmod_test_cursor_integration",
          "asanmod_test_performance",
          "asanmod_create_changelog",
          "asanmod_update_version",
          "asanmod_verify_version_consistency",
        ],
      },
    };

    res.json({
      success: true,
      tiers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /brain/tools/tiers/:tier
 * Get tools in a specific tier
 */
app.get("/brain/tools/tiers/:tier", (req: Request, res: Response) => {
  try {
    const { tier } = req.params;
    const tierMap: Record<string, any> = {
      core: {
        tier: "core",
        description: "[CORE] Günlük kullanım - Her session",
        tools: [
          "asanmod_session_start",
          "asanmod_session_audit",
          "asanmod_get_dashboard",
          "asanmod_brain_query",
          "asanmod_brain_health",
          "asanmod_brain_stats",
          "asanmod_verify_lint",
          "asanmod_verify_typescript",
          "asanmod_check_pre_commit",
          "asanmod_check_production_ready",
          "asanmod_pm2_logs",
          "asanmod_pm2_restart",
          "asanmod_get_rule",
          "asanmod_get_pattern",
          "asanmod_assign_task",
        ],
      },
      verification: {
        tier: "verification",
        description: "[VERIFY] Commit öncesi doğrulama",
        tools: [
          "asanmod_verify_build",
          "asanmod_verify_security",
          "asanmod_verify_rbac_patterns",
          "asanmod_verify_environment_isolation",
          "asanmod_verify_formatting",
          "asanmod_verify_imports",
          "asanmod_verify_migrations",
          "asanmod_verify_unused_code",
          "asanmod_verify_console_errors",
          "asanmod_verify_prod_protection",
          "asanmod_verify_pm2_health",
          "asanmod_verify_git_commit_message",
          "asanmod_verify_database_connection",
          "asanmod_verify_environment_variables",
          "asanmod_verify_dependencies",
          "asanmod_verify_api_endpoints",
          "asanmod_verify_code_complexity",
          "asanmod_verify_file_size",
          "asanmod_verify_documentation",
          "asanmod_verify_network_connectivity",
          "asanmod_verify_performance",
          "asanmod_verify_prod_deployment",
          "asanmod_verify_dev_prod_sync",
          "asanmod_verify_build_cache",
          "asanmod_verify_migration_sync",
        ],
      },
      brain: {
        tier: "brain",
        description: "[BRAIN] Öğrenme ve memory",
        tools: [
          "asanmod_brain_find_error_solution",
          "asanmod_brain_learn_error",
          "asanmod_brain_sync",
          "asanmod_brain_patterns",
          "asanmod_brain_auto_suggest",
          "asanmod_brain_mark_solution",
          "asanmod_update_memory",
          "asanmod_add_pattern",
          "asanmod_ikai_learning",
          "asanmod_auto_sync_memory_from_commit",
        ],
      },
      advanced: {
        tier: "advanced",
        description: "[ADVANCED] Nadir kullanım",
        tools: [
          "asanmod_sync_memory_to_docs",
          "asanmod_sync_docs_to_memory",
          "asanmod_bidirectional_sync",
          "asanmod_detect_changes",
          "asanmod_detect_ikai_patterns",
          "asanmod_comprehensive_change_detection",
          "asanmod_automatic_pattern_learning",
          "asanmod_sync_memory_to_cursor_rules",
          "asanmod_cursor_settings_integration",
          "asanmod_cursor_agent_context",
          "asanmod_cursor_composer_chat_integration",
          "asanmod_test_self_update",
          "asanmod_test_context_preservation",
          "asanmod_test_ikai_specific",
          "asanmod_test_cursor_integration",
          "asanmod_test_performance",
          "asanmod_create_changelog",
          "asanmod_update_version",
          "asanmod_verify_version_consistency",
        ],
      },
    };

    const tierData = tierMap[tier.toLowerCase()];
    if (!tierData) {
      return res.status(404).json({
        success: false,
        error: `Tier '${tier}' not found. Available tiers: core, verification, brain, advanced`,
      });
    }

    res.json({
      success: true,
      ...tierData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("API Error:", err);
  res.status(500).json({
    success: false,
    error: err.message,
  });
});

/**
 * Start the HTTP server
 */
export function startServer(port: number = 8250): Promise<void> {
  return new Promise((resolve) => {
    app.listen(port, () => {
      console.log(`🌐 Brain HTTP API running on port ${port}`);
      resolve();
    });
  });
}

export default {
  app,
  startServer,
};
