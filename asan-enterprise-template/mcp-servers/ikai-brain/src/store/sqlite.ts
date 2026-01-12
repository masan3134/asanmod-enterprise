/**
 * IKAI Brain System - SQLite Operations Module
 * Provides all database operations for the Brain Daemon
 *
 * @module store/sqlite
 * @version 1.0.0
 * @created 2025-12-13
 */

import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database instance
let db: Database.Database | null = null;

// Types
export interface Entity {
  id: string;
  name: string;
  entity_type: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Observation {
  id?: number;
  entity_id: string;
  content: string;
  source: string;
  source_ref?: string;
  confidence?: number;
  created_at?: string;
}

export interface Relation {
  id?: number;
  from_entity: string;
  to_entity: string;
  relation_type: string;
  strength?: number;
  created_at?: string;
}

export interface ErrorSolution {
  id?: number;
  error_pattern: string;
  error_message?: string;
  error_type?: string;
  file_pattern?: string;
  stack_trace_pattern?: string;
  solution_description: string;
  solution_code?: string;
  solution_files?: string[];
  solution_steps?: string[];
  related_pattern?: string;
  tags?: string[];
  success_count?: number;
  fail_count?: number;
  last_used_at?: string;
  commit_hash?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GitCommit {
  id?: number;
  commit_hash: string;
  message: string;
  type?: string;
  module?: string;
  identity?: string;
  author?: string;
  files_changed?: string[];
  insertions?: number;
  deletions?: number;
  has_brain_block?: boolean;
  brain_block?: object;
  error_fix?: string;
  pattern?: string;
  tags?: string[];
  solution?: string;
  is_breaking?: boolean;
  commit_timestamp?: string;
  learned_at?: string;
}

export interface CodePattern {
  id?: number;
  pattern_name: string;
  pattern_type: string;
  category?: string;
  description: string;
  example_code?: string;
  anti_pattern?: string;
  anti_pattern_reason?: string;
  related_files?: string[];
  tags?: string[];
  usage_count?: number;
  effectiveness_score?: number;
  created_from_commit?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SyncLog {
  id?: number;
  sync_type: string;
  direction: string;
  entities_synced?: number;
  observations_synced?: number;
  relations_synced?: number;
  errors_synced?: number;
  patterns_synced?: number;
  status: string;
  error_message?: string;
  duration_ms?: number;
  memory_mcp_size?: number;
  synced_at?: string;
}

export interface BrainStats {
  entities: number;
  observations: number;
  relations: number;
  error_solutions: number;
  git_commits: number;
  code_patterns: number;
  brain_commits: number;
  successful_solutions: number;
  rules: number;
  mcps: number;
  last_sync?: string;
}

// Rule interface for ASANMOD rules
export interface Rule {
  id: string;
  name: string;
  category: "altin" | "zorunlu" | "onemli";
  description: string;
  content: string;
  priority: number;
  is_mandatory: boolean;
  keywords?: string[];
  created_at?: string;
  updated_at?: string;
}

// MCP interface
export interface MCP {
  id: string;
  name: string;
  description: string;
  is_mandatory: boolean;
  tools_count?: number;
  use_cases?: string[];
  forbidden_alternatives?: string[];
  examples?: string[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Initialize the database with schema
 */
export function initDatabase(dbPath?: string): Database.Database {
  const path =
    dbPath ||
    process.env.SQLITE_PATH ||
    join(__dirname, "../../data/ikai-brain.db");

  db = new Database(path);

  // Enable WAL mode for better performance
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  db.pragma("synchronous = NORMAL");
  db.pragma("cache_size = 10000");
  db.pragma("foreign_keys = ON");

  // Read and execute schema
  const schemaPath = join(__dirname, "schema.sql");
  const schema = readFileSync(schemaPath, "utf-8");

  // Execute schema (split by semicolons for multiple statements)
  db.exec(schema);

  console.log("✅ SQLite database initialized:", path);
  return db;
}

/**
 * Get database instance
 */
export function getDb(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log("✅ SQLite database closed");
  }
}

// ========================================
// ENTITY OPERATIONS
// ========================================

/**
 * Add or update an entity
 */
export function addEntity(entity: Entity): Entity {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO entities (id, name, entity_type, description)
    VALUES (@id, @name, @entity_type, @description)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      entity_type = excluded.entity_type,
      description = excluded.description
  `);

  stmt.run({
    id: entity.id,
    name: entity.name,
    entity_type: entity.entity_type,
    description: entity.description || null,
  });

  return entity;
}

/**
 * Get entity by ID
 */
export function getEntity(id: string): Entity | undefined {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM entities WHERE id = ?");
  return stmt.get(id) as Entity | undefined;
}

/**
 * Get entities by type
 */
export function getEntitiesByType(entityType: string): Entity[] {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM entities WHERE entity_type = ?");
  return stmt.all(entityType) as Entity[];
}

/**
 * Search entities by name or description
 */
export function searchEntities(query: string, limit = 10): Entity[] {
  try {
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return [];
    }

    const db = getDb();
    if (!db) {
      console.error("Database not initialized");
      return [];
    }

    const normalizedQuery = query.trim();
    const stmt = db.prepare(`
      SELECT * FROM entities
      WHERE name LIKE ? OR description LIKE ?
      LIMIT ?
    `);
    const searchTerm = `%${normalizedQuery}%`;
    const results = stmt.all(searchTerm, searchTerm, limit) as Entity[];
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.error("Error in searchEntities:", error);
    return [];
  }
}

/**
 * Delete entity and its observations/relations
 */
export function deleteEntity(id: string): boolean {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM entities WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
}

// ========================================
// OBSERVATION OPERATIONS
// ========================================

/**
 * Add observation to an entity
 */
export function addObservation(observation: Observation): number {
  const db = getDb();

  // Ensure entity exists
  const entity = getEntity(observation.entity_id);
  if (!entity) {
    // Create entity if it doesn't exist
    addEntity({
      id: observation.entity_id,
      name: observation.entity_id,
      entity_type: "auto",
    });
  }

  const stmt = db.prepare(`
    INSERT INTO observations (entity_id, content, source, source_ref, confidence)
    VALUES (@entity_id, @content, @source, @source_ref, @confidence)
    ON CONFLICT(entity_id, content) DO UPDATE SET
      source = excluded.source,
      source_ref = excluded.source_ref,
      confidence = excluded.confidence
  `);

  const result = stmt.run({
    entity_id: observation.entity_id,
    content: observation.content,
    source: observation.source,
    source_ref: observation.source_ref || null,
    confidence: observation.confidence || 1.0,
  });

  return result.lastInsertRowid as number;
}

/**
 * Get observations for an entity
 */
export function getObservations(entityId: string): Observation[] {
  const db = getDb();
  const stmt = db.prepare(
    "SELECT * FROM observations WHERE entity_id = ? ORDER BY created_at DESC"
  );
  return stmt.all(entityId) as Observation[];
}

/**
 * Delete observation
 */
export function deleteObservation(id: number): boolean {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM observations WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
}

// ========================================
// RELATION OPERATIONS
// ========================================

/**
 * Add relation between entities
 */
export function addRelation(relation: Relation): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO relations (from_entity, to_entity, relation_type, strength)
    VALUES (@from_entity, @to_entity, @relation_type, @strength)
    ON CONFLICT(from_entity, to_entity, relation_type) DO UPDATE SET
      strength = excluded.strength
  `);

