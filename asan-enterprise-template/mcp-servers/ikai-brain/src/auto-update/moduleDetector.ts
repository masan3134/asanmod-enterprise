/**
 * IKAI Brain System - Module Auto-Detection
 * Automatically detects modules from file paths and creates relations
 *
 * @module auto-update/moduleDetector
 * @version 1.0.0
 * @created 2025-12-24
 */

import {
  addEntity,
  addRelation,
  getEntity,
  Entity,
  Relation,
} from "../store/sqlite.js";

/**
 * Detect module from file path
 */
export function detectModuleFromPath(filePath: string): string | null {
  // Frontend modules
  if (filePath.startsWith("frontend/")) {
    if (filePath.includes("/candidates/")) return "IKAI_CANDIDATES";
    if (filePath.includes("/employees/")) return "IKAI_EMPLOYEE";
    if (filePath.includes("/offers/")) return "IKAI_OFFERS";
    if (filePath.includes("/leaves/")) return "IKAI_LEAVES";
    if (filePath.includes("/performance/")) return "IKAI_PERFORMANCE";
    if (filePath.includes("/chat/") || filePath.includes("/workspace/"))
      return "IKAI_WORKSPACE";
    if (filePath.includes("/notifications/")) return "IKAI_NOTIFICATIONS";
    if (filePath.includes("/reports/")) return "IKAI_REPORTS";
    if (filePath.includes("/profile/")) return "IKAI_PROFILE";
    if (filePath.includes("/my-profile/")) return "IKAI_MY-PROFILE";
    if (filePath.includes("/layout/")) return "IKAI_LAYOUT";
    if (filePath.includes("/advance-requests/")) return "IKAI_ADVANCE-REQUESTS";
    if (filePath.includes("/work-time/")) return "IKAI_WORK-TIME";
    if (filePath.includes("/navigation/")) return "IKAI_NAVIGATION";
    if (filePath.includes("/ui/")) return "IKAI_UI";
    if (filePath.includes("/hooks/")) return "IKAI_HOOKS";
    return "IKAI_FRONTEND";
  }

  // Backend modules
  if (filePath.startsWith("backend/")) {
    if (
      filePath.includes("/candidates/") ||
      filePath.includes("candidateController")
    )
      return "IKAI_CANDIDATES";
    if (
      filePath.includes("/employees/") ||
      filePath.includes("employeeController")
    )
      return "IKAI_EMPLOYEE";
    if (filePath.includes("/offers/") || filePath.includes("offerController"))
      return "IKAI_OFFERS";
    if (filePath.includes("/leaves/") || filePath.includes("leaveController"))
      return "IKAI_LEAVES";
    if (
      filePath.includes("/performance/") ||
      filePath.includes("performanceReviewController")
    )
      return "IKAI_PERFORMANCE";
    if (
      filePath.includes("/workspace/") ||
      filePath.includes("workspaceController")
    )
      return "IKAI_WORKSPACE";
    if (
      filePath.includes("/notifications/") ||
      filePath.includes("notificationController")
    )
      return "IKAI_NOTIFICATIONS";
    if (filePath.includes("/reports/")) return "IKAI_REPORTS";
    if (filePath.includes("/middleware/")) return "IKAI_MIDDLEWARE";
    if (filePath.includes("/integration/")) return "IKAI_INTEGRATION";
    if (filePath.includes("/leads/")) return "IKAI_LEADS";
    if (filePath.includes("/marketing/")) return "IKAI_MARKETING";
    if (filePath.includes("/sales/")) return "IKAI_SALES";
    return "IKAI_BACKEND";
  }

  // ASANMOD modules
  if (filePath.includes("asanmod")) {
    if (filePath.includes("mcp-servers/asanmod-mcp/"))
      return "IKAI_ASANMOD-MCP";
    return "IKAI_ASANMOD";
  }

  // Brain module
  if (filePath.includes("ikai-brain")) return "IKAI_BRAIN";

  // MCP modules
  if (filePath.includes("mcp-servers/")) {
    if (filePath.includes("memory")) return "IKAI_MCP-IKAI-MEMORY-MCP";
    if (filePath.includes("postgres")) return "IKAI_MCP-IKAI-POSTGRES-MCP";
    return "IKAI_MCP-SERVERS";
  }

  // Infrastructure
  if (filePath.includes("ecosystem.config") || filePath.includes("pm2"))
    return "IKAI_ECOSYSTEM";
  if (filePath.includes("next.config") || filePath.includes("build"))
    return "IKAI_BUILD";
  if (filePath.includes("package.json") || filePath.includes("bundle"))
    return "IKAI_BUNDLE";
  if (filePath.includes(".env") || filePath.includes("config"))
    return "IKAI_CONFIG";

  // Documentation
  if (filePath.includes("docs/")) return "IKAI_DOCS";
  if (filePath.includes("prompts/")) return "IKAI_PROMPTS";
  if (filePath.includes("CHANGELOG")) return "IKAI_CHANGELOG";
  if (filePath.includes(".cursorrules") || filePath.includes("rules"))
    return "IKAI_RULES";

  return null;
}

