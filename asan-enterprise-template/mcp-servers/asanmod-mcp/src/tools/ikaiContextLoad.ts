/**
 * ASANMOD MCP Tool: IKAI Context Auto-Load
 * Session başlangıcında IKAI context'ini otomatik yükler
 *
 * Phase 5: IKAI-Specific Customization
 */

import { existsSync } from "fs";
import { join } from "path";

interface IkaiContextLoadResult {
  success: boolean;
  loadedEntities: string[];
  loadedPatterns: number;
  loadedRules: number;
  contextSize: number;
  timestamp: string;
  contextFormat: {
    ikaiProject?: any;
    patterns?: any[];
    rules?: any[];
    mcps?: any[];
  };
}

/**
 * Project root detection
 */
function getProjectRoot(): string {
  let projectRoot = process.env.WORKSPACE_ROOT || "";

  if (!projectRoot) {
    let currentDir = process.cwd();
    for (let i = 0; i < 5; i++) {
      if (
        existsSync(join(currentDir, "docs", "workflow", "ASANMOD-MASTER.md"))
      ) {
        projectRoot = currentDir;
        break;
      }
      currentDir = join(currentDir, "..");
    }
  }

  return projectRoot || process.cwd();
}

/**
 * Load IKAI context from Memory MCP
 * Returns the format for Memory MCP queries
 */
export async function loadIkaiContext(
  path?: string
): Promise<IkaiContextLoadResult> {
  const projectRoot = path || getProjectRoot();

  if (!projectRoot) {
    throw new Error("Project root not found");
  }

  const result: IkaiContextLoadResult = {
    success: true,
    loadedEntities: [],
    loadedPatterns: 0,
    loadedRules: 0,
    contextSize: 0,
    timestamp: new Date().toISOString(),
    contextFormat: {},
  };

  try {
    // Define entities to load
    const entitiesToLoad = [
      "IKAI_PROJECT",
      "PATTERN_IKAI_RBAC",
      "PATTERN_IKAI_MULTI_TENANT",
      "PATTERN_IKAI_DEV_PROD",
      "PATTERN_IKAI_MCP_FIRST",
      "RULE_6_DEV_PROD",
      "RULE_7_PROD_PROTECTION",
      "MCP_FILESYSTEM",
      "MCP_MEMORY",
      "MCP_ASANMOD",
    ];

    // Generate Memory MCP query format
    // Note: This function returns the format
    // The actual Memory MCP call should be made by the caller

    result.contextFormat = {
      ikaiProject: {
        entityName: "IKAI_PROJECT",
        note: "Use mcp_memory_open_nodes({names: ['IKAI_PROJECT']}) to load",
      },
      patterns: [
        {
          entityName: "PATTERN_IKAI_RBAC",
          note: "Use mcp_memory_search_nodes({query: 'PATTERN_IKAI'}) to load all IKAI patterns",
        },
        {
          entityName: "PATTERN_IKAI_MULTI_TENANT",
        },
        {
          entityName: "PATTERN_IKAI_DEV_PROD",
        },
        {
          entityName: "PATTERN_IKAI_MCP_FIRST",
        },
      ],
      rules: [
        {
          entityName: "RULE_6_DEV_PROD",
          note: "IKAI-specific rule",
        },
        {
          entityName: "RULE_7_PROD_PROTECTION",
          note: "IKAI-specific rule",
        },
      ],
      mcps: [
        {
          entityName: "MCP_FILESYSTEM",
          note: "Core MCP for IKAI",
        },
        {
          entityName: "MCP_MEMORY",
          note: "Core MCP for IKAI",
        },
        {
          entityName: "MCP_ASANMOD",
          note: "ASANMOD MCP for IKAI",
        },
      ],
    };

    result.loadedEntities = entitiesToLoad;
    result.loadedPatterns = 4; // 4 IKAI patterns
    result.loadedRules = 2; // 2 IKAI-specific rules
    result.contextSize = entitiesToLoad.length;

    return result;
  } catch (error) {
    result.success = false;
    throw new Error(
      `IKAI context load failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Generate Memory MCP query format for IKAI context
 */
export function generateIkaiContextQueries(): {
  openNodes: string[];
  searchQueries: string[];
} {
  return {
    openNodes: [
      "IKAI_PROJECT",
      "PATTERN_IKAI_RBAC",
      "PATTERN_IKAI_MULTI_TENANT",
      "PATTERN_IKAI_DEV_PROD",
      "PATTERN_IKAI_MCP_FIRST",
      "RULE_6_DEV_PROD",
      "RULE_7_PROD_PROTECTION",
    ],
    searchQueries: ["PATTERN_IKAI", "IKAI RBAC", "IKAI DEV PROD", "IKAI MCP"],
  };
}

/**
 * MCP Tool Handler
 */
export async function handleIkaiContextLoad(args: {
  path?: string;
}): Promise<IkaiContextLoadResult> {
  return loadIkaiContext(args.path);
}
