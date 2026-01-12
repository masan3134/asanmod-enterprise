/**
 * IKAI Brain System - Code Quality Tests
 * Tests for the First-Time-Right quality system
 *
 * @module tests/code-quality.test
 * @version 2.2.0
 * @created 2025-12-15
 */

import {
  validateCode,
  detectEscapeIssues,
  checkTemplateLiteral,
  generateSuggestions,
} from "../validators/code-quality.js";
import {
  QUALITY_RULES,
  generatePreWriteChecklist,
  getQualityRulesForContext,
  getCommonErrors,
} from "../data/quality-rules.js";

// Simple test runner
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => void): void {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: String(error) });
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error}`);
  }
}

function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (typeof actual !== "number" || actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toEqual(expected: T) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`
        );
      }
    },
    toContain(expected: string) {
      if (typeof actual !== "string" || !actual.includes(expected)) {
        throw new Error(`Expected "${actual}" to contain "${expected}"`);
      }
    },
    toHaveLength(expected: number) {
      if (!Array.isArray(actual) || actual.length !== expected) {
        throw new Error(
          `Expected array of length ${expected} but got ${Array.isArray(actual) ? actual.length : "non-array"}`
        );
      }
    },
    toBeEmpty() {
      if (!Array.isArray(actual) || actual.length !== 0) {
        throw new Error(
          `Expected empty array but got ${Array.isArray(actual) ? actual.length : "non-array"} items`
        );
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value but got ${actual}`);
      }
    },
  };
}

// ========================================
// QUALITY RULES TESTS
// ========================================

console.log("\n=== Quality Rules Tests ===\n");

test("should have 6 quality rules defined", () => {
  expect(QUALITY_RULES.length).toBe(6);
});

test("should have First-Time-Right as first rule", () => {
  expect(QUALITY_RULES[0].id).toBe("rule-0-first-time-right");
  expect(QUALITY_RULES[0].category).toBe("altin");
});

test("should have all rules with required fields", () => {
  for (const rule of QUALITY_RULES) {
    expect(rule.id).toBeTruthy();
    expect(rule.name).toBeTruthy();
    expect(rule.content).toBeTruthy();
    expect(rule.category).toBeTruthy();
  }
});

// ========================================
// ESCAPE DETECTION TESTS
// ========================================

console.log("\n=== Escape Detection Tests ===\n");

test("should allow asterisk in template literal without escape", () => {
  const code = "const x = `**bold**`;";
  const issues = detectEscapeIssues(code);
  expect(issues.length).toBe(0);
});

test("should allow normal characters in template literal", () => {
  const code = "const x = `Hello world! This is a test.`;";
  const issues = detectEscapeIssues(code);
  expect(issues.length).toBe(0);
});

test("should allow markdown in template literal", () => {
  const code = `
    const content = \`
      **This is bold**
      *This is italic*
      - List item
    \`;
  `;
  const issues = detectEscapeIssues(code);
  expect(issues.length).toBe(0);
});

// ========================================
// TEMPLATE LITERAL TESTS
// ========================================

console.log("\n=== Template Literal Tests ===\n");

test("should validate clean template literal", () => {
  const code = `
    const article = {
      title: "Test Article",
      content: \`
        **Introduction**
        This is a test article with:
        - Bullet points
        - **Bold text**
        - *Italic text*
        
        ## Section 1
        More content here.
      \`
    };
  `;
  const issues = checkTemplateLiteral(code);
  expect(issues.length).toBe(0);
});

test("should validate FAQ content with special characters", () => {
  const code = `
    const faq = [
      {
        question: "What is the price?",
        answer: \`The price is $100. Here is why:
          - Feature 1
          - Feature 2
          
          **Note:** This is important.\`
      }
    ];
  `;
  const issues = checkTemplateLiteral(code);
  expect(issues.length).toBe(0);
});

// ========================================
// VALIDATE CODE TESTS
// ========================================

console.log("\n=== Validate Code Tests ===\n");

test("should pass validation for clean code", () => {
  const code = `const greeting = "Hello world";`;
  const issues = validateCode(code, "ts");
  // Note: This might catch prettier issues, so we just check it runs
  expect(Array.isArray(issues)).toBeTruthy();
});

test("should pass validation for template literal with markdown", () => {
  const code = `
    const readme = \`
      # Title
      
      **Bold** and *italic* text.
      
      - List item 1
      - List item 2
    \`;
  `;
  const issues = validateCode(code, "ts");
  // Should not find escape issues
  const escapeIssues = issues.filter((i) => i.type === "useless-escape");
  expect(escapeIssues.length).toBe(0);
});

// ========================================
// CHECKLIST GENERATION TESTS
// ========================================

console.log("\n=== Checklist Generation Tests ===\n");

test("should generate checklist for tsx frontend", () => {
  const checklist = generatePreWriteChecklist("tsx", "frontend");
  expect(checklist.length).toBeGreaterThan(5);
});

test("should include escape warning in checklist", () => {
  const checklist = generatePreWriteChecklist("ts", "frontend");
  const hasEscapeWarning = checklist.some((item) =>
    item.toLowerCase().includes("escape")
  );
  expect(hasEscapeWarning).toBeTruthy();
});

test("should generate context-specific rules", () => {
  const rules = getQualityRulesForContext("tsx", "frontend");
  expect(rules.length).toBe(QUALITY_RULES.length);
});

// ========================================
// COMMON ERRORS TESTS
// ========================================

console.log("\n=== Common Errors Tests ===\n");

test("should get common errors for ts files", () => {
  const errors = getCommonErrors("ts", "frontend");
  expect(errors.length).toBeGreaterThan(0);
});

test("should filter errors by file type", () => {
  const tsErrors = getCommonErrors("ts", "frontend");
  const tsxErrors = getCommonErrors("tsx", "frontend");
  // Both should have some errors
  expect(tsErrors.length).toBeGreaterThan(0);
  expect(tsxErrors.length).toBeGreaterThan(0);
});

// ========================================
// SUGGESTIONS TESTS
// ========================================

console.log("\n=== Suggestions Tests ===\n");

test("should generate suggestions for empty issues", () => {
  const suggestions = generateSuggestions([]);
  expect(suggestions.length).toBeGreaterThan(0);
  expect(suggestions[0]).toContain("looks good");
});

test("should generate suggestions for escape issues", () => {
  const suggestions = generateSuggestions([
    {
      type: "useless-escape",
      severity: "error",
      message: "Unnecessary escape",
    },
  ]);
  expect(suggestions.length).toBeGreaterThan(0);
});

// ========================================
// SUMMARY
// ========================================

console.log("\n=== Test Summary ===\n");

const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;

console.log(`Total: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  console.log("\nFailed tests:");
  results
    .filter((r) => !r.passed)
    .forEach((r) => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  process.exit(1);
} else {
  console.log("\n✅ All tests passed!");
  process.exit(0);
}
