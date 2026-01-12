/**
 * IKAI Brain System - Git Commit Learner
 * Learns from git commits, parses BRAIN blocks, and stores knowledge
 *
 * @module learners/git
 * @version 1.0.0
 * @created 2025-12-13
 */

import { execSync } from "child_process";
import {
  addGitCommit,
  addErrorSolution,
  addCodePattern,
  addObservation,
  addEntity,
  addRelation,
  getCommit,
  GitCommit,
  ErrorSolution,
  CodePattern,
  Relation,
} from "../store/sqlite.js";
import {
  processFilesForModules,
  ensureModuleEntity,
} from "../auto-update/moduleDetector.js";

// Types
export interface ParsedCommit {
  type: string;
  module: string;
  description: string;
  identity: string;
  fullMessage: string;
}

export interface BrainBlock {
  error_fix?: string;
  pattern?: string;
  files?: string[];
  tags?: string[];
  solution?: string;
  breaking?: boolean;
}

export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  timestamp: string;
  filesChanged: string[];
  insertions: number;
  deletions: number;
}

/**
 * Parse commit message to extract type, module, description, identity
 */
export function parseCommitMessage(message: string): ParsedCommit | null {
  const firstLine = message.split("\n")[0];

  // Match: type(module): description [identity]
  const match = firstLine.match(
    /^(feat|fix|docs|refactor|test|chore|style|perf|build|ci)\(([a-z0-9-]+)\):\s*(.+?)\s*\[(MOD|PROD-FIX)\]$/i
  );

  if (!match) {
    return null;
  }

  return {
    type: match[1].toLowerCase(),
    module: match[2].toLowerCase(),
    description: match[3].trim(),
    identity: match[4].toUpperCase(),
    fullMessage: message,
  };
}

/**
 * Parse BRAIN block from commit message
 */