  const result = stmt.run({
    from_entity: relation.from_entity,
    to_entity: relation.to_entity,
    relation_type: relation.relation_type,
    strength: relation.strength || 1.0,
  });

  return result.lastInsertRowid as number;
}

/**
 * Get relations for an entity
 */
export function getRelations(entityId: string): Relation[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM relations
    WHERE from_entity = ? OR to_entity = ?
    ORDER BY created_at DESC
  `);
  return stmt.all(entityId, entityId) as Relation[];
}

/**
 * Delete relation
 */
export function deleteRelation(id: number): boolean {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM relations WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
}

// ========================================
// ERROR SOLUTION OPERATIONS
// ========================================

/**
 * Add error solution
 */
export function addErrorSolution(solution: ErrorSolution): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO error_solutions (
      error_pattern, error_message, error_type, file_pattern, stack_trace_pattern,
      solution_description, solution_code, solution_files, solution_steps,
      related_pattern, tags, commit_hash
    ) VALUES (
      @error_pattern, @error_message, @error_type, @file_pattern, @stack_trace_pattern,
      @solution_description, @solution_code, @solution_files, @solution_steps,
      @related_pattern, @tags, @commit_hash
    )
  `);

  const result = stmt.run({
    error_pattern: solution.error_pattern,
    error_message: solution.error_message || null,
    error_type: solution.error_type || null,
    file_pattern: solution.file_pattern || null,
    stack_trace_pattern: solution.stack_trace_pattern || null,
    solution_description: solution.solution_description,
    solution_code: solution.solution_code || null,
    solution_files: solution.solution_files
      ? JSON.stringify(solution.solution_files)
      : null,
    solution_steps: solution.solution_steps
      ? JSON.stringify(solution.solution_steps)
      : null,
    related_pattern: solution.related_pattern || null,
    tags: solution.tags ? JSON.stringify(solution.tags) : null,
    commit_hash: solution.commit_hash || null,
  });

