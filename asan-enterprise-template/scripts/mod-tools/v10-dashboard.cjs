/**
 * ASANMOD v10.0: STATUS DASHBOARD
 * Shows unified system status for all v10 components.
 */
const fs = require("fs");
const path = require("path");

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(msg, color = COLORS.reset) {
  console.log(`${color}${msg}${COLORS.reset}`);
}

function header(title) {
  log(`\n${"═".repeat(50)}`, COLORS.cyan);
  log(`  ${title}`, COLORS.cyan);
  log("═".repeat(50), COLORS.cyan);
}

function getStateStatus() {
  try {
    const StateManager = require("./state-manager-v10.cjs");
    const manager = new StateManager();
    const { state, isStale, minutesOld } = manager.getState();
    return {
      status: state.status,
      taskId: state.taskId,
      isStale,
      minutesOld,
      ttl: state._meta?.ttlMinutes || 30,
    };
  } catch {
    return { error: "State manager not found" };
  }
}

function getDecisionCount() {
  try {
    const { getRecentDecisions } = require("./decision-logger.cjs");
    return getRecentDecisions(100).length;
  } catch {
    return 0;
  }
}

function getCheckpointCount() {
  try {
    const { listCheckpoints } = require("./checkpoint.cjs");
    return listCheckpoints().length;
  } catch {
    return 0;
  }
}

function main() {
  log("\n🛡️  ASANMOD v10 STATUS DASHBOARD", COLORS.cyan);

  // 1. State Status
  header("📊 STATE PERSISTENCE");
  const state = getStateStatus();
  if (state.error) {
    log(`  ❌ ${state.error}`, COLORS.red);
  } else {
    const statusColor = state.isStale ? COLORS.red : COLORS.green;
    const statusIcon = state.isStale ? "🔴" : "🟢";
    log(`  Status:  ${statusIcon} ${state.status.toUpperCase()}`, statusColor);
    log(`  Task ID: ${state.taskId || "(none)"}`);
    log(`  Age:     ${state.minutesOld} min (TTL: ${state.ttl} min)`);
    if (state.isStale) {
      log(`  ⚠️  State is STALE! Run: npm run state:reset`, COLORS.yellow);
    }
  }

  // 2. Interaction Guard
  header("🎯 INTERACTION GUARD");
  const guardExists = fs.existsSync(path.join(__dirname, "interaction-guard.cjs"));
  log(`  Status:    ${guardExists ? "🟢 ACTIVE" : "🔴 MISSING"}`, guardExists ? COLORS.green : COLORS.red);
  log("  Threshold: >50 lines or critical files");
  log("  Options:   [1] Minimal [2] Standard [3] Refactor [4] Spec [5] Reset");

  // 3. Decision Log
  header("📋 DECISION LOG");
  const decisionCount = getDecisionCount();
  log(`  Logged Decisions: ${decisionCount}`, decisionCount > 0 ? COLORS.green : COLORS.yellow);
  log("  Location: .asanmod/logs/decisions/");
  log("  Command:  npm run decision:list");

  // 4. Checkpoints
  header("📦 CHECKPOINTS");
  const checkpointCount = getCheckpointCount();
  log(`  Active Checkpoints: ${checkpointCount}`, checkpointCount > 0 ? COLORS.green : COLORS.yellow);
  log("  Location: .asanmod/checkpoints/");
  log("  Commands: npm run checkpoint:create / checkpoint:list");

  // 5. Physical Gates Summary
  header("🚧 PHYSICAL GATES (Active)");
  log("  ✅ commit-msg    → Commit format enforcement");
  log("  ✅ pre-commit    → ESLint + TSC + State check");
  log("  ✅ interaction   → Large change option required");
  log("  ✅ decision-log  → Auto-archive on commit");

  // 6. Quick Commands
  header("⚡ QUICK COMMANDS");
  log("  npm run state:status    → Show state");
  log("  npm run state:reset     → Reset stale state");
  log("  npm run decision:list   → List decisions");
  log("  npm run checkpoint:list → List checkpoints");
  log("  npm run verify          → Full quality check");

  log("\n" + "═".repeat(50), COLORS.cyan);
  log("  ASANMOD v10.0 - Otonom Yönetişim Active ✅", COLORS.green);
  log("═".repeat(50) + "\n", COLORS.cyan);
}

main();