export function parseBrainBlock(message: string): BrainBlock | null {
  // Extract content between [BRAIN] and [/BRAIN]
  const brainMatch = message.match(/\[BRAIN\]([\s\S]*?)\[\/BRAIN\]/i);

  if (!brainMatch) {
    return null;
  }

  const brainContent = brainMatch[1];
  const block: BrainBlock = {};

  // Parse each field
  const errorFixMatch = brainContent.match(/error_fix:\s*(.+?)(?:\n|$)/i);
  if (errorFixMatch) {
    block.error_fix = errorFixMatch[1].trim();
  }

  const patternMatch = brainContent.match(/pattern:\s*(.+?)(?:\n|$)/i);
  if (patternMatch) {
    block.pattern = patternMatch[1].trim();
  }

  const filesMatch = brainContent.match(/files:\s*(.+?)(?:\n|$)/i);
  if (filesMatch) {
    block.files = filesMatch[1]
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
  }

  const tagsMatch = brainContent.match(/tags:\s*(.+?)(?:\n|$)/i);
  if (tagsMatch) {
    block.tags = tagsMatch[1]
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  const solutionMatch = brainContent.match(/solution:\s*(.+?)(?:\n|$)/i);
  if (solutionMatch) {
    block.solution = solutionMatch[1].trim();
  }

  const breakingMatch = brainContent.match(/breaking:\s*(true|false)(?:\n|$)/i);
  if (breakingMatch) {
    block.breaking = breakingMatch[1].toLowerCase() === "true";
  }

  return Object.keys(block).length > 0 ? block : null;
}

/**
 * Get changed files for a commit
 */
export function getChangedFiles(commitHash: string): string[] {
  try {
    const output = execSync(
      `git diff-tree --no-commit-id --name-only -r ${commitHash}`,
      {
        encoding: "utf-8",
        cwd: process.env.PROJECT_ROOT || process.cwd(),
      }
    );
    return output
      .trim()
      .split("\n")
      .filter((f) => f.length > 0);
  } catch (error) {
    console.error("Error getting changed files:", error);
    return [];
  }
}

/**
 * Get commit info from git
 */
export function getCommitInfo(commitHash: string): CommitInfo | null {
  try {
    // Get commit details
    const message = execSync(`git log -1 --pretty=%B ${commitHash}`, {
      encoding: "utf-8",
      cwd: process.env.PROJECT_ROOT || process.cwd(),
    }).trim();

    const author = execSync(`git log -1 --pretty=%an ${commitHash}`, {
      encoding: "utf-8",
      cwd: process.env.PROJECT_ROOT || process.cwd(),
    }).trim();

    const timestamp = execSync(`git log -1 --pretty=%aI ${commitHash}`, {
      encoding: "utf-8",
      cwd: process.env.PROJECT_ROOT || process.cwd(),
    }).trim();

    // Get file changes stats
    const statsOutput = execSync(`git show --stat --format="" ${commitHash}`, {
      encoding: "utf-8",
      cwd: process.env.PROJECT_ROOT || process.cwd(),
    }).trim();

    // Parse insertions and deletions from stats
    let insertions = 0;
    let deletions = 0;
    const statsMatch = statsOutput.match(
      /(\d+) insertions?\(\+\).*?(\d+) deletions?\(-\)/
    );
    if (statsMatch) {
      insertions = parseInt(statsMatch[1], 10);
      deletions = parseInt(statsMatch[2], 10);
    }

    const filesChanged = getChangedFiles(commitHash);

    return {
      hash: commitHash,
      message,
      author,
      timestamp,
      filesChanged,
      insertions,
      deletions,
    };
  } catch (error) {
    console.error("Error getting commit info:", error);
    return null;
  }
}

/**
 * Categorize files by module
 */
export function categorizeFiles(files: string[]): Record<string, string[]> {
  const categories: Record<string, string[]> = {
    backend: [],
    frontend: [],
    asanmod: [],
    db: [],
    infra: [],
    brain: [],
    docs: [],
    other: [],
  };

  for (const file of files) {
    if (file.startsWith("backend/")) {
      categories.backend.push(file);
    } else if (file.startsWith("frontend/")) {
      categories.frontend.push(file);
    } else if (
      file.startsWith("mcp-servers/asanmod-mcp/") ||
      file.includes("asanmod")
    ) {
      categories.asanmod.push(file);
    } else if (file.startsWith("mcp-servers/ikai-brain/")) {
      categories.brain.push(file);
    } else if (file.includes("prisma") || file.includes("migration")) {
      categories.db.push(file);
    } else if (
      file.includes("pm2") ||
      file.includes("nginx") ||
      file.includes("deploy") ||
      file.startsWith("scripts/")
    ) {
      categories.infra.push(file);
    } else if (file.startsWith("docs/") || file.endsWith(".md")) {
      categories.docs.push(file);
    } else {
      categories.other.push(file);
    }
  }

  return categories;
}

/**
 * Detect patterns from commit changes
 */
export function detectPatterns(files: string[], message: string): string[] {
  const patterns: string[] = [];

  // React hooks pattern
  if (
    files.some((f) => f.endsWith(".tsx") || f.endsWith(".jsx")) &&
    (message.includes("useCallback") ||
      message.includes("useEffect") ||
      message.includes("useState") ||
      message.includes("useRef"))
  ) {
    patterns.push("PATTERN_IKAI_REACT_HOOKS");
  }

  // RBAC pattern
  if (
    message.toLowerCase().includes("rbac") ||
    message.toLowerCase().includes("role") ||
    message.toLowerCase().includes("permission") ||
    message.toLowerCase().includes("authorization")
  ) {
    patterns.push("PATTERN_IKAI_RBAC");
  }

  // File upload pattern
  if (
    message.toLowerCase().includes("upload") ||
    message.toLowerCase().includes("minio") ||
    message.toLowerCase().includes("multer")
  ) {
    patterns.push("PATTERN_IKAI_FILE_UPLOAD");
  }

  // API endpoint pattern
  if (
    files.some(
      (f) =>
        f.includes("Controller") ||
        f.includes("Route") ||
        f.includes("controller") ||
        f.includes("route")
    )
  ) {
    patterns.push("PATTERN_IKAI_API_ENDPOINT");
  }

  // Database pattern
  if (
    files.some(
      (f) =>
        f.includes("prisma") || f.includes("Service") || f.includes("service")
    ) &&
    (message.toLowerCase().includes("query") ||
      message.toLowerCase().includes("database") ||
      message.toLowerCase().includes("model"))
  ) {
    patterns.push("PATTERN_IKAI_DATABASE");
  }

  // Rate limiting pattern
  if (
    message.toLowerCase().includes("rate") ||
    message.toLowerCase().includes("429") ||
    message.toLowerCase().includes("throttle")
  ) {
    patterns.push("PATTERN_IKAI_RATE_LIMITING");
  }

  // Build/Deploy pattern
  if (
    files.some(
      (f) =>
        f.includes("pm2") ||
        f.includes("deploy") ||
        f.includes("build") ||
        f.includes("ecosystem")
    )
  ) {
    patterns.push("PATTERN_IKAI_DEPLOYMENT");
  }

  return [...new Set(patterns)];
}

/**
 * Main function: Learn from a git commit
 */
export async function learnFromCommit(commitHash: string): Promise<{
  success: boolean;
  commit?: GitCommit;
  brainBlock?: BrainBlock;
  errorSolution?: ErrorSolution;
  pattern?: CodePattern;
  message: string;
}> {
  console.log(`🧠 Learning from commit: ${commitHash}`);

  // Check if already learned
  const existing = getCommit(commitHash);
  if (existing) {
    return {
      success: true,
      commit: existing,
      message: "Commit already learned",
    };
  }

  // Get commit info
  const commitInfo = getCommitInfo(commitHash);
  if (!commitInfo) {
    return {
      success: false,
      message: `Failed to get commit info for ${commitHash}`,
    };
  }

  // Parse commit message
  const parsed = parseCommitMessage(commitInfo.message);
  if (!parsed) {
    console.log(
      `⚠️ Could not parse commit message format: ${commitInfo.message.split("\n")[0]}`
    );
    // Still store the commit even if we can't parse it
  }

  // Parse BRAIN block
  const brainBlock = parseBrainBlock(commitInfo.message);

  // Categorize files
  const categories = categorizeFiles(commitInfo.filesChanged);

  // Detect patterns
  const detectedPatterns = detectPatterns(
    commitInfo.filesChanged,
    commitInfo.message
  );

  // Build commit record
  const commit: GitCommit = {
    commit_hash: commitHash,
    message: commitInfo.message,
    type: parsed?.type,
    module: parsed?.module,
    identity: parsed?.identity,
    author: commitInfo.author,
    files_changed: commitInfo.filesChanged,
    insertions: commitInfo.insertions,
    deletions: commitInfo.deletions,
    has_brain_block: !!brainBlock,
    brain_block: brainBlock || undefined,
    error_fix: brainBlock?.error_fix,
    pattern: brainBlock?.pattern || detectedPatterns[0],
    tags: brainBlock?.tags || detectedPatterns,
    solution: brainBlock?.solution,
    is_breaking: brainBlock?.breaking,
    commit_timestamp: commitInfo.timestamp,
  };

  // Store commit
  addGitCommit(commit);
  console.log(`✅ Stored commit: ${commitHash}`);

  let errorSolution: ErrorSolution | undefined;
  let codePattern: CodePattern | undefined;

  // If error fix, store solution
  if (brainBlock?.error_fix && brainBlock?.solution) {
    errorSolution = {
      error_pattern: brainBlock.error_fix,
      solution_description: brainBlock.solution,
      solution_files: brainBlock.files || commitInfo.filesChanged,
      related_pattern: brainBlock.pattern,
      tags: brainBlock.tags,
      commit_hash: commitHash,
    };
    addErrorSolution(errorSolution);
    console.log(`✅ Stored error solution: ${brainBlock.error_fix}`);
  }

  // If pattern, store/update pattern
  if (brainBlock?.pattern) {
    codePattern = {
      pattern_name: brainBlock.pattern,
      pattern_type: categorizePattern(brainBlock.pattern),
      description:
        brainBlock.solution || parsed?.description || "Pattern from commit",
      related_files: brainBlock.files,
      tags: brainBlock.tags,
      created_from_commit: commitHash,
    };
    addCodePattern(codePattern);
    console.log(`✅ Stored pattern: ${brainBlock.pattern}`);
  }

  // Auto-detect modules from files and create relations
  const detectedModules = processFilesForModules(commitInfo.filesChanged);
  if (detectedModules.length > 0) {
    console.log(
      `✅ Auto-detected ${detectedModules.length} modules: ${detectedModules.join(", ")}`
    );
  }

  // Add observations to relevant entities
  if (parsed) {
    const entityId = `IKAI_${parsed.module.toUpperCase()}`;

    // Ensure entity exists
    ensureModuleEntity(entityId);

    // Add observation
    addObservation({
      entity_id: entityId,
      content: `${parsed.type}: ${parsed.description}`,
      source: "git",
      source_ref: commitHash,
    });
    console.log(`✅ Added observation to ${entityId}`);
  } else if (detectedModules.length > 0) {
    // If no parsed module but we detected modules, add observation to first detected module
    const primaryModule = detectedModules[0];
    addObservation({
      entity_id: primaryModule,
      content: `Commit: ${commitInfo.message.split("\n")[0]}`,
      source: "git",
      source_ref: commitHash,
    });
    console.log(`✅ Added observation to ${primaryModule}`);
  }

  // Auto-create pattern → module relations if pattern was detected
  if (codePattern && detectedModules.length > 0) {
    for (const moduleId of detectedModules) {
      try {
        const relation: Relation = {
          from_entity: codePattern.pattern_name,
          to_entity: moduleId,
          relation_type: "applies_to",
          strength: 1.0,
        };
        addRelation(relation);
      } catch (error) {
        // Relation might already exist, ignore
      }
    }
  }

  return {
    success: true,
    commit,
    brainBlock: brainBlock || undefined,
    errorSolution,
    pattern: codePattern,
    message: `Successfully learned from commit ${commitHash}`,
  };
}

/**
 * Categorize pattern by name
 */
function categorizePattern(patternName: string): string {
  const name = patternName.toLowerCase();

  if (name.includes("react") || name.includes("hook")) return "react-hooks";
  if (name.includes("rbac") || name.includes("auth")) return "security";
  if (name.includes("database") || name.includes("prisma")) return "database";
  if (name.includes("api") || name.includes("endpoint")) return "api";
  if (name.includes("file") || name.includes("upload")) return "file-upload";
  if (name.includes("deploy") || name.includes("build")) return "deployment";
  if (name.includes("rate") || name.includes("limit")) return "rate-limiting";

  return "general";
}

/**
 * Learn from multiple recent commits
 */
export async function learnFromRecentCommits(
  count = 20
): Promise<{ learned: number; errors: number }> {
  try {
    const hashes = execSync(`git log --oneline -${count} --format=%H`, {
      encoding: "utf-8",
      cwd: process.env.PROJECT_ROOT || process.cwd(),
    })
      .trim()
      .split("\n")
      .filter(Boolean);

    let learned = 0;
    let errors = 0;

    for (const hash of hashes) {
      const result = await learnFromCommit(hash);
      if (result.success) {
        learned++;
      } else {
        errors++;
      }
    }

    return { learned, errors };
  } catch (error) {
    console.error("Error learning from recent commits:", error);
    return { learned: 0, errors: 1 };
  }
}

export default {
  parseCommitMessage,
  parseBrainBlock,
  getChangedFiles,
  getCommitInfo,
  categorizeFiles,
  detectPatterns,
  learnFromCommit,
  learnFromRecentCommits,
};
