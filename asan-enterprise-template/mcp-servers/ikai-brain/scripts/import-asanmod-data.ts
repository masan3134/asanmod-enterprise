/**
 * IKAI Brain System - ASANMOD Data Import Script
 * Imports all rules, MCPs, and patterns into the Brain
 *
 * @module scripts/import-asanmod-data
 * @version 1.0.0
 * @created 2025-12-13
 * @lastUpdated 2025-12-24
 */

import {
  initDatabase,
  addRule,
  addMcp,
  addCodePattern,
  Rule,
  MCP,
  CodePattern,
} from "../src/store/sqlite.js";

// ========================================
// 18 ASANMOD RULES
// ========================================

const ASANMOD_RULES: Rule[] = [
  {
    id: "rule-0-max-performance",
    name: "Rule 0-MAX-PERFORMANCE",
    category: "altin",
    description:
      "Her zaman max performance (200 tool call/execution), paralel çalışma zorunlu",
    content: `ALTIN KURAL - MANDATORY!
- 200 Tool Call/Execution: Her zaman aktif (default limit: 25 değil, 200!)
- Paralel Çalışma ZORUNLU: Tüm sequential işlemler paralel hale getirilmeli
- Batch Operations ZORUNLU: 2+ dosya okuma/yazma/edit batch yapılmalı
- Promise.all/Promise.allSettled ZORUNLU: Tüm independent işlemler paralel çalışmalı
- Memory MCP Selective Read ZORUNLU: Full graph read YASAK, selective read ZORUNLU
- No Sequential Awaits: await X; await Y; → await Promise.all([X, Y]) ZORUNLU!`,
    priority: 0,
    is_mandatory: true,
    keywords: [
      "performance",
      "parallel",
      "batch",
      "promise.all",
      "sequential",
      "200",
    ],
  },
  {
    id: "rule-0-pm2-logs",
    name: "Rule 0-PM2-LOGS",
    category: "altin",
    description: "PM2 loglarında hata varsa commit yapılamaz",
    content: `ALTIN KURAL - MANDATORY!
- Pre-commit hook: TÜM 4 servis kontrol edilir (ikai-dev-backend, ikai-dev-frontend, ikai-prod-backend, ikai-prod-frontend)
- Backend hataları: 500, Prisma errors, Invalid invocation → COMMIT BLOKE
- Frontend hataları: 500, route errors, build errors → COMMIT BLOKE
- Post-commit hook: Commit sonrası uyarı varsa → YENİ COMMIT GEREKİR
- NO EXCEPTIONS: "Sadece küçük bir hata" → FIX FIRST!`,
    priority: 1,
    is_mandatory: true,
    keywords: ["pm2", "logs", "commit", "error", "pre-commit", "post-commit"],
  },
  {
    id: "rule-0-mcp-first",
    name: "Rule 0-MCP-FIRST",
    category: "altin",
    description:
      "Tüm işlemler için MCP kullan - Filesystem MCP ve Memory MCP ZORUNLU",
    content: `ALTIN KURAL - EN ÜSTÜN ÖNCELİK!
- Filesystem MCP ZORUNLU: Tüm dosya işlemleri için (read, write, edit, list, search)
- Memory MCP ZORUNLU: Tüm context/memory işlemleri için
- Terminal Komutları YASAK: Dosya işlemleri için (cat, tail, head, ls, find, stat)
- Node.js fs YASAK: fs.readFileSync(), fs.writeFileSync() → Filesystem MCP kullan!
- BATCH OPTIMIZATION ZORUNLU:
  - 2+ dosya okuma: MUTLAKA read_multiple_files kullan (10x hızlanma!)
  - 2+ dosya yazma: MUTLAKA Promise.all ile paralel yaz (5-10x hızlanma!)`,
    priority: 2,
    is_mandatory: true,
    keywords: ["mcp", "filesystem", "memory", "terminal", "yasak", "batch"],
  },
  {
    id: "rule-0-terminal",
    name: "Rule 0-TERMINAL",
    category: "altin",
    description: "Kullanıcıya hiçbir şey yaptırma - Agent tüm işlemleri yapar",
    content: `ALTIN KURAL - ZORUNLU!
- ❌ "Backend restart gerekebilir" → ✅ Ben restart ederim!
- ❌ "PM2 process'i restart edin" → ✅ Ben restart ederim!
- ❌ "Terminal'de şunu yapın" → ✅ Ben yaparım!
- ❌ "MCP ile kontrol edin" → ✅ Ben kontrol ederim!
- ZORUNLU: Terminal, PM2, Git, MCP, Database işlemlerini BEN yaparım!`,
    priority: 3,
    is_mandatory: true,
    keywords: ["terminal", "user", "yapma", "restart", "pm2"],
  },
  {
    id: "rule-0-production-ready",
    name: "Rule 0 Production-Ready",
    category: "altin",
    description: "Production-ready only (19 yasak kelime)",
    content: `ALTIN KURAL!
19 FORBIDDEN WORDS: See Brain API for full list
MANDATORY: Real API calls (apiClient), real data (Prisma), real pages (Next.js App Router)
Before saying "done": grep check must return 0`,
    priority: 4,
    is_mandatory: true,
    keywords: ["production", "forbidden-words", "production-ready"],
  },
  {
    id: "rule-0-pagespeed-seo-quality",
    name: "Rule 0-Pagespeed-SEO-Quality",
    category: "altin",
    description:
      "PageSpeed, SEO ve tüm kalite metrikleri 100 olmalı (KALICI KURAL)",
    content: `ALTIN KURAL - KALICI!
PageSpeed Insights + SEO + Accessibility + Best Practices = 100/100 ZORUNLU

PERFORMANCE (100/100):
- LCP < 2.5s (Largest Contentful Paint)
- FCP < 1.0s (First Contentful Paint)
- TBT < 100ms (Total Blocking Time)
- CLS = 0 (Cumulative Layout Shift)
- Speed Index < 2.0s

OPTIMIZATIONS:
- Critical CSS inline (above-the-fold)
- CSS async loading (non-blocking)
- Image optimization (WebP/AVIF, responsive srcset)
- JavaScript chunk splitting (landing page separate)
- Tree shaking (unused code removal)
- Code splitting (dynamic imports)

SEO (100/100):
- Valid robots.txt (no unknown directives)
- Meta tags (title, description, og:image)
- Structured data (JSON-LD)
- Canonical URLs
- Sitemap.xml valid
- Heading hierarchy (h1-h6 sequential)

ACCESSIBILITY (100/100):
- Color contrast ratio ≥ 4.5:1 (WCAG AA)
- Touch targets ≥ 44x44px
- Alt text for all images
- ARIA labels where needed
- Keyboard navigation support

BEST PRACTICES (100/100):
- HTTPS enabled
- Security headers (CSP, HSTS, COOP, X-Frame-Options)
- No deprecated APIs
- Valid HTML/CSS
- No console errors

VERIFICATION:
- PageSpeed Insights: https://pagespeed.web.dev/
- Lighthouse CI (automated)
- Pre-commit hook: asanmod_verify_pagespeed
- Post-deploy verification: asanmod_verify_production_quality

KALICI: Bu kural ASLA geri alınmayacak!`,
    priority: 5,
    is_mandatory: true,
    keywords: [
      "pagespeed",
      "seo",
      "lighthouse",
      "performance",
      "accessibility",
      "best-practices",
      "quality",
      "100",
      "kalici",
      "core-web-vitals",
      "lcp",
      "fcp",
      "cls",
      "tbt",
    ],
  },
  {
    id: "rule-0-lint-quality",
    name: "Rule 0-LINT-QUALITY",
    category: "altin",
    description:
      "ESLint, TypeScript ve Prettier: Error 0, Warning 0 ZORUNLU (ALTIN KURAL)",
    content: `ALTIN KURAL - MANDATORY!
ESLint + TypeScript + Prettier = 0 Errors, 0 Warnings ZORUNLU

ESLINT (0/0):
- Errors: 0 ZORUNLU
- Warnings: 0 ZORUNLU
- Pre-commit hook: ESLint check ZORUNLU
- --no-ignore flag ile çalıştırılmalı
- Tüm dosyalar kontrol edilmeli (app/, components/, lib/, vb.)

TYPESCRIPT (0/0):
- Type errors: 0 ZORUNLU
- Type warnings: 0 ZORUNLU
- tsc --noEmit kontrolü ZORUNLU
- Pre-commit hook: TypeScript check ZORUNLU

PRETTIER (0/0):
- Formatting errors: 0 ZORUNLU
- Code style issues: 0 ZORUNLU
- Pre-commit hook: Prettier check ZORUNLU
- --write flag ile otomatik format ZORUNLU

PRE-COMMIT HOOK:
- ESLint: npx eslint --no-ignore . → 0 errors, 0 warnings
- TypeScript: npx tsc --noEmit → 0 errors
- Prettier: npx prettier --check . → 0 issues

COMMIT POLICY:
- ❌ ESLint warning varsa → COMMIT BLOKE
- ❌ TypeScript error varsa → COMMIT BLOKE
- ❌ Prettier formatting hatası varsa → COMMIT BLOKE
- ✅ Sadece 0/0 durumunda commit yapılabilir

NO EXCEPTIONS:
- "Sadece küçük bir warning" → FIX FIRST!
- "Console.log sadece debug için" → REMOVE FIRST!
- "Type error ama çalışıyor" → FIX FIRST!

VERIFICATION:
- Pre-commit: asanmod_verify_lint
- Manual: npx eslint --no-ignore . | grep -c "warning"
- Expected: 0

KALICI: Bu kural ASLA geri alınmayacak!`,
    priority: 6,
    is_mandatory: true,
    keywords: [
      "eslint",
      "typescript",
      "prettier",
      "lint",
      "quality",
      "error",
      "warning",
      "0",
      "altin",
      "kalici",
      "pre-commit",
      "mandatory",
    ],
  },
  {
    id: "rule-1-mcp-verification",
    name: "Rule 1 MCP Verification",
    category: "zorunlu",
    description: "MCP-first verification (12 MCPs, manuel YASAK)",
    content: `12 MCPs ACTIVE:
1. postgres-official - Database queries
2. git (custom) - Git operations
3. filesystem (ZORUNLU!) - File operations
4. sequential-thinking - Complex problems
5. memory (ZORUNLU!) - Context/memory
6. everything - Utilities
7. asanmod (65 tools) - Verification
8. cursor-ide-browser (optional) - Manual browser automation
9. prisma - Schema management
10. gemini - AI queries
11. security-check - Security scanning
12. context7 - Library docs

Manuel verification YASAK!`,
    priority: 10,
    is_mandatory: true,
    keywords: ["mcp", "verification", "12", "manuel", "yasak"],
  },
  {
    id: "rule-2-rbac",
    name: "Rule 2 Multi-Tenant RBAC",
    category: "zorunlu",
    description: "Multi-tenant + RBAC (5 roles, org isolation)",
    content: `5 Roles:
- SUPER_ADMIN: organizationId filter YOK (tüm veriler)
- ADMIN: organizationId filter VAR (kendi org'u)
- HR_SPECIALIST: organizationId filter VAR (kendi org'u)
- MANAGER: organizationId filter VAR (kendi org'u)
- USER: userId + organizationId filter VAR (sadece kendi verileri)

Organization Isolation ZORUNLU!`,
    priority: 20,
    is_mandatory: true,
    keywords: [
      "rbac",
      "role",
      "admin",
      "organization",
      "isolation",
      "multi-tenant",
    ],
  },
  {
    id: "rule-3-token",
    name: "Rule 3 Token Optimization",
    category: "onemli",
    description: "Token optimization (JSON reports, compact)",
    content: `Token Optimization:
- Compact JSON reports
- Selective context loading
- Compress terminal outputs
- No unnecessary reports
- Short but complete (3-5 lines max to user)`,
    priority: 30,
    is_mandatory: false,
    keywords: ["token", "optimization", "compact", "json", "context"],
  },
  {
    id: "rule-4-bitti",
    name: "Rule 4 Bitti Verification",
    category: "zorunlu",
    description: "Bitti verification (Altın kural öncelikli checklist)",
    content: `"Bitti" Verification Checklist:
1. Priority 1: grep forbidden words check must return 0
2. ÖNCELİK 2: Tüm task'lar tamamlandı mı?
3. ÖNCELİK 3: Browser/Console hataları: errorCount: 0
4. ÖNCELİK 4: PM2 LOGLARINI KONTROL ET → TÜM 4 servis (0 hata)`,
    priority: 40,
    is_mandatory: true,
    keywords: ["bitti", "verification", "checklist", "grep", "console", "pm2"],
  },
  {
    id: "rule-6-isolation",
    name: "Rule 6 DEV-PROD Isolation",
    category: "zorunlu",
    description: "DEV-PROD Environment Isolation (MANDATORY!)",
    content: `Environment Isolation:
DEV:
- Database: ikai_dev_db
- Redis: DB 0
- MinIO: ikai-dev-files
- Ports: 8202/8203

PROD:
- Database: ikai_prod_db
- Redis: DB 1
- MinIO: ikai-prod-files
- Ports: 8204/8205

❌ DEV cannot use PROD resources
❌ PROD cannot use DEV resources`,
    priority: 60,
    is_mandatory: true,
    keywords: ["dev", "prod", "isolation", "environment", "database", "redis"],
  },
  {
    id: "rule-7-prod-protection",
    name: "Rule 7 PROD Protection",
    category: "altin",
    description:
      "Varsayılan DEV, PROD'a sadece açıkça 'PROD'A AL' denildiğinde dokun",
    content: `ALTIN KURAL - PROD PROTECTION!
- VARSayılan: TÜM işlemler DEV environment'ında
- YASAK: PROD database'e yazma, PROD PM2 restart, PROD deployment (varsayılan)
- İZİN VERİLEN: User açıkça "PROD'A AL" dediğinde

🛡️ ASLA PROD'a dokunma - Varsayılan DEV!`,
    priority: 7,
    is_mandatory: true,
    keywords: ["prod", "protection", "dev", "varsayılan", "deployment"],
  },
  {
    id: "rule-8-deployment",
    name: "Rule 8 Deployment Build",
    category: "zorunlu",
    description: "Deployment & Build Rules (PM2 ONLY)",
    content: `Deployment Rules:
- PM2 build script: scripts/pm2-build-prod.sh (MANDATORY!)
- npm run build direkt kullanımı YASAK
- Hot reload: DEV'de aktif (restart NOT NEEDED!)
- Build output: standalone
- distDir: .next-dev (DEV), .next-prod (PROD)`,
    priority: 80,
    is_mandatory: true,
    keywords: ["deployment", "build", "pm2", "hot-reload", "standalone"],
  },
  {
    id: "rule-9-prod-sync",
    name: "Rule 9 PROD Fix DEV Sync",
    category: "zorunlu",
    description: "PROD Fix → DEV Sync (4 Katmanlı Güvenlik Sistemi)",
    content: `PROD-DEV Sync:
- PROD'da fix yapıldığında → DEV'e de otomatik uygula
- Commit format: "fix(module): description [PROD-FIX]"
- 4 Katmanlı Güvenlik: Git Hooks, Scripts, MCP Tools, Backend
- Detay: docs/workflow/PROD-FIX-DEV-SYNC-SYSTEM.md`,
    priority: 90,
    is_mandatory: true,
    keywords: ["prod", "fix", "dev", "sync", "prod-fix"],
  },
  {
    id: "rule-10-tracking",
    name: "Rule 10 Deployment Tracking",
    category: "zorunlu",
    description: "Git Semantic Versioning Tags - Incremental Deployment",
    content: `Deployment Tracking:
- Her PROD deployment'ında semantic version tag (v1.0.0, v1.1.0, vb.)
- git log last-tag..HEAD ile yeni commit'leri bul
- Semantic version calculation: Otomatik patch increment (v1.2.0 → v1.2.1)
- MCP Tool: asanmod_verify_deployment_tracking`,
    priority: 100,
    is_mandatory: true,
    keywords: ["deployment", "tracking", "tag", "semantic", "version"],
  },
  {
    id: "rule-11-tag",
    name: "Rule 11 Tag Format",
    category: "onemli",
    description: "Tag Format Validation (X.X.Y formatı)",
    content: `Tag Format:
- Format: vX.X.Y (örn: v1.2.3)
- Sadece patch (son rakam) artırılabilir: v1.2.2 → v1.2.3 ✅
- Major/Minor artırımı için özel onay gerekir: v1.2.2 → v1.3.0 ❌
- MCP Tool: asanmod_verify_tag_format`,
    priority: 110,
    is_mandatory: false,
    keywords: ["tag", "format", "version", "patch", "semantic"],
  },
  {
    id: "rule-12-session",
    name: "Rule 12 Session Close",
    category: "onemli",
    description: "Session Close Automation",
    content: `Session Close:
- Automatic session closure on "done" or inactivity
- Final report generation
- State file update: .state/current-status.json`,
    priority: 120,
    is_mandatory: false,
    keywords: ["session", "close", "automation", "report"],
  },
  {
    id: "rule-15-brain",
    name: "Rule 15 Brain Learning",
    category: "zorunlu",
    description: "Brain Learning - Persistent Auto-Learning System",
    content: `Brain System:
- Persistent learning from Git commits, error solutions
- SQLite store + Memory MCP sync
- Brain Daemon: PM2 ikai-brain (port 8250)

Brain Tools:
- asanmod_brain_query - Brain knowledge sorgula
- asanmod_brain_find_error_solution - Hata çözümü bul
- asanmod_brain_learn_error - Hata çözümü kaydet
- asanmod_brain_stats - İstatistikler
- asanmod_brain_sync - Memory MCP sync

BRAIN Block Format (commit message):
[BRAIN]
error_fix: <error pattern>
pattern: <PATTERN_IKAI_*>
files: <file1>, <file2>
tags: <searchable tags>
solution: <solution description>
[/BRAIN]`,
    priority: 150,
    is_mandatory: true,
    keywords: ["brain", "learning", "sqlite", "memory", "error", "pattern"],
  },
];