  return result.lastInsertRowid as number;
}

/**
 * Find similar error solutions
 */
export function findSimilarErrors(
  errorMessage: string,
  limit = 5
): ErrorSolution[] {
  try {
    if (
      !errorMessage ||
      typeof errorMessage !== "string" ||
      errorMessage.trim().length === 0
    ) {
      return [];
    }

    const db = getDb();
    if (!db) {
      console.error("Database not initialized");
      return [];
    }

    // Normalize error message for matching
    const normalized = normalizeError(errorMessage.trim());

    const stmt = db.prepare(`
      SELECT *,
        CASE
          WHEN error_pattern = ? THEN 100
          WHEN error_pattern LIKE ? THEN 80
          WHEN error_message LIKE ? THEN 60
          ELSE 40
        END as match_score
      FROM error_solutions
      WHERE error_pattern LIKE ? OR error_message LIKE ?
      ORDER BY match_score DESC, success_count DESC
      LIMIT ?
    `);

    const searchTerm = `%${normalized}%`;
    const results = stmt.all(
      normalized,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      limit
    ) as ErrorSolution[];

    if (!Array.isArray(results)) {
      return [];
    }

    // Parse JSON fields with error handling
    return results.map((r) => {
      try {
        return {
          ...r,
          solution_files: r.solution_files
            ? JSON.parse(r.solution_files as unknown as string)
            : undefined,
          solution_steps: r.solution_steps
            ? JSON.parse(r.solution_steps as unknown as string)
            : undefined,
          tags: r.tags ? JSON.parse(r.tags as unknown as string) : undefined,
        };
      } catch (parseError) {
        console.error("Error parsing solution JSON:", parseError);
        return r; // Return original if parsing fails
      }
    });
  } catch (error) {
    console.error("Error in findSimilarErrors:", error);
    return [];
  }
}

/**
 * Update solution effectiveness score
 */
export function updateSolutionScore(id: number, success: boolean): void {
  const db = getDb();
  const field = success ? "success_count" : "fail_count";
  const stmt = db.prepare(`
    UPDATE error_solutions
    SET ${field} = ${field} + 1, last_used_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(id);
}

/**
 * Normalize error message for pattern matching
 */
export function normalizeError(error: string): string {
  return error
    .replace(/at line \d+/gi, "at line X")
    .replace(/in \/[^\s]+\//g, "in /.../")
    .replace(/[a-f0-9]{7,40}/gi, "HASH")
    .replace(/\d{4}-\d{2}-\d{2}/g, "DATE")
    .replace(/\d{2}:\d{2}:\d{2}/g, "TIME")
    .replace(/\d+\.\d+\.\d+/g, "VERSION")
    .replace(/port \d+/gi, "port X")
    .replace(/\s+/g, " ")
    .trim();
}

// ========================================
// GIT COMMIT OPERATIONS
// ========================================

/**
 * Add git commit record
 */
export function addGitCommit(commit: GitCommit): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO git_commits (
      commit_hash, message, type, module, identity, author,
      files_changed, insertions, deletions, has_brain_block, brain_block,
      error_fix, pattern, tags, solution, is_breaking, commit_timestamp
    ) VALUES (
      @commit_hash, @message, @type, @module, @identity, @author,
      @files_changed, @insertions, @deletions, @has_brain_block, @brain_block,
      @error_fix, @pattern, @tags, @solution, @is_breaking, @commit_timestamp
    )
    ON CONFLICT(commit_hash) DO UPDATE SET
      message = excluded.message,
      has_brain_block = excluded.has_brain_block,
      brain_block = excluded.brain_block,
      error_fix = excluded.error_fix,
      pattern = excluded.pattern,
      tags = excluded.tags,
      solution = excluded.solution
  `);

  const result = stmt.run({
    commit_hash: commit.commit_hash,
    message: commit.message,
    type: commit.type || null,
    module: commit.module || null,
    identity: commit.identity || null,
    author: commit.author || null,
    files_changed: commit.files_changed
      ? JSON.stringify(commit.files_changed)
      : null,
    insertions: commit.insertions || 0,
    deletions: commit.deletions || 0,
    has_brain_block: commit.has_brain_block ? 1 : 0,
    brain_block: commit.brain_block ? JSON.stringify(commit.brain_block) : null,
    error_fix: commit.error_fix || null,
    pattern: commit.pattern || null,
    tags: commit.tags ? JSON.stringify(commit.tags) : null,
    solution: commit.solution || null,
    is_breaking: commit.is_breaking ? 1 : 0,
    commit_timestamp: commit.commit_timestamp || null,
  });

  return result.lastInsertRowid as number;
}

/**
 * Get commit by hash
 */
export function getCommit(hash: string): GitCommit | undefined {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM git_commits WHERE commit_hash = ?");
  const result = stmt.get(hash) as GitCommit | undefined;

  if (result) {
    return {
      ...result,
      files_changed: result.files_changed
        ? JSON.parse(result.files_changed as unknown as string)
        : undefined,
      brain_block: result.brain_block
        ? JSON.parse(result.brain_block as unknown as string)
        : undefined,
      tags: result.tags
        ? JSON.parse(result.tags as unknown as string)
        : undefined,
      has_brain_block: Boolean(result.has_brain_block),
      is_breaking: Boolean(result.is_breaking),
    };
  }

  return undefined;
}

/**
 * Get recent commits
 */
export function getRecentCommits(limit = 20): GitCommit[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM git_commits
    ORDER BY learned_at DESC
    LIMIT ?
  `);
  return stmt.all(limit) as GitCommit[];
}

/**
 * Search commits by hash, message, module, or tags
 */
export function searchCommits(query: string, limit = 20): GitCommit[] {
  try {
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return [];
    }

    const db = getDb();
    if (!db) {
      console.error("Database not initialized");
      return [];
    }

    const normalizedQuery = query.trim();
    const searchPattern = `%${normalizedQuery}%`;
    const stmt = db.prepare(`
      SELECT * FROM git_commits
      WHERE commit_hash LIKE ?
         OR message LIKE ?
         OR module LIKE ?
         OR type LIKE ?
         OR identity LIKE ?
         OR tags LIKE ?
         OR error_fix LIKE ?
         OR pattern LIKE ?
      ORDER BY learned_at DESC
      LIMIT ?
    `);
    const results = stmt.all(
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      limit
    ) as GitCommit[];
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.error("Error in searchCommits:", error);
    return [];
  }
}

/**
 * Get commits with BRAIN blocks
 */
export function getBrainCommits(limit = 20): GitCommit[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM git_commits
    WHERE has_brain_block = 1
    ORDER BY learned_at DESC
    LIMIT ?
  `);
  return stmt.all(limit) as GitCommit[];
}

// ========================================
// CODE PATTERN OPERATIONS
// ========================================

/**
 * Add or update code pattern
 */
export function addCodePattern(pattern: CodePattern): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO code_patterns (
      pattern_name, pattern_type, category, description,
      example_code, anti_pattern, anti_pattern_reason,
      related_files, tags, created_from_commit
    ) VALUES (
      @pattern_name, @pattern_type, @category, @description,
      @example_code, @anti_pattern, @anti_pattern_reason,
      @related_files, @tags, @created_from_commit
    )
    ON CONFLICT(pattern_name) DO UPDATE SET
      pattern_type = excluded.pattern_type,
      category = excluded.category,
      description = excluded.description,
      example_code = COALESCE(excluded.example_code, code_patterns.example_code),
      anti_pattern = COALESCE(excluded.anti_pattern, code_patterns.anti_pattern),
      anti_pattern_reason = COALESCE(excluded.anti_pattern_reason, code_patterns.anti_pattern_reason),
      related_files = COALESCE(excluded.related_files, code_patterns.related_files),
      tags = COALESCE(excluded.tags, code_patterns.tags),
      usage_count = usage_count + 1
  `);

  const result = stmt.run({
    pattern_name: pattern.pattern_name,
    pattern_type: pattern.pattern_type,
    category: pattern.category || null,
    description: pattern.description,
    example_code: pattern.example_code || null,
    anti_pattern: pattern.anti_pattern || null,
    anti_pattern_reason: pattern.anti_pattern_reason || null,
    related_files: pattern.related_files
      ? JSON.stringify(pattern.related_files)
      : null,
    tags: pattern.tags ? JSON.stringify(pattern.tags) : null,
    created_from_commit: pattern.created_from_commit || null,
  });

  return result.lastInsertRowid as number;
}

/**
 * Get pattern by name
 */
export function getPattern(name: string): CodePattern | undefined {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM code_patterns WHERE pattern_name = ?");
  const result = stmt.get(name) as CodePattern | undefined;

  if (result) {
    return {
      ...result,
      related_files: result.related_files
        ? JSON.parse(result.related_files as unknown as string)
        : undefined,
      tags: result.tags
        ? JSON.parse(result.tags as unknown as string)
        : undefined,
    };
  }

  return undefined;
}

/**
 * Get all patterns
 */
export function getAllPatterns(): CodePattern[] {
  const db = getDb();
  const stmt = db.prepare(
    "SELECT * FROM code_patterns ORDER BY usage_count DESC"
  );
  return stmt.all() as CodePattern[];
}

/**
 * Search patterns by type or tags
 */
export function searchPatterns(query: string, limit = 10): CodePattern[] {
  try {
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return [];
    }

    const db = getDb();
    if (!db) {
      console.error("Database not initialized");
      return [];
    }

    const normalizedQuery = query.trim();
    const stmt = db.prepare(`
      SELECT * FROM code_patterns
      WHERE pattern_name LIKE ? OR pattern_type LIKE ? OR tags LIKE ? OR description LIKE ?
      ORDER BY usage_count DESC
      LIMIT ?
    `);
    const searchTerm = `%${normalizedQuery}%`;
    const results = stmt.all(
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      limit
    ) as CodePattern[];
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.error("Error in searchPatterns:", error);
    return [];
  }
}

// ========================================
// SYNC LOG OPERATIONS
// ========================================

/**
 * Add sync log entry
 */
export function addSyncLog(log: SyncLog): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO sync_log (
      sync_type, direction, entities_synced, observations_synced, relations_synced,
      errors_synced, patterns_synced, status, error_message, duration_ms, memory_mcp_size
    ) VALUES (
      @sync_type, @direction, @entities_synced, @observations_synced, @relations_synced,
      @errors_synced, @patterns_synced, @status, @error_message, @duration_ms, @memory_mcp_size
    )
  `);

  const result = stmt.run({
    sync_type: log.sync_type,
    direction: log.direction,
    entities_synced: log.entities_synced || 0,
    observations_synced: log.observations_synced || 0,
    relations_synced: log.relations_synced || 0,
    errors_synced: log.errors_synced || 0,
    patterns_synced: log.patterns_synced || 0,
    status: log.status,
    error_message: log.error_message || null,
    duration_ms: log.duration_ms || null,
    memory_mcp_size: log.memory_mcp_size || null,
  });

  return result.lastInsertRowid as number;
}

