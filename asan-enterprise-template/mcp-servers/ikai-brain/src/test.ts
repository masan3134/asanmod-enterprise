/**
 * IKAI Brain System - E2E Test Suite
 * Tests all Brain API endpoints
 *
 * Run: npm run test
 */

const BRAIN_API = "http://localhost:8250";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    results.push({ name, passed: true, duration: Date.now() - start });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: String(error),
      duration: Date.now() - start,
    });
    console.log(`❌ ${name}: ${error}`);
  }
}

async function fetchJson(path: string, options?: RequestInit): Promise<any> {
  const response = await fetch(`${BRAIN_API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return response.json();
}

// ========================================
// TESTS
// ========================================

async function runTests() {
  console.log("\n🧠 IKAI Brain System - E2E Tests\n");
  console.log("=".repeat(50) + "\n");

  // Health Check
  await test("GET /brain/health", async () => {
    const data = await fetchJson("/brain/health");
    if (data.status !== "healthy") throw new Error("Not healthy");
    if (!data.version) throw new Error("Missing version");
  });

  // Stats
  await test("GET /brain/stats", async () => {
    const data = await fetchJson("/brain/stats");
    if (!data.success) throw new Error("Not successful");
    if (typeof data.stats.entities !== "number")
      throw new Error("Missing entities count");
    if (typeof data.stats.git_commits !== "number")
      throw new Error("Missing commits count");
  });

  // Query - All types
  await test("GET /brain/query?q=fix&type=all", async () => {
    const data = await fetchJson("/brain/query?q=fix&type=all");
    if (!data.success) throw new Error("Not successful");
    if (!data.results) throw new Error("Missing results");
    if (!("commits" in data.results))
      throw new Error("Missing commits in results");
  });

  // Query - Commits only
  await test("GET /brain/query?q=MOD&type=commits", async () => {
    const data = await fetchJson("/brain/query?q=MOD&type=commits&limit=5");
    if (!data.success) throw new Error("Not successful");
    if (!data.results.commits) throw new Error("Missing commits");
    if (!Array.isArray(data.results.commits))
      throw new Error("Commits not array");
  });

  // Query - Solutions
  await test("GET /brain/query?q=Maximum&type=solutions", async () => {
    const data = await fetchJson(
      "/brain/query?q=Maximum&type=solutions&limit=5"
    );
    if (!data.success) throw new Error("Not successful");
    if (!data.results.solutions) throw new Error("Missing solutions");
  });

  // Commits endpoint
  await test("GET /brain/commits?limit=5", async () => {
    const data = await fetchJson("/brain/commits?limit=5");
    if (!data.success) throw new Error("Not successful");
    if (!Array.isArray(data.commits)) throw new Error("Commits not array");
    // Check formatted response
    if (data.commits.length > 0) {
      const commit = data.commits[0];
      if (typeof commit.has_brain_block !== "boolean") {
        throw new Error("has_brain_block not boolean");
      }
      if (commit.files_changed && typeof commit.files_changed === "string") {
        throw new Error("files_changed still string, not parsed");
      }
    }
  });

  // Brain-only commits
  await test("GET /brain/commits?brainOnly=true", async () => {
    const data = await fetchJson("/brain/commits?brainOnly=true&limit=5");
    if (!data.success) throw new Error("Not successful");
    // All should have brain blocks
    for (const commit of data.commits) {
      if (!commit.has_brain_block) {
        throw new Error("Found non-brain commit in brainOnly query");
      }
    }
  });

  // Patterns
  await test("GET /brain/patterns", async () => {
    const data = await fetchJson("/brain/patterns");
    if (!data.success) throw new Error("Not successful");
    if (!Array.isArray(data.patterns)) throw new Error("Patterns not array");
  });

  // Find solution (GET)
  await test("GET /brain/find-solution?error=Maximum%20update", async () => {
    const data = await fetchJson("/brain/find-solution?error=Maximum%20update");
    if (!data.success) throw new Error("Not successful");
  });

  // Find solution (POST)
  await test("POST /brain/find-solution", async () => {
    const data = await fetchJson("/brain/find-solution", {
      method: "POST",
      body: JSON.stringify({
        errorMessage: "Maximum update depth exceeded",
      }),
    });
    if (!data.success) throw new Error("Not successful");
  });

  // Sync status
  await test("GET /brain/sync/status", async () => {
    const data = await fetchJson("/brain/sync/status");
    if (!data.success) throw new Error("Not successful");
  });

  // Error handling - Missing required param
  await test("GET /brain/query (no q param) → 400", async () => {
    const data = await fetchJson("/brain/query");
    if (data.success !== false) throw new Error("Should fail without q param");
    if (!data.error) throw new Error("Missing error message");
  });

  // 404 handling
  await test("GET /brain/nonexistent → 404", async () => {
    const data = await fetchJson("/brain/nonexistent");
    if (data.success !== false) throw new Error("Should fail for 404");
  });

  // ========================================
  // SUMMARY
  // ========================================

  console.log("\n" + "=".repeat(50));
  console.log("\n📊 Test Summary\n");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalTime = results.reduce((acc, r) => acc + r.duration, 0);

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total time: ${totalTime}ms`);

  if (failed > 0) {
    console.log("\n❌ Failed tests:");
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`   - ${r.name}: ${r.error}`);
      });
    process.exit(1);
  } else {
    console.log("\n🎉 All tests passed!");
    process.exit(0);
  }
}

runTests().catch(console.error);
