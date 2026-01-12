const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ASANMOD v1.0.0 - TEMPLATE VERIFICATION ENGINE
// Optimized for Next.js 15 Monolithic Structure

const args = process.argv.slice(2);
const targetArg = args.find((a) => a.startsWith("--target="));
const depthArg = args.find((a) => a.startsWith("--depth="));
const skipStateCheck = args.includes("--skip-state");

const target = targetArg ? targetArg.split("=")[1] : null;
const depth = depthArg ? depthArg.split("=")[1] : "surgical";

const results = {
  status: "PASS",
  checks: {
    state: "SKIPPED",
    eslint: "SKIPPED",
    tsc: "SKIPPED",
  },
  errors: [],
};

console.log(`🔍 ASAN-VERIFY: Target=${target || "ALL"} Depth=${depth}`);

// 1. PHYSICAL BARRIER: State TTL Check
if (!skipStateCheck && fs.existsSync(path.join(__dirname, "state-manager-v10.cjs"))) {
  try {
    const StateManager = require("./state-manager-v10.cjs");
    const stateManager = new StateManager();
    const { blocked, reason } = stateManager.checkBlock();

    if (blocked) {
      results.status = "FAIL";
      results.checks.state = "BLOCKED";
      results.errors.push({ source: "State-TTL", message: reason });
      console.log(`❌ STATE BLOCKED: ${reason}`);
      console.log(JSON.stringify(results, null, 2));
      process.exit(1);
    }
    results.checks.state = "PASS";
  } catch (e) {
    results.checks.state = "SKIPPED (error: " + e.message + ")";
  }
}

try {
  // 2. ESLINT CHECK
  if (fs.existsSync(path.join(process.cwd(), "package.json"))) {
    try {
      const fileToScan = target || ".";
      console.log(`RUNNING ESLINT: ${fileToScan}...`);
      execSync(`npx eslint "${fileToScan}" --max-warnings=0`, {
        stdio: "inherit",
      });
      results.checks.eslint = "PASS";
    } catch (e) {
      results.status = "FAIL";
      results.checks.eslint = "FAIL";
      results.errors.push({
        source: "ESLint",
        message: "Lint errors found. Check stdout.",
      });
    }
  }

  // 3. TSC CHECK (Type Safety)
  if (fs.existsSync(path.join(process.cwd(), "tsconfig.json"))) {
    try {
      console.log(`TYPE-CHECK: Running in root...`);
      execSync("npx tsc --noEmit", { stdio: "inherit" });
      results.checks.tsc = "PASS";
    } catch (e) {
      results.status = "FAIL";
      results.checks.tsc = "FAIL";
      results.errors.push({
        source: "TSC",
        message: "TypeScript errors found. Check stdout.",
      });
    }
  }
} catch (err) {
  results.status = "ERROR";
  results.errors.push({ source: "System", message: err.message });
}

if (results.status !== "PASS") {
  console.log(JSON.stringify(results, null, 2));
  process.exit(1);
} else {
  console.log("✅ ASANMOD VERIFICATION PASSED");
}