// ========================================
// 12 MCPs
// ========================================

const ASANMOD_MCPS: MCP[] = [
  {
    id: "mcp-postgres-official",
    name: "postgres-official",
    description: "Database queries, Prisma verification",
    is_mandatory: false,
    use_cases: ["SQL queries", "Database inspection", "Schema verification"],
    examples: ["SELECT * FROM users", "Check table structure"],
  },
  {
    id: "mcp-git",
    name: "git",
    description: "Git operations, commit management",
    is_mandatory: false,
    use_cases: ["Commit", "Push", "Pull", "Branch", "Log", "Diff"],
    examples: ["git status", "git log --oneline", "git diff HEAD"],
  },
  {
    id: "mcp-filesystem",
    name: "filesystem",
    description: "File operations, directory management - ZORUNLU!",
    is_mandatory: true,
    tools_count: 15,
    use_cases: [
      "read_text_file",
      "read_multiple_files",
      "write_file",
      "edit_file",
      "list_directory",
      "search_files",
      "get_file_info",
      "move_file",
      "create_directory",
    ],
    forbidden_alternatives: [
      "cat",
      "tail",
      "head",
      "ls",
      "find",
      "stat",
      "fs.readFileSync",
      "fs.writeFileSync",
    ],
    examples: [
      "mcp_filesystem_read_multiple_files(['file1.ts', 'file2.ts'])",
      "mcp_filesystem_edit_file({path, edits: [{oldText, newText}]})",
    ],
  },
  {
    id: "mcp-sequential-thinking",
    name: "sequential-thinking",
    description: "Complex problems, step-by-step reasoning",
    is_mandatory: false,
    use_cases: [
      "Complex problem decomposition",
      "Multi-step planning",
      "Analysis",
    ],
    examples: ["Break down a complex refactoring task"],
  },
  {
    id: "mcp-memory",
    name: "memory",
    description: "Persistent memory, context retention - ZORUNLU!",
    is_mandatory: true,
    use_cases: [
      "create_entities",
      "create_relations",
      "add_observations",
      "search_nodes",
      "read_graph",
    ],
    forbidden_alternatives: [
      "Manual context tracking",
      "Keeping things in head",
    ],
    examples: [
      "mcp_memory_search_nodes('authentication')",
      "mcp_memory_create_entities([...])",
    ],
  },
  {
    id: "mcp-everything",
    name: "everything",
    description: "General utilities, helper functions",
    is_mandatory: false,
    use_cases: ["Echo", "Add numbers", "Test MCP"],
    examples: ["mcp_everything_echo('test')"],
  },
  {
    id: "mcp-asanmod",
    name: "asanmod",
    description: "ASANMOD rule verification and checks - 65 tools",
    is_mandatory: true,
    tools_count: 65,
    use_cases: [
      "Verification tools (38)",
      "Optimization tools (12)",
      "Brain tools (8)",
      "Memory sync tools (4)",
      "PM2 management (5)",
      "Other checks (30)",
    ],
    examples: [
      "asanmod_verify_lint",
      "asanmod_check_production_ready",
      "asanmod_brain_query",
      "asanmod_pm2_restart",
    ],
  },
  {
    id: "mcp-cursor-browser",
    name: "cursor-ide-browser",
    description: "Manual browser automation (debug/smoke)",
    is_mandatory: false,
    use_cases: [
      "browser_navigate",
      "browser_snapshot",
      "browser_click",
      "browser_type",
      "browser_console_messages",
    ],
    examples: ["Navigate to page", "Check console errors", "Take snapshot"],
  },
  {
    id: "mcp-prisma",
    name: "prisma",
    description: "Database schema management, migrations",
    is_mandatory: false,
    use_cases: ["Schema inspection", "Migration check", "Model verification"],
    examples: ["Check Prisma schema", "Verify migrations"],
  },
  {
    id: "mcp-gemini",
    name: "gemini",
    description: "AI queries, error solutions, code analysis",
    is_mandatory: false,
    use_cases: ["Code analysis", "Error explanation", "Solution suggestions"],
    examples: ["Analyze code pattern", "Explain error"],
  },
  {
    id: "mcp-security-check",
    name: "security-check",
    description: "Security scanning, code vulnerability detection",
    is_mandatory: false,
    use_cases: ["Vulnerability scan", "Secret detection", "Security audit"],
    examples: ["Scan for hardcoded secrets", "Check SQL injection"],
  },
  {
    id: "mcp-context7",
    name: "context7",
    description:
      "Code documentation library (Next.js, React, Prisma, Express güncel docs)",
    is_mandatory: false,
    use_cases: ["Library documentation", "API reference", "Best practices"],
    examples: ["Get Next.js App Router docs", "Prisma query examples"],
  },
];