/**
 * Ensure module entity exists
 */
export function ensureModuleEntity(moduleId: string): void {
  const existing = getEntity(moduleId);
  if (!existing) {
    const entity: Entity = {
      id: moduleId,
      name: moduleId,
      entity_type: "Module",
      description: `IKAI ${moduleId.replace("IKAI_", "")} module`,
    };
    addEntity(entity);
  }
}

/**
 * Auto-create relations for detected modules
 */
export function autoCreateModuleRelations(moduleId: string): void {
  ensureModuleEntity(moduleId);

  // All modules use ASANMOD (except ASANMOD itself)
  if (moduleId !== "IKAI_ASANMOD" && moduleId !== "IKAI_ASANMOD-MCP") {
    try {
      const relation: Relation = {
        from_entity: moduleId,
        to_entity: "IKAI_ASANMOD",
        relation_type: "uses",
        strength: 0.8,
      };
      addRelation(relation);
    } catch (error) {
      // Relation might already exist, ignore
    }
  }

  // Frontend modules depend on Backend
  if (
    moduleId.startsWith("IKAI_") &&
    (moduleId.includes("FRONTEND") ||
      moduleId.includes("CANDIDATES") ||
      moduleId.includes("EMPLOYEE") ||
      moduleId.includes("REPORTS") ||
      moduleId.includes("PROFILE") ||
      moduleId.includes("LAYOUT") ||
      moduleId.includes("UI") ||
      moduleId.includes("NAVIGATION"))
  ) {
    try {
      const relation: Relation = {
        from_entity: moduleId,
        to_entity: "IKAI_BACKEND",
        relation_type: "depends_on",
        strength: 0.9,
      };
      addRelation(relation);
    } catch (error) {
      // Relation might already exist, ignore
    }
  }

  // Backend business modules are part of Backend
  if (
    moduleId.includes("CANDIDATES") ||
    moduleId.includes("EMPLOYEE") ||
    moduleId.includes("OFFERS") ||
    moduleId.includes("LEAVES") ||
    moduleId.includes("PERFORMANCE") ||
    moduleId.includes("WORKSPACE") ||
    moduleId.includes("NOTIFICATIONS") ||
    moduleId.includes("MIDDLEWARE") ||
    moduleId.includes("INTEGRATION")
  ) {
    try {
      const relation: Relation = {
        from_entity: moduleId,
        to_entity: "IKAI_BACKEND",
        relation_type: "part_of",
        strength: 1.0,
      };
      addRelation(relation);
    } catch (error) {
      // Relation might already exist, ignore
    }
  }
}

/**
 * Process files and auto-detect modules
 */
export function processFilesForModules(files: string[]): string[] {
  const detectedModules = new Set<string>();

  for (const file of files) {
    const moduleId = detectModuleFromPath(file);
    if (moduleId) {
      detectedModules.add(moduleId);
      ensureModuleEntity(moduleId);
      autoCreateModuleRelations(moduleId);
    }
  }

  return Array.from(detectedModules);
}
