/**
 * IKAI Brain System - Memory MCP Sync Engine
 * Synchronizes SQLite knowledge store with Memory MCP
 *
 * @module sync/memoryMcp
 * @version 1.0.0
 * @created 2025-12-13
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  copyFileSync,
  mkdirSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  getDb,
  addEntity,
  addObservation,
  addRelation,
  addSyncLog,
  getLastSync,
  Entity,
  Observation,
  Relation,
  SyncLog,
} from "../store/sqlite.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Memory MCP paths (priority order)
const MEMORY_MCP_PATHS = [
  process.env.MEMORY_MCP_PATH,
  process.env.MEMORY_FILE_PATH, // Also check MEMORY_FILE_PATH env var
  join(__dirname, "../../../../.memory/memory.jsonl"), // Default project path
];

// Types for Memory MCP format
interface MemoryEntity {
  type: "entity";
  name: string;
  entityType: string;
  observations: string[];
}

interface MemoryRelation {
  type: "relation";
  from: string;
  to: string;
  relationType: string;
}

type MemoryLine = MemoryEntity | MemoryRelation;

/**
 * Get Memory MCP file path
 */
export function getMemoryMCPPath(): string | null {
  for (const path of MEMORY_MCP_PATHS) {
    if (path && existsSync(path)) {
      return path;
    }
  }
  return null;
}

/**
 * Read current Memory MCP data
 */
export function readMemoryMCP(): MemoryLine[] {
  const path = getMemoryMCPPath();
  if (!path) {
    console.log("⚠️ Memory MCP file not found");
    return [];
  }

  try {
    const content = readFileSync(path, "utf-8");
    const lines = content.trim().split("\n").filter(Boolean);
    return lines.map((line) => JSON.parse(line) as MemoryLine);
  } catch (error) {
    console.error("Error reading Memory MCP:", error);
    return [];
  }
}

/**
 * Backup Memory MCP file
 */
