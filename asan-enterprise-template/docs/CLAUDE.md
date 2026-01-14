---
type: documentation
agent_role: claude_agent
context_depth: 4
required_knowledge: ["asanmod_core"]
last_audited: "2026-01-14"
---

<!--
ASANMOD v1.1.1 - DOCUMENTATION HEADER
ID: CONST-006
STATUS: ACTIVE
TYPE: PROTOCOL
LAST_UPDATED: 2026-01-13 (UTC)
VERSION: v1.1.1
-->

# ASANMOD v1.1.1: CLAUDE AGENT PROTOCOL

> **EXECUTABLE RULES. ZERO DOCUMENTATION BURDEN.**

### 🚨 HARD CONSTRAINTS (PHYSICALLY ENFORCED)

| Constraint                               | Enforcement                 |
| ---------------------------------------- | --------------------------- |
| Commit format: `ID: <TASK> \| <Message>` | `.husky/commit-msg` REJECTS |
| No `console.log` in backend              | `.husky/pre-commit` REJECTS |
| State TTL (30dk)                         | `verify-core.cjs` BLOCKS    |
| >50 satır option yok                     | `interaction-guard` REJECTS |
| **READ asanmod-core.json FIRST**         | **AGENT CONTRACT**          |

### 🛡️ IRON CURTAIN ISOLATION

| Environment | Access      | Port     | Rule               |
| ----------- | ----------- | -------- | ------------------ |
| **DEV**     | IP Only     | **3000** | Hot Reload ✅      |
| **PROD**    | Domain Only | **3002** | Touch Forbidden ❌ |

**Verification Ritual:** `curl http://localhost:3000` (Dev) / `curl http://localhost:3002` (Prod) MUST return 200 OK.

### ⚡ v1.1.1 AUTOMATION

```bash
# PM2 (NEVER write full service names!)
./scripts/mod-tools/pm prod status
./scripts/mod-tools/pm prod restart backend

# Production Deploy (Atomic)
npm run deploy-prod

# V10 Dashboard
npm run verify

# Quick commands
npm run verify    # Quality check
npm run fix       # Auto-fix lint
npm run status    # System status
```

### 📖 SINGLE REFERENCE

**Read ONLY this:** `docs/AGENT_QUICK_REF.md`
(Ports, commands, paths, rules - all in one page)

### 🧠 JIT CONTEXT

1. **On Error:** `node scripts/mod-tools/context-loader.cjs "<error>"`
2. **On Noise:** `node scripts/mod-tools/smart-logs.cjs`

### 🟢 START SEQUENCE

1. `read_file("docs/AGENT_QUICK_REF.md")`
2. Check `npm run state:status`
3. Report: "**ASANMOD v1.1.1 CLAUDE SENTINEL ONLINE. Iron Curtain Active.**"