/**
 * Get last sync log
 */
export function getLastSync(): SyncLog | undefined {
  const db = getDb();
  const stmt = db.prepare(
    "SELECT * FROM sync_log ORDER BY synced_at DESC LIMIT 1"
  );
  return stmt.get() as SyncLog | undefined;
}

// ========================================
// STATISTICS
// ========================================

/**
 * Get brain statistics
 */
export function getBrainStats(): BrainStats {
  const db = getDb();

  const entities = db
    .prepare("SELECT COUNT(*) as count FROM entities")
    .get() as { count: number };
  const observations = db
    .prepare("SELECT COUNT(*) as count FROM observations")
    .get() as { count: number };
  const relations = db
    .prepare("SELECT COUNT(*) as count FROM relations")
    .get() as { count: number };
  const errorSolutions = db
    .prepare("SELECT COUNT(*) as count FROM error_solutions")
    .get() as { count: number };
  const gitCommits = db
    .prepare("SELECT COUNT(*) as count FROM git_commits")
    .get() as { count: number };
  const codePatterns = db
    .prepare("SELECT COUNT(*) as count FROM code_patterns")
    .get() as { count: number };
  const brainCommits = db
    .prepare(
      "SELECT COUNT(*) as count FROM git_commits WHERE has_brain_block = 1"
    )
    .get() as { count: number };
  const successfulSolutions = db
    .prepare(
      "SELECT COUNT(*) as count FROM error_solutions WHERE success_count > 0"
    )
    .get() as { count: number };
  const rulesCount = db
    .prepare(
      "SELECT COUNT(*) as count FROM entities WHERE entity_type = 'rule'"
    )
    .get() as { count: number };
  const mcpsCount = db
    .prepare("SELECT COUNT(*) as count FROM entities WHERE entity_type = 'mcp'")
    .get() as { count: number };
  const lastSync = getLastSync();

  return {
    entities: entities.count,
    observations: observations.count,
    relations: relations.count,
    error_solutions: errorSolutions.count,
    git_commits: gitCommits.count,
    code_patterns: codePatterns.count,
    brain_commits: brainCommits.count,
    successful_solutions: successfulSolutions.count,
    rules: rulesCount.count,
    mcps: mcpsCount.count,
    last_sync: lastSync?.synced_at,
  };
}

