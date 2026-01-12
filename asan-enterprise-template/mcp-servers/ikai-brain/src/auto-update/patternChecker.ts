/**
 * IKAI Brain System - Pattern Update Checker
 * Checks pattern freshness, detects new/updated patterns
 *
 * @module auto-update/patternChecker
 * @version 1.0.0
 * @created 2025-12-24
 */

import { getAllPatterns, getPattern, CodePattern } from "../store/sqlite.js";
import { readFileSync } from "fs";
import { join } from "path";

const PROJECT_ROOT =
  process.env.PROJECT_ROOT || "/home/root/projects/ikaicursor";

export interface PatternStatus {
  pattern_name: string;
  status: "current" | "new" | "updated" | "missing" | "unknown";
  in_brain: boolean;
  in_source: boolean;
  brain_version?: {
    updated_at: string;
    usage_count: number;
    effectiveness_score: number;
  };
  source_version?: {
    file: string;
    last_modified?: string;
  };
  differences?: {
    description?: boolean;
    example_code?: boolean;
    anti_pattern?: boolean;
    related_files?: boolean;
  };
}

export interface PatternUpdateReport {
  total_patterns: number;
  current: number;
  new: number;
  updated: number;
  missing: number;
  patterns: PatternStatus[];
  last_check: string;
}

/**
 * Extract patterns from import-asanmod-data.ts
 */
function extractPatternsFromSource(): Map<
  string,
  { pattern: Partial<CodePattern>; file: string }
> {
  const patterns = new Map<
    string,
    { pattern: Partial<CodePattern>; file: string }
  >();

  try {
    const sourceFile = join(
      PROJECT_ROOT,
      "mcp-servers/ikai-brain/scripts/import-asanmod-data.ts"
    );
    const content = readFileSync(sourceFile, "utf-8");

    // Extract ASANMOD_PATTERNS
    const asanmodPatternsMatch = content.match(
      /const ASANMOD_PATTERNS: CodePattern\[\] = \[([\s\S]*?)\];/
    );
    if (asanmodPatternsMatch) {
      const patternsBlock = asanmodPatternsMatch[1];
      const patternRegex = /pattern_name:\s*"([^"]+)"/g;
      let match;
      while ((match = patternRegex.exec(patternsBlock)) !== null) {
        const patternName = match[1];
        // Extract pattern details (simplified - full extraction would need AST parsing)
        patterns.set(patternName, {
          pattern: { pattern_name: patternName },
          file: sourceFile,
        });
      }
    }

    // Extract IKAI_PATTERNS
    const ikaiPatternsMatch = content.match(
      /const IKAI_PATTERNS: CodePattern\[\] = \[([\s\S]*?)\];/
    );
    if (ikaiPatternsMatch) {
      const patternsBlock = ikaiPatternsMatch[1];
      const patternRegex = /pattern_name:\s*"([^"]+)"/g;
      let match;
      while ((match = patternRegex.exec(patternsBlock)) !== null) {
        const patternName = match[1];
        patterns.set(patternName, {
          pattern: { pattern_name: patternName },
          file: sourceFile,
        });
      }
    }
  } catch (error) {
    console.error("Error extracting patterns from source:", error);
  }

  return patterns;
}

/**
 * Check pattern status
 */
export function checkPatternStatus(): PatternUpdateReport {
  try {
    const brainPatterns = getAllPatterns();
    const sourcePatterns = extractPatternsFromSource();

    const patternStatuses: PatternStatus[] = [];
    const brainPatternNames = new Set(brainPatterns.map((p) => p.pattern_name));
    const sourcePatternNames = new Set(Array.from(sourcePatterns.keys()));

    // Check all source patterns
    for (const [patternName, sourceInfo] of Array.from(
      sourcePatterns.entries()
    )) {
      const brainPattern = brainPatterns.find(
        (p) => p.pattern_name === patternName
      );

      const status: PatternStatus = {
        pattern_name: patternName,
        status: "unknown",
        in_brain: !!brainPattern,
        in_source: true,
      };

      if (brainPattern) {
        status.brain_version = {
          updated_at: brainPattern.updated_at || brainPattern.created_at || "",
          usage_count: brainPattern.usage_count || 0,
          effectiveness_score: brainPattern.effectiveness_score || 1.0,
        };

        // For now, assume current if exists (full comparison would need AST parsing)
        status.status = "current";
      } else {
        status.status = "new";
      }

      status.source_version = {
        file: sourceInfo.file,
      };

      patternStatuses.push(status);
    }

    // Check for patterns in Brain but not in source (missing)
    for (const brainPattern of brainPatterns) {
      if (!sourcePatternNames.has(brainPattern.pattern_name)) {
        patternStatuses.push({
          pattern_name: brainPattern.pattern_name,
          status: "missing",
          in_brain: true,
          in_source: false,
          brain_version: {
            updated_at:
              brainPattern.updated_at || brainPattern.created_at || "",
            usage_count: brainPattern.usage_count || 0,
            effectiveness_score: brainPattern.effectiveness_score || 1.0,
          },
        });
      }
    }

    const current = patternStatuses.filter(
      (p) => p.status === "current"
    ).length;
    const new_ = patternStatuses.filter((p) => p.status === "new").length;
    const updated = patternStatuses.filter(
      (p) => p.status === "updated"
    ).length;
    const missing = patternStatuses.filter(
      (p) => p.status === "missing"
    ).length;

    return {
      total_patterns: patternStatuses.length,
      current,
      new: new_,
      updated,
      missing,
      patterns: patternStatuses.sort((a, b) =>
        a.pattern_name.localeCompare(b.pattern_name)
      ),
      last_check: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("Error checking pattern status:", error);
    return {
      total_patterns: 0,
      current: 0,
      new: 0,
      updated: 0,
      missing: 0,
      patterns: [],
      last_check: new Date().toISOString(),
    };
  }
}

/**
 * Get patterns that need attention (new, updated, missing)
 */
export function getPatternsNeedingAttention(): PatternStatus[] {
  const report = checkPatternStatus();
  return report.patterns.filter(
    (p) =>
      p.status === "new" || p.status === "updated" || p.status === "missing"
  );
}

/**
 * Get summary for agents
 */
export function getPatternSummaryForAgents(): {
  total: number;
  current: number;
  needs_attention: number;
  new_patterns: string[];
  missing_patterns: string[];
  message: string;
} {
  const report = checkPatternStatus();
  const newPatterns = report.patterns
    .filter((p) => p.status === "new")
    .map((p) => p.pattern_name);
  const missingPatterns = report.patterns
    .filter((p) => p.status === "missing")
    .map((p) => p.pattern_name);

  const needsAttention = report.new + report.updated + report.missing;

  let message = `Pattern Status: ${report.current}/${report.total_patterns} current`;
  if (needsAttention > 0) {
    message += `, ${needsAttention} need attention`;
    if (newPatterns.length > 0) {
      message += ` (${newPatterns.length} new)`;
    }
    if (missingPatterns.length > 0) {
      message += ` (${missingPatterns.length} missing)`;
    }
  }

  return {
    total: report.total_patterns,
    current: report.current,
    needs_attention: needsAttention,
    new_patterns: newPatterns,
    missing_patterns: missingPatterns,
    message,
  };
}