export function backupMemoryMCP(): string | null {
  const path = getMemoryMCPPath();
  if (!path) return null;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `${path}.backup.${timestamp}`;

  try {
    copyFileSync(path, backupPath);
    console.log(`✅ Memory MCP backed up to: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error("Error backing up Memory MCP:", error);
    return null;
  }
}

/**
 * Write Memory MCP data
 */
export function writeMemoryMCP(data: MemoryLine[]): boolean {
  // Priority: 1. MEMORY_FILE_PATH env, 2. Existing file, 3. Default project path
  let path = process.env.MEMORY_FILE_PATH || getMemoryMCPPath();

  // If path not found, use the default project path
  if (!path) {
    path = join(__dirname, "../../../../.memory/memory.jsonl");
  }

  // Ensure directory exists
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  try {
    const content = data.map((line) => JSON.stringify(line)).join("\n") + "\n";
    writeFileSync(path, content, "utf-8");
    console.log(`✅ Memory MCP updated: ${data.length} entries to ${path}`);
    return true;
  } catch (error) {
    console.error("Error writing Memory MCP:", error);
    return false;
  }
}

/**
 * Import from Memory MCP to SQLite
 * Skips duplicates and continues with valid entries
 */
export function importFromMemoryMCP(): {
  entities: number;
  observations: number;
  relations: number;
  skipped: number;
} {
  const memoryData = readMemoryMCP();

  let entities = 0;
  let observations = 0;
  let relations = 0;
  let skipped = 0;

  for (const item of memoryData) {
    try {
      if (item.type === "entity") {
        // Add entity (skip if already exists with same name)
        try {
          addEntity({
            id: item.name,
            name: item.name,
            entity_type: item.entityType,
          });
          entities++;
        } catch (err: any) {
          if (err?.code === "SQLITE_CONSTRAINT_UNIQUE") {
            skipped++;
            // Entity already exists, still try to add observations
          } else {
            throw err;
          }
        }

        // Add observations
        for (const obs of item.observations || []) {
          try {
            addObservation({
              entity_id: item.name,
              content: obs,
              source: "migration",
              source_ref: "memory-mcp-import",
            });
            observations++;
          } catch (err: any) {
            if (err?.code === "SQLITE_CONSTRAINT_UNIQUE") {
              // Observation already exists, skip
            } else {
              throw err;
            }
          }
        }
      } else if (item.type === "relation") {
        try {
          addRelation({
            from_entity: item.from,
            to_entity: item.to,
            relation_type: item.relationType,
          });
          relations++;
        } catch (err: any) {
          if (err?.code === "SQLITE_CONSTRAINT_UNIQUE") {
            // Relation already exists, skip
          } else {
            throw err;
          }
        }
      }
    } catch (error) {
      console.error(`Error importing item: ${JSON.stringify(item)}`, error);
      skipped++;
    }
  }

  console.log(
    `✅ Imported from Memory MCP: ${entities} entities, ${observations} observations, ${relations} relations (${skipped} skipped)`
  );

  return { entities, observations, relations, skipped };
}

/**
 * Export SQLite to Memory MCP format
 */
export function exportToMemoryMCP(): MemoryLine[] {
  const db = getDb();
  const result: MemoryLine[] = [];

  // Export entities with observations
  const entities = db.prepare("SELECT * FROM entities").all() as Entity[];

  for (const entity of entities) {
    const observations = db
      .prepare("SELECT content FROM observations WHERE entity_id = ?")
      .all(entity.id) as { content: string }[];

    result.push({
      type: "entity",
      name: entity.name,
      entityType: entity.entity_type,
      observations: observations.map((o) => o.content),
    });
  }

  // Export relations
  const relations = db.prepare("SELECT * FROM relations").all() as Relation[];

  for (const relation of relations) {
    result.push({
      type: "relation",
      from: relation.from_entity,
      to: relation.to_entity,
      relationType: relation.relation_type,
    });
  }

  return result;
}

/**
 * Full sync: Export SQLite to Memory MCP
 */
export async function fullSync(): Promise<{
  success: boolean;
  entities: number;
  observations: number;
  relations: number;
  duration: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    // Backup first
    backupMemoryMCP();

    // Export from SQLite
    const data = exportToMemoryMCP();

    // Count items
    const entityCount = data.filter((d) => d.type === "entity").length;
    const relationCount = data.filter((d) => d.type === "relation").length;
    const observationCount = data
      .filter((d) => d.type === "entity")
      .reduce(
        (acc, d) => acc + ((d as MemoryEntity).observations?.length || 0),
        0
      );

    // Write to Memory MCP
    const success = writeMemoryMCP(data);

    const duration = Date.now() - startTime;

    // Log sync
    addSyncLog({
      sync_type: "full",
      direction: "to_memory",
      entities_synced: entityCount,
      observations_synced: observationCount,
      relations_synced: relationCount,
      status: success ? "success" : "failed",
      duration_ms: duration,
      memory_mcp_size: data.length,
    });

    return {
      success,
      entities: entityCount,
      observations: observationCount,
      relations: relationCount,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = String(error);

    addSyncLog({
      sync_type: "full",
      direction: "to_memory",
      status: "failed",
      error_message: errorMsg,
      duration_ms: duration,
    });

    return {
      success: false,
      entities: 0,
      observations: 0,
      relations: 0,
      duration,
      error: errorMsg,
    };
  }
}

/**
 * Incremental sync: Only sync new data since last sync
 */
export async function incrementalSync(): Promise<{
  success: boolean;
  entities: number;
  observations: number;
  relations: number;
  duration: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const lastSync = getLastSync();
    const lastSyncTime = lastSync?.synced_at || "1970-01-01T00:00:00Z";

    const db = getDb();

    // Get new entities
    const newEntities = db
      .prepare("SELECT * FROM entities WHERE created_at > ?")
      .all(lastSyncTime) as Entity[];

    // Get new observations
    const newObservations = db
      .prepare("SELECT * FROM observations WHERE created_at > ?")
      .all(lastSyncTime) as Observation[];

    // Get new relations
    const newRelations = db
      .prepare("SELECT * FROM relations WHERE created_at > ?")
      .all(lastSyncTime) as Relation[];

    if (
      newEntities.length === 0 &&
      newObservations.length === 0 &&
      newRelations.length === 0
    ) {
      const duration = Date.now() - startTime;
      return {
        success: true,
        entities: 0,
        observations: 0,
        relations: 0,
        duration,
      };
    }

    // Read current Memory MCP
    const currentData = readMemoryMCP();
    const entityMap = new Map<string, MemoryEntity>();

    // Build entity map from current data
    for (const item of currentData) {
      if (item.type === "entity") {
        entityMap.set(item.name, item as MemoryEntity);
      }
    }

    // Add/update entities
    for (const entity of newEntities) {
      if (!entityMap.has(entity.name)) {
        entityMap.set(entity.name, {
          type: "entity",
          name: entity.name,
          entityType: entity.entity_type,
          observations: [],
        });
      }
    }

    // Add new observations
    for (const obs of newObservations) {
      const entity = entityMap.get(obs.entity_id);
      if (entity && !entity.observations.includes(obs.content)) {
        entity.observations.push(obs.content);
      }
    }

    // Build new data
    const newData: MemoryLine[] = [...entityMap.values()];

    // Add relations (existing + new)
    const existingRelations = currentData.filter(
      (d) => d.type === "relation"
    ) as MemoryRelation[];
    const relationSet = new Set(
      existingRelations.map((r) => `${r.from}:${r.to}:${r.relationType}`)
    );

    for (const rel of existingRelations) {
      newData.push(rel);
    }

    for (const rel of newRelations) {
      const key = `${rel.from_entity}:${rel.to_entity}:${rel.relation_type}`;
      if (!relationSet.has(key)) {
        newData.push({
          type: "relation",
          from: rel.from_entity,
          to: rel.to_entity,
          relationType: rel.relation_type,
        });
        relationSet.add(key);
      }
    }

    // Write to Memory MCP
    const success = writeMemoryMCP(newData);

    const duration = Date.now() - startTime;

    addSyncLog({
      sync_type: "incremental",
      direction: "to_memory",
      entities_synced: newEntities.length,
      observations_synced: newObservations.length,
      relations_synced: newRelations.length,
      status: success ? "success" : "failed",
      duration_ms: duration,
      memory_mcp_size: newData.length,
    });

    return {
      success,
      entities: newEntities.length,
      observations: newObservations.length,
      relations: newRelations.length,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = String(error);

    addSyncLog({
      sync_type: "incremental",
      direction: "to_memory",
      status: "failed",
      error_message: errorMsg,
      duration_ms: duration,
    });

    return {
      success: false,
      entities: 0,
      observations: 0,
      relations: 0,
      duration,
      error: errorMsg,
    };
  }
}

/**
 * Bidirectional sync: Merge SQLite and Memory MCP
 */
export async function bidirectionalSync(): Promise<{
  success: boolean;
  imported: { entities: number; observations: number; relations: number };
  exported: { entities: number; observations: number; relations: number };
  duration: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    // First import from Memory MCP
    const imported = importFromMemoryMCP();

    // Then export to Memory MCP
    const exportResult = await fullSync();

    const duration = Date.now() - startTime;

    return {
      success: exportResult.success,
      imported,
      exported: {
        entities: exportResult.entities,
        observations: exportResult.observations,
        relations: exportResult.relations,
      },
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      imported: { entities: 0, observations: 0, relations: 0 },
      exported: { entities: 0, observations: 0, relations: 0 },
      duration,
      error: String(error),
    };
  }
}

export default {
  getMemoryMCPPath,
  readMemoryMCP,
  backupMemoryMCP,
  writeMemoryMCP,
  importFromMemoryMCP,
  exportToMemoryMCP,
  fullSync,
  incrementalSync,
  bidirectionalSync,
};
