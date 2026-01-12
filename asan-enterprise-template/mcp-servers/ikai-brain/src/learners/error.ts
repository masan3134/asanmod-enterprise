/**
 * IKAI Brain System - Error Solution Learner
 * Learns from error solutions, normalizes patterns, and provides solutions
 *
 * @module learners/error
 * @version 1.0.0
 * @created 2025-12-13
 */

import {
  addErrorSolution,
  findSimilarErrors,
  updateSolutionScore,
  normalizeError,
  ErrorSolution,
} from "../store/sqlite.js";

// Types
export interface ErrorInput {
  errorMessage: string;
  errorType?: string;
  stackTrace?: string;
  filePath?: string;
  lineNumber?: number;
  context?: string;
}

export interface SolutionInput {
  error: ErrorInput;
  solution: string;
  solutionCode?: string;
  filesChanged?: string[];
  steps?: string[];
  pattern?: string;
  tags?: string[];
  commitHash?: string;
}

export interface SolutionResult {
  found: boolean;
  solutions: Array<{
    id: number;
    pattern: string;
    solution: string;
    solutionCode?: string;
    solutionFiles?: string[];
    successRate: number;
    matchScore: number;
  }>;
  bestSolution?: {
    id: number;
    pattern: string;
    solution: string;
    solutionCode?: string;
    solutionFiles?: string[];
    successRate: number;
  };
}

/**
 * Normalize error message for pattern matching
 * Removes specific details to create a generalizable pattern
 */