// ========================================
// RULE OPERATIONS
// ========================================

/**
 * Add or update a rule
 */
export function addRule(rule: Rule): Rule {
  const db = getDb();

  // Create or update entity for the rule
  addEntity({
    id: rule.id,
    name: rule.name,
    entity_type: "rule",
    description: rule.description,
  });

  // Add observations for rule content
  addObservation({
    entity_id: rule.id,
    content: rule.content,
    source: "asanmod",
    source_ref: "import",
    confidence: 1.0,
  });

  // Add category observation
  addObservation({
    entity_id: rule.id,
    content: `category:${rule.category}`,
    source: "asanmod",
    source_ref: "import",
    confidence: 1.0,
  });

  // Add priority observation
  addObservation({
    entity_id: rule.id,
    content: `priority:${rule.priority}`,
    source: "asanmod",
    source_ref: "import",
    confidence: 1.0,
  });

  // Add mandatory observation
  addObservation({
    entity_id: rule.id,
    content: `mandatory:${rule.is_mandatory}`,
    source: "asanmod",
    source_ref: "import",
    confidence: 1.0,
  });

  // Add keywords as observations
  if (rule.keywords) {
    addObservation({
      entity_id: rule.id,
      content: `keywords:${JSON.stringify(rule.keywords)}`,
      source: "asanmod",
      source_ref: "import",
      confidence: 1.0,
    });
  }

  return rule;
}

