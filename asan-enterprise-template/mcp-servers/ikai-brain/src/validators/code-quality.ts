/**
 * IKAI Brain System - Code Quality Validators
 * Validates code before writing to ensure first-time-right quality
 *
 * @module validators/code-quality
 * @version 2.2.0
 * @created 2025-12-15
 */

export interface CodeIssue {
  type: string;
  severity: "error" | "warning" | "info";
  line?: number;
  column?: number;
  message: string;
  fix?: string;
}

export interface ValidationResult {
  success: boolean;
  issues: CodeIssue[];
  suggestions: string[];
}

/**
 * Detect useless escape characters in code
 * These are escape characters that are not needed in the given context
 */
export function detectEscapeIssues(code: string): CodeIssue[] {
  const issues: CodeIssue[] = [];

  // Find template literals
  const templateLiteralRegex = /`[^`]*`/gs;
  const templateLiterals = code.match(templateLiteralRegex) || [];

  for (const literal of templateLiterals) {
    // Check for useless escapes in template literals
    // These are characters that don't need escaping in template literals
    const uselessEscapes = [
      { pattern: /\\[*]/g, char: "*" },
      { pattern: /\\[']/g, char: "'" },
      { pattern: /\\[:]/g, char: ":" },
      { pattern: /\\[/]/g, char: "/" },
      { pattern: /\\[#]/g, char: "#" },
      { pattern: /\\[@]/g, char: "@" },
      { pattern: /\\[!]/g, char: "!" },
      { pattern: /\\[?]/g, char: "?" },
      { pattern: /\\[&]/g, char: "&" },
      { pattern: /\\[%]/g, char: "%" },
      { pattern: /\\[<]/g, char: "<" },
      { pattern: /\\[>]/g, char: ">" },
      { pattern: /\\[=]/g, char: "=" },
      { pattern: /\\[+]/g, char: "+" },
      { pattern: /\\[-]/g, char: "-" },
      { pattern: /\\[_]/g, char: "_" },
      { pattern: /\\[|]/g, char: "|" },
      { pattern: /\\[~]/g, char: "~" },
      { pattern: /\\[\^]/g, char: "^" },
    ];

    for (const { pattern, char } of uselessEscapes) {
      if (pattern.test(literal)) {
        issues.push({
          type: "useless-escape",
          severity: "error",
          message: `Unnecessary escape character before '${char}' in template literal. Remove the backslash.`,
          fix: `Use '${char}' directly without backslash`,
        });
      }
    }

    // Check for escaped backtick inside template literal (syntax error territory)
    if (/\\`/.test(literal)) {
      issues.push({
        type: "escaped-backtick",
        severity: "error",
        message:
          "Escaped backtick inside template literal can cause syntax errors. Consider using a different approach.",
        fix: "Use string concatenation or a different quote type instead",
      });
    }
  }

  return issues;
}

/**
 * Check template literals for common issues
 */
export function checkTemplateLiteral(code: string): CodeIssue[] {
  const issues: CodeIssue[] = [];

  // Find all template literals
  const templateRegex = /`([^`\\]|\\.)*`/gs;
  let match;

  while ((match = templateRegex.exec(code)) !== null) {
    const literal = match[0];
    const startPos = match.index;

    // Check for escaped markdown characters that shouldn't be escaped
    if (/\\\*\\\*/.test(literal) || /\\\*/.test(literal)) {
      issues.push({
        type: "useless-escape-markdown",
        severity: "error",
        message:
          "Unnecessary escape before asterisk in template literal. Markdown bold/italic works without escaping.",
        fix: "Use **text** for bold and *text* for italic without backslashes",
      });
    }
  }

  return issues;
}

/**
 * Validate code against prettier settings
 */
export function validatePrettierCompliance(
  code: string,
  fileType: string,
  options: {
    semi?: boolean;
    singleQuote?: boolean;
    trailingComma?: string;
    tabWidth?: number;
  } = {}
): CodeIssue[] {
  const issues: CodeIssue[] = [];

  const { semi = true, singleQuote = false } = options;

  // Check for semicolons
  if (semi) {
    // Simple check: lines that look like statements but don't end with semicolon
    const lines = code.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Skip comments, empty lines, blocks, etc.
      if (
        !line ||
        line.startsWith("//") ||
        line.startsWith("/*") ||
        line.startsWith("*") ||
        line.endsWith("{") ||
        line.endsWith("}") ||
        line.endsWith(",") ||
        line.endsWith(";") ||
        line.startsWith("import") ||
        line.startsWith("export") ||
        line.startsWith("if") ||
        line.startsWith("else") ||
        line.startsWith("for") ||
        line.startsWith("while") ||
        line.startsWith("switch") ||
        line.startsWith("case") ||
        line.startsWith("default") ||
        line.startsWith("return") ||
        line.startsWith("throw") ||
        line.startsWith("try") ||
        line.startsWith("catch") ||
        line.startsWith("finally")
      ) {
        continue;
      }

      // Check for variable declarations and function calls
      if (
        /^(const|let|var)\s+\w+\s*=\s*.+[^;,{]$/.test(line) ||
        /^\w+\([^)]*\)[^;,{]$/.test(line)
      ) {
        issues.push({
          type: "prettier/prettier",
          severity: "warning",
          line: i + 1,
          message: "Possible missing semicolon at end of statement",
          fix: "Add semicolon at the end of the line",
        });
      }
    }
  }

  // Check for quote style
  if (!singleQuote) {
    // Check if single quotes are used where double quotes should be
    // This is a simplified check - real prettier would be more sophisticated
    const singleQuoteStrings = code.match(/'[^']*'/g) || [];
    for (const str of singleQuoteStrings) {
      // Skip if it's inside a template literal or contains double quotes
      if (!str.includes('"') && !str.includes("`")) {
        // This might be intentional, so only warn
        // issues.push({
        //   type: "prettier/prettier",
        //   severity: "info",
        //   message: `Consider using double quotes instead of single quotes`,
        //   fix: "Replace single quotes with double quotes",
        // });
      }
    }
  }

  return issues;
}

/**
 * Main validation function that combines all checks
 */
export function validateCode(
  code: string,
  fileType: string,
  options: {
    semi?: boolean;
    singleQuote?: boolean;
    trailingComma?: string;
    tabWidth?: number;
  } = {}
): CodeIssue[] {
  const allIssues: CodeIssue[] = [];

  // Run all validators
  allIssues.push(...detectEscapeIssues(code));
  allIssues.push(...checkTemplateLiteral(code));
  allIssues.push(...validatePrettierCompliance(code, fileType, options));

  return allIssues;
}

/**
 * Generate suggestions based on issues found
 */
export function generateSuggestions(issues: CodeIssue[]): string[] {
  const suggestions: string[] = [];

  const issueTypes = new Set(issues.map((i) => i.type));

  if (
    issueTypes.has("useless-escape") ||
    issueTypes.has("useless-escape-markdown")
  ) {
    suggestions.push(
      "Remove unnecessary escape characters in template literals. Use characters directly without backslashes."
    );
  }

  if (issueTypes.has("escaped-backtick")) {
    suggestions.push(
      "Avoid escaping backticks inside template literals. Use string concatenation or different quotes."
    );
  }

  if (issueTypes.has("prettier/prettier")) {
    suggestions.push(
      "Run 'npx prettier --write <file>' to automatically fix formatting issues."
    );
  }

  if (issues.length === 0) {
    suggestions.push("Code looks good! No issues detected.");
  }

  return suggestions;
}

export default {
  detectEscapeIssues,
  checkTemplateLiteral,
  validatePrettierCompliance,
  validateCode,
  generateSuggestions,
};
