---
type: documentation
agent_role: all
context_depth: 2
required_knowledge: ["asanmod_core"]
last_audited: "2026-01-18"
---

# Changelog

All notable changes to this project will be documented in this file.

## [2.2.0] - 2026-01-18

### Agent-Recommended Improvements (Week 1)

Based on real AI agent E2E test feedback, implemented 6 critical improvements:

#### 🔴 Setup Automation
- **Wizard Auto-Run**: `npm install` now auto-runs wizard on first run
## [3.1.0] - 2026-01-18

### 🤖 AI-Responsive PM2 Wrapper (v10.0)

Major template upgrade with AI-native features:

#### PM2 Commands (AI-Responsive)
- `./scripts/mod-tools/pm dev errors` - Error scan with UTC+3 timestamps
- `./scripts/mod-tools/pm prod diag` - Full diagnostic report for AI agents
- `./scripts/mod-tools/pm dev health` - Quick service health check
- `./scripts/mod-tools/pm dev memory` - Memory usage summary

#### Template Universalization
- Removed ALL project-specific (IKAI) references
- Universal service naming: `app-dev`, `app-prod`
- Environment variable based configuration
- Config-driven port and database settings

#### Documentation Sync
- All agent protocols updated to v3.1.0
- AI-responsive commands documented everywhere
- Removed duplicate/legacy files

#### Files Changed
- `scripts/mod-tools/pm` - Universal v10.0 wrapper
- `scripts/mod-tools/env-helper.cjs` - Config-based, no hardcoded values
- `scripts/mod-tools/fast-verify.sh` - Universal checks
- `scripts/mod-tools/validate-command.cjs` - Universal patterns
- All agent protocols (GEMINI.md, CLAUDE.md, CURSOR.md)
- docs/AGENT_QUICK_REF.md - v10.0 with AI commands

---

  - Creates `.asanmod/wizard-completed` flag
  - Skips in CI environments (CI=true or SKIP_WIZARD=1)
- **DB Bootstrap**: New `npm run db:bootstrap` for interactive PostgreSQL setup
  - Checks PostgreSQL installation
  - Interactive prompts for DB name, user, password
  - Auto-updates `.env` with DATABASE_URL
  - Runs migrations automatically

#### 🟡 Developer Experience
- **Env Validation**: New `src/lib/env.ts` validates environment variables at startup
  - Zod schema for type-safe access
  - JWT_SECRET min 32 characters enforced
  - Helpful error messages with hints
- **Hot Reload Fix**: `next.config.js` webpack watchOptions
  - poll: 1000ms, aggregateTimeout: 300ms
  - @trpc/server external package
- **Dev Shortcuts**: Test data seeding
  - `npm run db:seed:dev` - Creates test users and sample todos
  - `npm run db:reset` - Push + seed combo
  - Test accounts: test@example.com / admin@example.com
- **File Organization**: New `docs/FOLDER_STRUCTURE.md` guide
  - Domain-based router organization
  - Lib utilities structure
  - When to reorganize guidelines

#### 📦 New Commands
```bash
npm run db:bootstrap   # Interactive DB setup
npm run db:seed:dev    # Seed test data
npm run db:reset       # Push + seed combo
```

#### 🧪 Test Accounts (after db:seed:dev)
| Role  | Email               | Password     |
|-------|---------------------|--------------|
| User  | test@example.com    | password123  |
| Admin | admin@example.com   | admin123     |

---

## [2.1.0-alpha] - 2026-01-18

### AI-Native Infrastructure

- **YAML Frontmatter**: 100% coverage on all 29 documentation files
- **Runtime Manifest**: `.asanmod/manifest.json` for agent state tracking
- **Context-Aware Wizard**: Placeholder replacement with specific values
- **MCP Rebranding**: All MCPs rebranded to @asanmod namespace
- **Ultimate E2E Test**: Full documentation of agent validation test

---

## [2.0.2] - 2026-01-18

### Added
- **Self-Healing Setup**: Added `npm run doctor` for deep environment diagnosis
- **In-Memory Postgres**: Integrated `pg-mem` for zero-config integration tests
- **Agent Knowledge Mesh**: Added `docs/ARCH.md` and `docs/AUDIT_TEMPLATE.md`
- **DB Auto-Auth**: Wizard now offers to create PG roles

### Fixed
- **Decisive ESM Fix**: Downgraded `superjson` to v1.13.3 for Jest compatibility
- **Test Isolation**: Restricted Jest to core folders to avoid MCP collisions

---

## [2.0.1] - 2026-01-18

### Enterprise Certification (Green Run)
- **Verified:** Passed all 6 quality gates (Lint, TSC, Test, Audit, Build, Env)
- **Fixed:** Downgraded ESLint to v8.57.0 to resolve v9 conflict
- **Fixed:** Resolved TypeScript module resolution errors in `server/index.ts`
- **Fixed:** Corrected `jest.config.js` and `setup.ts` for strictly typed environment
- **Certified:** Infrastructure is now fully deterministic and agent-ready

---

## [2.0.0] - 2026-01-13

### Initial Release
- Complete Next.js 15 + tRPC + PostgreSQL template
- ASANMOD v1.1.1 Governance Protocol included
- JWT Authentication system
- Drizzle ORM with PostgreSQL
- Husky pre-commit hooks
- 0-0-0 Quality Policy enforcement

---

_This file is maintained by ASANMOD governance._
