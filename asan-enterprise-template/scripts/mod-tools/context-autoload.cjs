#!/usr/bin/env node

/**
 * ASANMOD v9.1 - Context Auto-Load
 *
 * Automatically detects task type from keywords and suggests relevant Context Pack.
 *
 * Usage: node scripts/mod-tools/context-autoload.cjs "<task description>"
 *
 * @example
 * node scripts/mod-tools/context-autoload.cjs "add new API endpoint for users"
 * → Suggests: ContextPack_API.md
 */

const KEYWORD_MAP = {
  // API/Backend
  "route|api|endpoint|middleware|controller|request|response|express": {
    pack: "ContextPack_API.md",
    rules: ["API_RULES.md", "AUTH_RULES.md"],
  },
  // Database
  "prisma|schema|migration|model|database|db|query|relation": {
    pack: "ContextPack_DB.md",
    rules: ["DB_RULES.md"],
  },
  // Authentication
  "auth|rbac|permission|session|login|logout|role|middleware\\.ts": {
    pack: "ContextPack_AUTH.md",
    rules: ["AUTH_RULES.md"],
  },
  // Deployment
  "pm2|deploy|restart|production|prod|staging|nginx|ecosystem": {
    pack: "ContextPack_DEPLOY.md",
    rules: [],
  },
  // SEO
  "seo|meta|sitemap|og|opengraph|robots|canonical|structured": {
    pack: "ContextPack_SEO.md",
    rules: [],
  },
  // UI/Frontend
  "component|tailwind|css|ui|button|modal|form|frontend|react|next": {
    pack: "ContextPack_UI.md",
    rules: ["UI_RULES.md"],
  },
};

const PACKS_PATH = "docs/packs/";
const RULES_PATH = "docs/rules/";

function detectContextPack(taskDescription) {
  const normalizedTask = taskDescription.toLowerCase();
  const matches = [];

  for (const [keywordPattern, config] of Object.entries(KEYWORD_MAP)) {
    const regex = new RegExp(keywordPattern, "i");
    if (regex.test(normalizedTask)) {
      matches.push({
        pack: config.pack,
        rules: config.rules,
        pattern: keywordPattern,
      });
    }
  }

  return matches;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node context-autoload.cjs "<task description>"');
    console.log("");
    console.log("Example:");
    console.log(
      '  node context-autoload.cjs "add prisma migration for user avatar"'
    );
    process.exit(0);
  }

  const taskDescription = args.join(" ");
  const matches = detectContextPack(taskDescription);

  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║  🧠 ASANMOD v9.1 CONTEXT AUTO-LOADER                   ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  console.log("");
  console.log(`📝 Task: "${taskDescription}"`);
  console.log("");

  if (matches.length === 0) {
    console.log("⚠️  No specific Context Pack detected.");
    console.log("📖 Read: docs/AGENT_QUICK_REF.md (general reference)");
    process.exit(0);
  }

  console.log("📦 Suggested Context Pack(s):");
  console.log("");

  const uniquePacks = [...new Set(matches.map((m) => m.pack))];
  const allRules = [...new Set(matches.flatMap((m) => m.rules))];

  uniquePacks.forEach((pack, i) => {
    console.log(`   ${i + 1}. ${PACKS_PATH}${pack}`);
  });

  if (allRules.length > 0) {
    console.log("");
    console.log("📜 Also read these rules:");
    allRules.forEach((rule, i) => {
      console.log(`   ${i + 1}. ${RULES_PATH}${rule}`);
    });
  }

  console.log("");
  console.log("─────────────────────────────────────────────────────────");
  console.log("💡 Tip: Run this before starting any task for JIT context.");
}

main();