// ========================================
// ASANMOD PATTERNS
// ========================================

const ASANMOD_PATTERNS: CodePattern[] = [
  {
    pattern_name: "PATTERN_ASANMOD_MCP_FIRST",
    pattern_type: "mcp-usage",
    category: "asanmod",
    description:
      "MCP-first yaklaşım - Tüm işlemler için MCP kullan, terminal ve Node.js fs YASAK",
    example_code: `// ✅ DOĞRU: Filesystem MCP kullan
import { mcp_filesystem_read_multiple_files } from '@modelcontextprotocol/sdk';

const files = await mcp_filesystem_read_multiple_files({
  paths: ['file1.ts', 'file2.ts']
});

// ✅ DOĞRU: Memory MCP kullan
import { mcp_memory_search_nodes } from '@modelcontextprotocol/sdk';

const results = await mcp_memory_search_nodes({ query: 'authentication' });`,
    anti_pattern: `// ❌ YANLIŞ: Terminal komutları
const result = execSync('cat file.ts');

// ❌ YANLIŞ: Node.js fs direkt kullanımı
import fs from 'fs';
const content = fs.readFileSync('file.ts', 'utf-8');`,
    anti_pattern_reason:
      "Terminal komutları ve Node.js fs kullanımı MCP-first yaklaşımına aykırı. MCP tools zorunlu kullanılmalı.",
    related_files: [
      "mcp-servers/asanmod-mcp/**/*.ts",
      "prompts/**/*.md",
      ".cursorrules",
    ],
    tags: ["mcp", "filesystem", "memory", "terminal", "yasak", "mcp-first"],
  },
  {
    pattern_name: "PATTERN_ASANMOD_VERIFICATION",
    pattern_type: "verification",
    category: "asanmod",
    description:
      "verify_done hard-lock pattern - Tüm check'ler pass olmalı, aşılması imkansız",
    example_code: `// ✅ DOĞRU: Hard-lock verification
return {
  success: allPassed, // Hard-lock: Tüm check'ler pass olmalı
  timestamp,
  checks,
  summary: {
    totalChecks,
    passedChecks,
    failedChecks,
    allPassed,
  },
};

// Agent "bitti" diyemez eğer allPassed === false`,
    anti_pattern: `// ❌ YANLIŞ: Her zaman success: true
return {
  success: true, // YANLIŞ! allPassed'e bağlı olmalı
  ...
};`,
    anti_pattern_reason:
      "success: true her zaman döndürmek verification'ı aşılabilir hale getirir. Agent eksik işleri 'bitti' diyebilir.",
    related_files: ["mcp-servers/asanmod-mcp/src/tools/verifyDone.ts"],
    tags: ["verification", "hard-lock", "verify-done", "all-passed", "quality"],
  },
  {
    pattern_name: "PATTERN_ASANMOD_COMMIT_FORMAT",
    pattern_type: "git-workflow",
    category: "asanmod",
    description:
      "1 file = 1 commit policy, format: type(module): description [MOD]",
    example_code: `// ✅ DOĞRU: 1 file = 1 commit
git add backend/src/services/userService.js
git commit -m "feat(backend): Add user service [MOD]"

git add frontend/app/users/page.tsx
git commit -m "feat(frontend): Add users page [MOD]"

// ✅ DOĞRU: Format validation
// type(module): description [MOD]
// Types: feat, fix, docs, refactor, test, chore, style, perf, build, ci
// Module: backend, frontend, asanmod, brain, etc.
// Identity: MOD, W1-W6, PROD-FIX`,
    anti_pattern: `// ❌ YANLIŞ: Batch commit
git add .
git commit -m "feat: Add feature [MOD]"

// ❌ YANLIŞ: Format hatası
git commit -m "added feature"
git commit -m "feat: Add feature" // [MOD] eksik`,
    anti_pattern_reason:
      "Batch commit ve format hatası git history'yi karmaşıklaştırır, debugging zorlaşır, module detection çalışmaz.",
    related_files: [
      ".git/hooks/commit-msg",
      ".git/hooks/pre-commit",
      "docs/workflow/*.md",
    ],
    tags: ["git", "commit", "format", "1-file-1-commit", "module", "workflow"],
  },
  {
    pattern_name: "PATTERN_ASANMOD_BIG_5_TOOLS",
    pattern_type: "tool-usage",
    category: "asanmod",
    description:
      "Big 5 tools kullanımı - Paralel execution zorunlu, Promise.all kullan",
    example_code: `// ✅ DOĞRU: Big 5 tools paralel execution
const [qualityResult, securityResult, infraResult, todosResult, brainResult] = await Promise.all([
  asanmod_quality_gate({ type: "all", fix: true }),
  asanmod_security_audit({ check: "all" }),
  asanmod_infrastructure_check({ target: "all" }),
  asanmod_get_todos({ path: "." }),
  asanmod_brain_query({ query: "error", type: "solutions" }),
]);

// 3-5x daha hızlı!`,
    anti_pattern: `// ❌ YANLIŞ: Sequential execution
const qualityResult = await asanmod_quality_gate({ type: "all" });
const securityResult = await asanmod_security_audit({ check: "all" });
const infraResult = await asanmod_infrastructure_check({ target: "all" });
// Çok yavaş!`,
    anti_pattern_reason:
      "Sequential execution çok yavaş. Big 5 tools bağımsız çalışır, Promise.all ile paralel çalıştırılmalı (3-5x hızlanma).",
    related_files: [
      "mcp-servers/asanmod-mcp/src/tools/*.ts",
      "prompts/PROMPT-MOD-START-v3.1-ULTRA.md",
    ],
    tags: [
      "big-5",
      "tools",
      "parallel",
      "promise.all",
      "performance",
      "quality-gate",
    ],
  },
  {
    pattern_name: "PATTERN_ASANMOD_BRAIN_QUERY",
    pattern_type: "brain-usage",
    category: "asanmod",
    description:
      "Brain query kullanımı - Hata çözümü, pattern, relation sorgulama",
    example_code: `// ✅ DOĞRU: Brain query kullan
const solution = await asanmod_brain_query({
  query: "TypeScript error TS2307",
  type: "solutions"
});

if (solution.results.solutions.length > 0) {
  // Daha önce çözülmüş hata var, çözümü kullan
  console.log(solution.results.solutions[0].solution_description);
}

// ✅ DOĞRU: Pattern sorgulama
const patterns = await asanmod_brain_query({
  query: "React hooks",
  type: "patterns"
});

// ✅ DOĞRU: Relation sorgulama
const relations = await asanmod_brain_query({
  query: "IKAI_FRONTEND",
  type: "relations"
});`,
    anti_pattern: `// ❌ YANLIŞ: Manuel hata çözümü arama
// Google'da arama, dokümantasyon okuma, trial-error
// Brain'de zaten çözüm var ama kullanılmıyor

// ❌ YANLIŞ: Pattern bilgisi olmadan kod yazma
// Brain'de pattern var ama kontrol edilmiyor`,
    anti_pattern_reason:
      "Brain'de zaten öğrenilmiş hata çözümleri ve pattern'ler var. Manuel arama gereksiz zaman kaybı. Brain query kullanılmalı.",
    related_files: [
      "mcp-servers/ikai-brain/src/api/server.ts",
      "mcp-servers/asanmod-mcp/src/tools/brainQuery.ts",
    ],
    tags: [
      "brain",
      "query",
      "error-solution",
      "pattern",
      "relation",
      "learning",
    ],
  },
];

