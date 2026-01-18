---
type: documentation
agent_role: all
context_depth: 2
required_knowledge: ["asanmod_core"]
last_audited: "2026-01-18"
---

# Changelog

All notable changes to this project will be documented in this file.

## [3.2.0] - 2026-01-18 (The Great Refactor)

### 🧹 Deep Audit & Cleanup
- **Universal MCP**: Renamed all `ikai-` tools to generic `asanmod_` tools. Removed legacy project names from MCP source code.
- **Protocol Unification**: Created a Single Source of Truth for Agent Protocols. GEMINI, CLAUDE, and CURSOR protocols are now 100% harmonized.
- **Redundancy Removal**: Deleted 5+ redundant documentation files and legacy backup folders.
- **Hardness Increase**: Synchronized all versions (v3.2.0) across `package.json`, `asanmod.config.json`, and `asanmod-core.json`.
- **Infrastructure Fix**: Standardized `app-dev` (3000) and `app-prod` (3002) ports project-wide.

## [3.1.0] - 2026-01-18

### 🤖 AI-Responsive PM2 Wrapper (v10.0)
- Major template upgrade with AI-native features:
- `pm dev errors`: Error scan with UTC+3 timestamps.
- `pm prod diag`: Full diagnostic report for AI agents.
- `pm dev health`: Quick service health check.
- `pm dev memory`: Memory usage summary.

### 🌐 Template Universalization
- Removed ALL hardcoded project references (IKAI, etc.).
- Universal service naming: `app-dev`, `app-prod`.

## [3.0.0] - 2026-01-14

### 🏗️ Single-Level Template Consolidation
- Moved all files from `asan-enterprise-template/` to root.
- Established Next.js 15 as the core framework.
- Integrated tRPC + Drizzle ORM + PostgreSQL.
- Implemented the "Iron Curtain" dev/prod isolation protocol.