export function normalizeErrorMessage(error: string): string {
  return (
    error
      // Remove line numbers
      .replace(/at line \d+/gi, "at line X")
      .replace(/line \d+/gi, "line X")
      .replace(/:\d+:\d+/g, ":X:X")
      // Remove file paths
      .replace(/in \/[^\s]+\//g, "in /.../")
      .replace(/\/[a-zA-Z0-9_\-./]+\.(ts|tsx|js|jsx)/g, "/.../$1")
      // Remove hashes and IDs
      .replace(/[a-f0-9]{7,40}/gi, "HASH")
      .replace(/[a-f0-9-]{36}/gi, "UUID")
      // Remove dates and times
      .replace(/\d{4}-\d{2}-\d{2}/g, "DATE")
      .replace(/\d{2}:\d{2}:\d{2}/g, "TIME")
      // Remove version numbers
      .replace(/\d+\.\d+\.\d+/g, "VERSION")
      // Remove port numbers
      .replace(/port \d+/gi, "port X")
      .replace(/:\d{4,5}/g, ":PORT")
      // Remove specific numbers in errors
      .replace(/error #\d+/gi, "error #X")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Extract error type from error message
 */
export function extractErrorType(error: string): string {
  // Common React errors
  if (error.includes("Maximum update depth exceeded"))
    return "react-infinite-loop";
  if (error.includes("Rendered more hooks")) return "react-hooks-order";
  if (error.includes("Invalid hook call")) return "react-invalid-hook";
  if (error.includes("Hydration")) return "react-hydration";

  // JavaScript/TypeScript errors
  if (error.includes("TypeError")) return "type-error";
  if (error.includes("ReferenceError")) return "reference-error";
  if (error.includes("SyntaxError")) return "syntax-error";
  if (error.includes("Cannot read properties")) return "null-reference";

  // HTTP errors
  if (error.includes("429")) return "rate-limit";
  if (error.includes("500")) return "server-error";
  if (error.includes("404")) return "not-found";
  if (error.includes("401") || error.includes("403")) return "auth-error";

  // Database errors
  if (error.includes("Prisma")) return "prisma-error";
  if (error.includes("Invalid invocation")) return "prisma-invalid";
  if (error.includes("constraint")) return "db-constraint";

  // Build errors
  if (error.includes("Module not found")) return "module-not-found";
  if (error.includes("Build failed")) return "build-error";
  if (error.includes("Compilation error")) return "compilation-error";

  // Network errors
  if (error.includes("ECONNREFUSED")) return "connection-refused";
  if (error.includes("EADDRINUSE")) return "port-in-use";
  if (error.includes("timeout")) return "timeout";

  return "unknown";
}

/**
 * Extract file pattern from stack trace
 */
export function extractFilePattern(stackTrace?: string): string | undefined {
  if (!stackTrace) return undefined;

  // Find file references in stack trace
  const fileMatches = stackTrace.match(
    /(?:frontend|backend|mcp-servers)\/[a-zA-Z0-9_\-./]+\.(ts|tsx|js|jsx)/g
  );

  if (fileMatches && fileMatches.length > 0) {
    // Get unique file patterns
    const patterns = [...new Set(fileMatches)];

    // Return the most relevant (first) file, generalized
    const first = patterns[0];
    return first
      .replace(/\[[^\]]+\]/g, "[*]") // Dynamic routes
      .replace(/\d+/g, "*"); // Numbers to wildcards
  }

  return undefined;
}

/**
 * Find solution for an error
 */
export function findSolution(error: ErrorInput): SolutionResult {
  const normalizedError = normalizeErrorMessage(error.errorMessage);
  const errorType = error.errorType || extractErrorType(error.errorMessage);

  console.log(
    `🔍 Searching for solution: ${normalizedError.substring(0, 50)}...`
  );

  // Search for similar errors
  const similarErrors = findSimilarErrors(error.errorMessage, 5);

  if (similarErrors.length === 0) {
    return {
      found: false,
      solutions: [],
    };
  }

  // Map to result format
  const solutions = similarErrors.map((s) => ({
    id: s.id!,
    pattern: s.error_pattern,
    solution: s.solution_description,
    solutionCode: s.solution_code,
    solutionFiles: s.solution_files,
    successRate:
      s.success_count && s.fail_count
        ? s.success_count / (s.success_count + s.fail_count)
        : 1,
    matchScore: (s as any).match_score || 50,
  }));

  // Sort by match score and success rate
  solutions.sort((a, b) => {
    const scoreA = a.matchScore * a.successRate;
    const scoreB = b.matchScore * b.successRate;
    return scoreB - scoreA;
  });

  return {
    found: true,
    solutions,
    bestSolution: solutions[0],
  };
}

/**
 * Store a new error solution
 */
export function storeSolution(input: SolutionInput): number {
  const normalizedPattern = normalizeErrorMessage(input.error.errorMessage);
  const errorType =
    input.error.errorType || extractErrorType(input.error.errorMessage);
  const filePattern =
    extractFilePattern(input.error.stackTrace) || input.error.filePath;

  const solution: ErrorSolution = {
    error_pattern: normalizedPattern,
    error_message: input.error.errorMessage,
    error_type: errorType,
    file_pattern: filePattern,
    stack_trace_pattern: input.error.stackTrace
      ? normalizeErrorMessage(input.error.stackTrace)
      : undefined,
    solution_description: input.solution,
    solution_code: input.solutionCode,
    solution_files: input.filesChanged,
    solution_steps: input.steps,
    related_pattern: input.pattern,
    tags: input.tags,
    commit_hash: input.commitHash,
  };

  const id = addErrorSolution(solution);
  console.log(
    `✅ Stored error solution #${id}: ${normalizedPattern.substring(0, 50)}...`
  );

  return id;
}

/**
 * Mark a solution as successful or failed
 */
export function markSolutionResult(solutionId: number, success: boolean): void {
  updateSolutionScore(solutionId, success);
  console.log(
    `📊 Updated solution #${solutionId}: ${success ? "success" : "fail"}`
  );
}

/**
 * Learn from an error and its solution
 */
export function learnFromError(
  error: ErrorInput,
  solution: string,
  options?: {
    solutionCode?: string;
    filesChanged?: string[];
    steps?: string[];
    pattern?: string;
    tags?: string[];
    commitHash?: string;
  }
): { id: number; pattern: string } {
  const id = storeSolution({
    error,
    solution,
    ...options,
  });

  return {
    id,
    pattern: normalizeErrorMessage(error.errorMessage),
  };
}

/**
 * Get common error patterns
 */
export function getCommonErrorPatterns(): Array<{
  type: string;
  pattern: string;
  commonCause: string;
  typicalSolution: string;
}> {
  return [
    {
      type: "react-infinite-loop",
      pattern: "Maximum update depth exceeded",
      commonCause: "Unstable reference in useEffect/useCallback dependencies",
      typicalSolution:
        "Remove unstable references (toast, router) from dependency arrays or use useRef guard",
    },
    {
      type: "rate-limit",
      pattern: "429 Too Many Requests",
      commonCause:
        "Too many API calls in short time, React Strict Mode double invocation",
      typicalSolution:
        "Add useRef guard, increase interval, disable rate limiter in DEV",
    },
    {
      type: "prisma-invalid",
      pattern: "Invalid `prisma.*.` invocation",
      commonCause: "Invalid query parameters or schema mismatch",
      typicalSolution:
        "Check Prisma query syntax, use in-memory filtering for complex conditions",
    },
    {
      type: "react-hydration",
      pattern: "Hydration failed because",
      commonCause: "Server/client content mismatch",
      typicalSolution:
        "Use useEffect for client-only code, avoid Date/Math.random in SSR",
    },
    {
      type: "module-not-found",
      pattern: "Module not found: Can't resolve",
      commonCause: "Missing dependency or incorrect import path",
      typicalSolution: "npm install missing package or fix import path",
    },
    {
      type: "port-in-use",
      pattern: "EADDRINUSE",
      commonCause: "Port already in use by another process",
      typicalSolution:
        "Kill process using port or use different port: lsof -i :PORT",
    },
    {
      type: "null-reference",
      pattern: "Cannot read properties of null",
      commonCause: "Accessing property on null/undefined object",
      typicalSolution: "Add optional chaining (?.) or null check before access",
    },
    {
      type: "chunk-load",
      pattern: "Loading chunk * failed",
      commonCause: "Missing static files in standalone build",
      typicalSolution:
        "Copy .next/static to standalone/.next/static after build",
    },
  ];
}

/**
 * Auto-detect and suggest solution for common errors
 */
export function autoSuggestSolution(error: ErrorInput): {
  found: boolean;
  suggestion?: {
    type: string;
    cause: string;
    solution: string;
    confidence: number;
  };
} {
  const errorType = extractErrorType(error.errorMessage);
  const patterns = getCommonErrorPatterns();

  const match = patterns.find((p) => p.type === errorType);

  if (match) {
    return {
      found: true,
      suggestion: {
        type: match.type,
        cause: match.commonCause,
        solution: match.typicalSolution,
        confidence: 0.8,
      },
    };
  }

  // Try to find in database
  const dbResult = findSolution(error);
  if (dbResult.found && dbResult.bestSolution) {
    return {
      found: true,
      suggestion: {
        type: errorType,
        cause: "Previously solved error",
        solution: dbResult.bestSolution.solution,
        confidence: dbResult.bestSolution.successRate,
      },
    };
  }

  return { found: false };
}

export default {
  normalizeErrorMessage,
  extractErrorType,
  extractFilePattern,
  findSolution,
  storeSolution,
  markSolutionResult,
  learnFromError,
  getCommonErrorPatterns,
  autoSuggestSolution,
};