// ========================================
// IKAI PATTERNS
// ========================================

const IKAI_PATTERNS: CodePattern[] = [
  {
    pattern_name: "PATTERN_IKAI_REACT_HOOKS",
    pattern_type: "react-hooks",
    category: "frontend",
    description:
      "React Hook optimizasyonu - useCallback dependency array yönetimi",
    example_code: `// ✅ DOĞRU: Stable referans kullan
const fetchData = useCallback(async () => {
  // ... fetch logic
}, []); // Dependencies empty or stable

// ✅ DOĞRU: Toast gibi unstable ref'leri dışarıda tut
const toastRef = useRef(toast);
useEffect(() => { toastRef.current = toast; });`,
    anti_pattern: `// ❌ YANLIŞ: Unstable referans dependency'de
const fetchData = useCallback(async () => {
  toast.success('Done');
}, [toast]); // toast her render'da değişir → infinite loop`,
    anti_pattern_reason:
      "toast, router gibi hook'lar her render'da yeni referans üretir, dependency array'e konursa infinite loop oluşur",
    related_files: ["frontend/components/**/*.tsx", "frontend/app/**/*.tsx"],
    tags: [
      "react",
      "hooks",
      "useCallback",
      "useEffect",
      "infinite-loop",
      "toast",
    ],
  },
  {
    pattern_name: "PATTERN_IKAI_PRISMA",
    pattern_type: "prisma",
    category: "backend",
    description: "Prisma query optimizasyonu ve doğru syntax kullanımı",
    example_code: `// ✅ DOĞRU: Prisma 5 syntax
where: {
  AND: [
    { organizationId: orgId },
    { NOT: { email: null } },
  ]
}

// ✅ DOĞRU: Select ile sadece gerekli alanları al
select: {
  id: true,
  name: true,
  email: true
}`,
    anti_pattern: `// ❌ YANLIŞ: Eski Prisma syntax
where: {
  email: { not: null } // Prisma 5'te çalışmaz
}`,
    anti_pattern_reason:
      "Prisma 5'te 'not: null' yerine 'NOT: { field: null }' kullanılmalı",
    related_files: [
      "backend/src/controllers/**/*.js",
      "backend/src/services/**/*.js",
    ],
    tags: ["prisma", "query", "where", "not-null", "select"],
  },
  {
    pattern_name: "PATTERN_IKAI_RBAC",
    pattern_type: "rbac",
    category: "security",
    description: "Role-Based Access Control - organizationId filtering",
    example_code: `// ✅ DOĞRU: Role-based filtering
if (userRole === 'SUPER_ADMIN') {
  // No organizationId filter
} else {
  where.organizationId = user.organizationId;
}`,
    anti_pattern: `// ❌ YANLIŞ: Sabit organizationId
where: { organizationId: 1 }`,
    anti_pattern_reason: "Multi-tenant sistemde organizationId dinamik olmalı",
    related_files: [
      "backend/src/middleware/**/*.js",
      "backend/src/controllers/**/*.js",
    ],
    tags: ["rbac", "security", "organization", "multi-tenant", "role"],
  },
  {
    pattern_name: "PATTERN_IKAI_API_CLIENT",
    pattern_type: "api",
    category: "frontend",
    description: "Frontend API client kullanımı",
    example_code: `// ✅ DOĞRU: apiClient kullan
import { apiClient } from '@/lib/api-client';

const response = await apiClient.get('/users');
const data = await apiClient.post('/users', { name: 'John' });`,
    anti_pattern: `// ❌ YANLIŞ: Direkt fetch kullanımı
const response = await fetch('/api/users');`,
    anti_pattern_reason:
      "apiClient otomatik auth header, error handling ve base URL yönetimi sağlar",
    related_files: ["frontend/lib/api-client.ts", "frontend/services/**/*.ts"],
    tags: ["api", "fetch", "apiClient", "auth", "header"],
  },
  {
    pattern_name: "PATTERN_IKAI_FILE_UPLOAD",
    pattern_type: "file-upload",
    category: "backend",
    description: "MinIO file upload pattern",
    example_code: `// ✅ DOĞRU: MinIO bucket kullan
const bucket = process.env.IKAI_ENV === 'prod'
  ? 'ikai-prod-files'
  : 'ikai-dev-files';

await minioClient.putObject(bucket, filename, buffer);`,
    anti_pattern: `// ❌ YANLIŞ: Hardcoded bucket
await minioClient.putObject('files', filename, buffer);`,
    anti_pattern_reason: "DEV/PROD bucket ayrımı yapılmalı",
    related_files: [
      "backend/src/services/upload*.js",
      "backend/src/controllers/file*.js",
    ],
    tags: ["minio", "upload", "file", "bucket", "storage"],
  },
  {
    pattern_name: "PATTERN_IKAI_MULTI_TENANT",
    pattern_type: "multi-tenant",
    category: "database",
    description: "Multi-tenant veri izolasyonu",
    example_code: `// ✅ DOĞRU: Middleware ile organizationId ekleme
app.use((req, res, next) => {
  if (req.user && req.user.role !== 'SUPER_ADMIN') {
    req.organizationId = req.user.organizationId;
  }
  next();
});`,
    anti_pattern: `// ❌ YANLIŞ: OrganizationId kontrolsüz sorgu
const users = await prisma.user.findMany();`,
    anti_pattern_reason:
      "Tüm sorgularda organizationId filtresi olmalı (SUPER_ADMIN hariç)",
    related_files: ["backend/src/middleware/**/*.js"],
    tags: ["multi-tenant", "organization", "isolation", "middleware"],
  },
  {
    pattern_name: "PATTERN_IKAI_DEV_PROD_BUILD",
    pattern_type: "deployment",
    category: "deployment",
    description: "DEV/PROD build izolasyonu",
    example_code: `// ✅ DOĞRU: Environment-specific config
// next.config.js
const distDir = process.env.IKAI_ENV === 'prod' ? '.next-prod' : '.next-dev';
const port = process.env.IKAI_ENV === 'prod' ? 8205 : 8203;`,
    anti_pattern: `// ❌ YANLIŞ: Tek build directory
const distDir = '.next';`,
    anti_pattern_reason: "DEV ve PROD build'leri birbirini ezmemeli",
    related_files: ["frontend/next.config.js", "ecosystem.config.js"],
    tags: ["build", "deployment", "dev", "prod", "next.js"],
  },
  {
    pattern_name: "PATTERN_IKAI_CANDIDATES",
    pattern_type: "business-module",
    category: "backend",
    description:
      "Aday yönetimi pattern - CV upload, Gemini AI extraction, MinIO storage, pipeline",
    example_code: `// ✅ DOĞRU: CV upload with async processing (GARDEN pattern)
// 1. Create candidate immediately (fast response)
const candidate = await prisma.candidate.create({
  data: { userId, organizationId, sourceFileName, ... }
});

// 2. Process in background (async, non-blocking)
setImmediate(async () => {
  await minioService.uploadFile(userId, fileName, buffer, mimetype);
  const extractedData = await extractCVDataWithAI(buffer, fileName, mimetype);
  await prisma.candidate.update({ where: { id: candidate.id }, data: extractedData });
});

// ✅ DOĞRU: Role-based filtering
if (userRole === "SUPER_ADMIN") {
  where = { isDeleted: false }; // All organizations
} else {
  where = { organizationId, isDeleted: false }; // Own organization
}`,
    anti_pattern: `// ❌ YANLIŞ: Blocking CV processing
const candidate = await prisma.candidate.create({...});
await minioService.uploadFile(...); // Blocks response
const extractedData = await extractCVDataWithAI(...); // Blocks response
// User waits 10+ seconds for response

// ❌ YANLIŞ: No organizationId filter
const candidates = await prisma.candidate.findMany(); // Multi-tenant violation`,
    anti_pattern_reason:
      "Blocking CV processing yavaş response verir. OrganizationId filtresi olmadan multi-tenant ihlali olur.",
    related_files: [
      "backend/src/controllers/candidateController.js",
      "frontend/app/(authenticated)/candidates/**",
    ],
    tags: [
      "candidates",
      "cv-upload",
      "gemini",
      "minio",
      "async",
      "multi-tenant",
    ],
  },
  {
    pattern_name: "PATTERN_IKAI_EMPLOYEE",
    pattern_type: "business-module",
    category: "backend",
    description:
      "Çalışan yönetimi pattern - CRUD, multi-tenant filtering, RBAC, documents, profile",
    example_code: `// ✅ DOĞRU: Multi-tenant employee query
const where = { id: employeeId };
if (userRole !== "SUPER_ADMIN") {
  where.organizationId = req.organizationId; // Multi-tenant filter
}

// ✅ DOĞRU: RBAC - USER can only see own profile
if (userRole === "USER" && employee.userId !== req.user?.id) {
  return res.status(403).json({ message: "Erişim yetkiniz yok" });
}

// ✅ DOĞRU: Employee creation with user in transaction
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { email, password, organizationId } });
  await tx.employee.create({ data: { userId: user.id, organizationId, ... } });
});`,
    anti_pattern: `// ❌ YANLIŞ: No organizationId filter
const employee = await prisma.employee.findUnique({ where: { id } });

// ❌ YANLIŞ: No RBAC check
// USER can see any employee

// ❌ YANLIŞ: User and Employee created separately (no transaction)
const user = await prisma.user.create({...});
const employee = await prisma.employee.create({...}); // If user creation fails, orphan employee`,
    anti_pattern_reason:
      "OrganizationId filtresi olmadan multi-tenant ihlali. RBAC kontrolü olmadan güvenlik açığı. Transaction olmadan data inconsistency riski.",
    related_files: [
      "backend/src/controllers/employeeController.js",
      "frontend/app/(authenticated)/employees/**",
    ],
    tags: [
      "employee",
      "crud",
      "rbac",
      "multi-tenant",
      "transaction",
      "documents",
    ],
  },
  {
    pattern_name: "PATTERN_IKAI_OFFERS",
    pattern_type: "business-module",
    category: "backend",
    description:
      "Teklif yönetimi pattern - Offer creation, wizard flow, approval workflow, PDF generation, email",
    example_code: `// ✅ DOĞRU: Offer creation with wizard support
const offer = await offerService.createOfferFromWizard(
  req.body,
  userId,
  organizationId
);

// ✅ DOĞRU: PDF generation and email sending
if (sendMode === "direct") {
  const pdfBuffer = await offerPdfService.generateOfferPdf(offer);
  await emailService.sendOfferEmail(candidateEmail, pdfBuffer);
}

// ✅ DOĞRU: Approval workflow
if (offer.status === "DRAFT") {
  await approvalWorkflowService.createWorkflow(offer.id, organizationId);
}`,
    anti_pattern: `// ❌ YANLIŞ: No error handling for email
await emailService.sendOfferEmail(email, pdf); // If fails, offer is created but not sent

// ❌ YANLIŞ: No workflow for draft offers
// Draft offers stay in limbo forever`,
    anti_pattern_reason:
      "Email hatası handle edilmezse offer oluşur ama gönderilmez. Workflow olmadan draft offers onaylanamaz.",
    related_files: [
      "backend/src/controllers/offerController.js",
      "frontend/app/(authenticated)/offers/**",
    ],
    tags: ["offers", "wizard", "approval", "pdf", "email", "workflow"],
  },
  {
    pattern_name: "PATTERN_IKAI_LEAVES",
    pattern_type: "business-module",
    category: "backend",
    description:
      "İzin yönetimi pattern - Leave request, balance calculation, approval workflow, policy validation",
    example_code: `// ✅ DOĞRU: Leave request with validation
const validation = await leavePolicyService.validateLeaveRequest(
  organizationId,
  employeeId,
  leaveData
);

if (!validation.isValid) {
  return res.status(400).json({ message: validation.error });
}

// ✅ DOĞRU: Approval workflow creation
if (validation.requiresWorkflow) {
  const approvalLevels = await leavePolicyService.getRequiredApprovalLevels(
    organizationId,
    leaveData
  );
  const workflow = await leaveApprovalWorkflowService.createWorkflow(
    leave.id,
    organizationId,
    approvalLevels,
    employee
  );
}

// ✅ DOĞRU: Balance update after approval
if (leave.status === "APPROVED") {
  await leaveBalanceService.updateBalance(employeeId, leaveData.days);
}`,
    anti_pattern: `// ❌ YANLIŞ: No policy validation
const leave = await prisma.leave.create({ data: leaveData });
// Employee can request unlimited leave

// ❌ YANLIŞ: No workflow
// Leave requests have no approval process

// ❌ YANLIŞ: Balance not updated
// Leave approved but balance stays same`,
    anti_pattern_reason:
      "Policy validation olmadan sınırsız izin talebi. Workflow olmadan onay süreci yok. Balance update olmadan izin bakiyesi yanlış.",
    related_files: [
      "backend/src/controllers/leaveController.js",
      "frontend/app/(authenticated)/leaves/**",
    ],
    tags: [
      "leaves",
      "leave-request",
      "balance",
      "approval",
      "workflow",
      "policy",
    ],
  },
  {
    pattern_name: "PATTERN_IKAI_PERFORMANCE",
    pattern_type: "business-module",
    category: "backend",
    description:
      "Performans değerlendirme pattern - Goals, reviews, 360 feedback, goal tracking",
    example_code: `// ✅ DOĞRU: Performance review creation
const review = await prisma.performanceReview.create({
  data: {
    employeeId,
    organizationId,
    reviewPeriod: { start, end },
    goals: goalData,
    reviewerId: managerId,
  },
});

// ✅ DOĞRU: 360 feedback collection
const feedbacks = await Promise.all([
  collectManagerFeedback(employeeId, managerId),
  collectPeerFeedback(employeeId, peerIds),
  collectSelfFeedback(employeeId),
]);

// ✅ DOĞRU: Goal tracking
const goals = await prisma.goal.findMany({
  where: { employeeId, organizationId, status: "ACTIVE" },
});`,
    anti_pattern: `// ❌ YANLIŞ: No organizationId filter
const reviews = await prisma.performanceReview.findMany({ where: { employeeId } });

// ❌ YANLIŞ: No goal tracking
// Goals set but never tracked`,
    anti_pattern_reason:
      "OrganizationId filtresi olmadan multi-tenant ihlali. Goal tracking olmadan performans ölçülemez.",
    related_files: [
      "backend/src/controllers/performanceReviewController.js",
      "frontend/app/(authenticated)/performance/**",
    ],
    tags: ["performance", "reviews", "goals", "360-feedback", "tracking"],
  },
  {
    pattern_name: "PATTERN_IKAI_WORKSPACE",
    pattern_type: "business-module",
    category: "backend",
    description:
      "Workspace/chat pattern - Channels, messages, notifications, real-time messaging",
    example_code: `// ✅ DOĞRU: Channel creation with organization isolation
const channel = await prisma.channel.create({
  data: {
    name,
    organizationId, // Multi-tenant isolation
    type: "PUBLIC" | "PRIVATE",
    createdBy: userId,
  },
});

// ✅ DOĞRU: Message sending with notification
const message = await prisma.message.create({
  data: { channelId, userId, content, organizationId },
});

// Send real-time notification
await notificationService.createNotification(
  channelMembers,
  organizationId,
  "NEW_MESSAGE",
  "Yeni mesaj",
  message.content
);`,
    anti_pattern: `// ❌ YANLIŞ: No organizationId filter
const channels = await prisma.channel.findMany(); // All organizations visible

// ❌ YANLIŞ: No real-time updates
// Messages sent but users don't see them until refresh`,
    anti_pattern_reason:
      "OrganizationId filtresi olmadan multi-tenant ihlali. Real-time updates olmadan kullanıcı deneyimi kötü.",
    related_files: [
      "backend/src/controllers/workspace/**",
      "frontend/app/(authenticated)/chat/**",
    ],
    tags: [
      "workspace",
      "chat",
      "channels",
      "messages",
      "real-time",
      "notifications",
    ],
  },
  {
    pattern_name: "PATTERN_IKAI_NOTIFICATIONS",
    pattern_type: "business-module",
    category: "backend",
    description:
      "Bildirim sistemi pattern - Multi-channel delivery, push, email, in-app notifications",
    example_code: `// ✅ DOĞRU: Multi-channel notification
await notificationService.createNotification(
  userId,
  organizationId,
  "LEAVE_APPROVAL_REQUIRED",
  "Yeni İzin Onayı Bekliyor",
  message,
  { leaveId, employeeId }
);

// ✅ DOĞRU: Notification delivery (push, email, in-app)
await Promise.all([
  pushService.sendPush(userId, notification),
  emailService.sendEmail(user.email, notification),
  // In-app notification already saved in DB
]);

// ✅ DOĞRU: Notification filtering by organization
const notifications = await prisma.notification.findMany({
  where: { userId, organizationId, isRead: false },
});`,
    anti_pattern: `// ❌ YANLIŞ: Single channel only
await emailService.sendEmail(email, message); // No push, no in-app

// ❌ YANLIŞ: No organizationId filter
const notifications = await prisma.notification.findMany({ where: { userId } });`,
    anti_pattern_reason:
      "Single channel kullanıcıyı kaçırabilir. OrganizationId filtresi olmadan multi-tenant ihlali.",
    related_files: [
      "backend/src/services/notificationService.js",
      "backend/src/controllers/notificationController.js",
      "frontend/app/(authenticated)/notifications/**",
    ],
    tags: [
      "notifications",
      "push",
      "email",
      "in-app",
      "multi-channel",
      "real-time",
    ],
  },
];