/**
 * Get all rules
 */
export function getRules(category?: string): Rule[] {
  const db = getDb();
  const entities = getEntitiesByType("rule");

  const rules: Rule[] = [];

  for (const entity of entities) {
    const observations = getObservations(entity.id);
    const rule = parseRuleFromObservations(entity, observations);

    if (category) {
      if (rule.category === category) {
        rules.push(rule);
      }
    } else {
      rules.push(rule);
    }
  }

  // Sort by priority (lower = higher priority)
  return rules.sort((a, b) => a.priority - b.priority);
}

/**
 * Get rule by ID
 */
export function getRuleById(id: string): Rule | undefined {
  const entity = getEntity(id);
  if (!entity || entity.entity_type !== "rule") {
    return undefined;
  }

  const observations = getObservations(entity.id);
  return parseRuleFromObservations(entity, observations);
}

/**
 * Parse rule from entity and observations
 */
function parseRuleFromObservations(
  entity: Entity,
  observations: Observation[]
): Rule {
  let category: "altin" | "zorunlu" | "onemli" = "onemli";
  let priority = 100;
  let isMandatory = false;
  let content = "";
  let keywords: string[] = [];

  for (const obs of observations) {
    if (obs.content.startsWith("category:")) {
      category = obs.content.replace("category:", "") as
        | "altin"
        | "zorunlu"
        | "onemli";
    } else if (obs.content.startsWith("priority:")) {
      priority = parseInt(obs.content.replace("priority:", ""), 10);
    } else if (obs.content.startsWith("mandatory:")) {
      isMandatory = obs.content.replace("mandatory:", "") === "true";
    } else if (obs.content.startsWith("keywords:")) {
      try {
        keywords = JSON.parse(obs.content.replace("keywords:", ""));
      } catch {
        keywords = [];
      }
    } else if (!obs.content.includes(":")) {
      // Main content observation
      content = obs.content;
    }
  }

  return {
    id: entity.id,
    name: entity.name,
    category,
    description: entity.description || "",
    content,
    priority,
    is_mandatory: isMandatory,
    keywords,
    created_at: entity.created_at,
    updated_at: entity.updated_at,
  };
}

// ========================================
// MCP OPERATIONS
// ========================================