// ========================================
// MAIN IMPORT FUNCTION
// ========================================

async function importAllData(): Promise<void> {
  console.log("🧠 IKAI Brain - ASANMOD Data Import");
  console.log("=====================================\n");

  // Initialize database
  const dbPath =
    process.env.SQLITE_PATH ||
    "/home/root/projects/ikaicursor/mcp-servers/ikai-brain/data/ikai-brain.db";
  initDatabase(dbPath);

  // Import Rules
  console.log("📜 Importing 18 ASANMOD Rules...");
  let rulesImported = 0;
  for (const rule of ASANMOD_RULES) {
    try {
      addRule(rule);
      rulesImported++;
      console.log(`  ✅ ${rule.id}`);
    } catch (error) {
      console.error(`  ❌ ${rule.id}: ${error}`);
    }
  }
  console.log(
    `\n  Total: ${rulesImported}/${ASANMOD_RULES.length} rules imported\n`
  );

  // Import MCPs
  console.log("🔧 Importing 12 MCPs...");
  let mcpsImported = 0;
  for (const mcp of ASANMOD_MCPS) {
    try {
      addMcp(mcp);
      mcpsImported++;
      console.log(`  ✅ ${mcp.name}${mcp.is_mandatory ? " (ZORUNLU)" : ""}`);
    } catch (error) {
      console.error(`  ❌ ${mcp.name}: ${error}`);
    }
  }
  console.log(
    `\n  Total: ${mcpsImported}/${ASANMOD_MCPS.length} MCPs imported\n`
  );

  // Import ASANMOD Patterns
  console.log("🎯 Importing ASANMOD Patterns...");
  let asanmodPatternsImported = 0;
  for (const pattern of ASANMOD_PATTERNS) {
    try {
      addCodePattern(pattern);
      asanmodPatternsImported++;
      console.log(`  ✅ ${pattern.pattern_name}`);
    } catch (error) {
      console.error(`  ❌ ${pattern.pattern_name}: ${error}`);
    }
  }
  console.log(
    `\n  Total: ${asanmodPatternsImported}/${ASANMOD_PATTERNS.length} ASANMOD patterns imported\n`
  );

  // Import IKAI Patterns
  console.log("🎯 Importing IKAI Patterns...");
  let ikaiPatternsImported = 0;
  for (const pattern of IKAI_PATTERNS) {
    try {
      addCodePattern(pattern);
      ikaiPatternsImported++;
      console.log(`  ✅ ${pattern.pattern_name}`);
    } catch (error) {
      console.error(`  ❌ ${pattern.pattern_name}: ${error}`);
    }
  }
  console.log(
    `\n  Total: ${ikaiPatternsImported}/${IKAI_PATTERNS.length} IKAI patterns imported\n`
  );

  const totalPatternsImported = asanmodPatternsImported + ikaiPatternsImported;
  const totalPatterns = ASANMOD_PATTERNS.length + IKAI_PATTERNS.length;

  // Summary
  console.log("=====================================");
  console.log("📊 Import Summary:");
  console.log(`  Rules:    ${rulesImported}/${ASANMOD_RULES.length}`);
  console.log(`  MCPs:     ${mcpsImported}/${ASANMOD_MCPS.length}`);
  console.log(
    `  ASANMOD Patterns: ${asanmodPatternsImported}/${ASANMOD_PATTERNS.length}`
  );
  console.log(
    `  IKAI Patterns:     ${ikaiPatternsImported}/${IKAI_PATTERNS.length}`
  );
  console.log(`  Total Patterns:  ${totalPatternsImported}/${totalPatterns}`);
  console.log("=====================================\n");

  if (
    rulesImported === ASANMOD_RULES.length &&
    mcpsImported === ASANMOD_MCPS.length &&
    asanmodPatternsImported === ASANMOD_PATTERNS.length &&
    ikaiPatternsImported === IKAI_PATTERNS.length
  ) {
    console.log("✅ All data imported successfully!");
  } else {
    console.log("⚠️  Some items failed to import. Check errors above.");
  }
}

// Run import
importAllData().catch(console.error);