/**
 * Add or update an MCP
 */
export function addMcp(mcp: MCP): MCP {
  const db = getDb();

  // Create or update entity for the MCP
  addEntity({
    id: mcp.id,
    name: mcp.name,
    entity_type: "mcp",
    description: mcp.description,
  });

  // Add mandatory observation
  addObservation({
    entity_id: mcp.id,
    content: `mandatory:${mcp.is_mandatory}`,
    source: "asanmod",
    source_ref: "import",
    confidence: 1.0,
  });

  // Add tools count if present
  if (mcp.tools_count) {
    addObservation({
      entity_id: mcp.id,
      content: `tools_count:${mcp.tools_count}`,
      source: "asanmod",
      source_ref: "import",
      confidence: 1.0,
    });
  }

  // Add use cases
  if (mcp.use_cases && mcp.use_cases.length > 0) {
    addObservation({
      entity_id: mcp.id,
      content: `use_cases:${JSON.stringify(mcp.use_cases)}`,
      source: "asanmod",
      source_ref: "import",
      confidence: 1.0,
    });
  }

  // Add forbidden alternatives
  if (mcp.forbidden_alternatives && mcp.forbidden_alternatives.length > 0) {
    addObservation({
      entity_id: mcp.id,
      content: `forbidden:${JSON.stringify(mcp.forbidden_alternatives)}`,
      source: "asanmod",
      source_ref: "import",
      confidence: 1.0,
    });
  }

  // Add examples
  if (mcp.examples && mcp.examples.length > 0) {
    addObservation({
      entity_id: mcp.id,
      content: `examples:${JSON.stringify(mcp.examples)}`,
      source: "asanmod",
      source_ref: "import",
      confidence: 1.0,
    });
  }

  return mcp;
}

/**
 * Get all MCPs
 */
export function getMcps(mandatoryOnly?: boolean): MCP[] {
  const entities = getEntitiesByType("mcp");

  const mcps: MCP[] = [];

  for (const entity of entities) {
    const observations = getObservations(entity.id);
    const mcp = parseMcpFromObservations(entity, observations);

    if (mandatoryOnly) {
      if (mcp.is_mandatory) {
        mcps.push(mcp);
      }
    } else {
      mcps.push(mcp);
    }
  }

  // Sort: mandatory first, then by name
  return mcps.sort((a, b) => {
    if (a.is_mandatory && !b.is_mandatory) return -1;
    if (!a.is_mandatory && b.is_mandatory) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get MCP by name
 */
export function getMcpByName(name: string): MCP | undefined {
  const entities = getEntitiesByType("mcp");
  const entity = entities.find(
    (e) => e.name.toLowerCase() === name.toLowerCase() || e.id === name
  );

  if (!entity) {
    return undefined;
  }

  const observations = getObservations(entity.id);
  return parseMcpFromObservations(entity, observations);
}

/**
 * Parse MCP from entity and observations
 */
function parseMcpFromObservations(
  entity: Entity,
  observations: Observation[]
): MCP {
  let isMandatory = false;
  let toolsCount: number | undefined;
  let useCases: string[] = [];
  let forbiddenAlternatives: string[] = [];
  let examples: string[] = [];

  for (const obs of observations) {
    if (obs.content.startsWith("mandatory:")) {
      isMandatory = obs.content.replace("mandatory:", "") === "true";
    } else if (obs.content.startsWith("tools_count:")) {
      toolsCount = parseInt(obs.content.replace("tools_count:", ""), 10);
    } else if (obs.content.startsWith("use_cases:")) {
      try {
        useCases = JSON.parse(obs.content.replace("use_cases:", ""));
      } catch {
        useCases = [];
      }
    } else if (obs.content.startsWith("forbidden:")) {
      try {
        forbiddenAlternatives = JSON.parse(
          obs.content.replace("forbidden:", "")
        );
      } catch {
        forbiddenAlternatives = [];
      }
    } else if (obs.content.startsWith("examples:")) {
      try {
        examples = JSON.parse(obs.content.replace("examples:", ""));
      } catch {
        examples = [];
      }
    }
  }

  return {
    id: entity.id,
    name: entity.name,
    description: entity.description || "",
    is_mandatory: isMandatory,
    tools_count: toolsCount,
    use_cases: useCases,
    forbidden_alternatives: forbiddenAlternatives,
    examples,
    created_at: entity.created_at,
    updated_at: entity.updated_at,
  };
}

// ========================================
// EXPORT FOR MEMORY MCP
// ========================================

/**
 * Export all data in Memory MCP format (JSONL)
 */
export function exportToMemoryMCPFormat(): string {
  const db = getDb();
  const lines: string[] = [];

  // Export entities
  const entities = db.prepare("SELECT * FROM entities").all() as Entity[];
  for (const entity of entities) {
    const observations = getObservations(entity.id);
    lines.push(
      JSON.stringify({
        type: "entity",
        name: entity.name,
        entityType: entity.entity_type,
        observations: observations.map((o) => o.content),
      })
    );
  }

  // Export relations
  const relations = db.prepare("SELECT * FROM relations").all() as Relation[];
  for (const relation of relations) {
    lines.push(
      JSON.stringify({
        type: "relation",
        from: relation.from_entity,
        to: relation.to_entity,
        relationType: relation.relation_type,
      })
    );
  }

  return lines.join("\n");
}

// ========================================
// CODE QUALITY ISSUES OPERATIONS (v2.2)
// ========================================

export interface CodeQualityIssue {
  id?: number;
  issue_type: string;
  issue_pattern: string;
  issue_message?: string;
  file_pattern?: string;
  fix_description: string;
  fix_code?: string;
  occurrence_count?: number;
  last_occurred_at?: string;
  created_at?: string;
}

/**
 * Add a code quality issue (for learning from lint errors)
 */
export function addCodeQualityIssue(issue: CodeQualityIssue): number {
  const db = getDb();

  // Check if issue already exists
  const existing = db
    .prepare(
      "SELECT id, occurrence_count FROM code_quality_issues WHERE issue_pattern = ?"
    )
    .get(issue.issue_pattern) as
    | { id: number; occurrence_count: number }
    | undefined;

  if (existing) {
    // Update occurrence count
    db.prepare(
      "UPDATE code_quality_issues SET occurrence_count = occurrence_count + 1, last_occurred_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(existing.id);
    return existing.id;
  }

  // Insert new issue
  const stmt = db.prepare(`
    INSERT INTO code_quality_issues (
      issue_type, issue_pattern, issue_message, file_pattern,
      fix_description, fix_code
    ) VALUES (
      @issue_type, @issue_pattern, @issue_message, @file_pattern,
      @fix_description, @fix_code
    )
  `);

  const result = stmt.run({
    issue_type: issue.issue_type,
    issue_pattern: issue.issue_pattern,
    issue_message: issue.issue_message || null,
    file_pattern: issue.file_pattern || null,
    fix_description: issue.fix_description,
    fix_code: issue.fix_code || null,
  });

  return result.lastInsertRowid as number;
}

/**
 * Get common code quality issues for a file type
 */
export function getCommonIssues(
  fileType: string,
  limit = 10
): CodeQualityIssue[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM code_quality_issues
    WHERE file_pattern LIKE ? OR file_pattern IS NULL
    ORDER BY occurrence_count DESC
    LIMIT ?
  `);
  return stmt.all(`%${fileType}%`, limit) as CodeQualityIssue[];
}

/**
 * Get issue patterns (for pattern matching)
 */
export function getIssuePatterns(): { pattern: string; fix: string }[] {
  const db = getDb();
  const stmt = db.prepare(
    "SELECT issue_pattern as pattern, fix_description as fix FROM code_quality_issues ORDER BY occurrence_count DESC"
  );
  return stmt.all() as { pattern: string; fix: string }[];
}

export default {
  initDatabase,
  getDb,
  closeDatabase,
  addEntity,
  getEntity,
  getEntitiesByType,
  searchEntities,
  deleteEntity,
  addObservation,
  getObservations,
  deleteObservation,
  addRelation,
  getRelations,
  deleteRelation,
  addErrorSolution,
  findSimilarErrors,
  updateSolutionScore,
  normalizeError,
  addGitCommit,
  getCommit,
  getRecentCommits,
  getBrainCommits,
  addCodePattern,
  getPattern,
  getAllPatterns,
  searchPatterns,
  addSyncLog,
  getLastSync,
  getBrainStats,
  exportToMemoryMCPFormat,
  // Rule operations
  addRule,
  getRules,
  getRuleById,
  // MCP operations
  addMcp,
  getMcps,
  getMcpByName,
  // Code quality operations (v2.2)
  addCodeQualityIssue,
  getCommonIssues,
  getIssuePatterns,
};
