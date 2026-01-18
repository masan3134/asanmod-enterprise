---
type: documentation
agent_role: cursor_agent
context_depth: 4
required_knowledge: ["asanmod_core"]
last_audited: "2026-01-18"
---

<!--
ASANMOD v3.1.0 - DOCUMENTATION HEADER
ID: CONST-002
STATUS: ACTIVE
TYPE: PROTOCOL
LAST_UPDATED: 2026-01-18 (UTC)
VERSION: v3.1.0
-->

# ASANMOD v3.1.0: CURSOR HARD CONSTRAINT PROTOCOL

> **EXECUTABLE RULES. ZERO DOCUMENTATION BURDEN.**

### 🚨 HARD CONSTRAINTS (PHYSICALLY ENFORCED)

| Constraint                               | Enforcement                 |
| ---------------------------------------- | --------------------------- |
| Commit format: `type(scope): message`    | `.husky/commit-msg` REJECTS |
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

### ⚡ v3.1.0 AUTOMATION

```bash
# PM2 (NEVER write full names!)
./scripts/mod-tools/pm prod status
./scripts/mod-tools/pm prod restart

# 🤖 AI-RESPONSIVE (v10.0)
./scripts/mod-tools/pm dev errors     # Error scan (UTC+3)
./scripts/mod-tools/pm prod diag      # Diagnostic report
./scripts/mod-tools/pm dev health     # Service health

# Production Deploy (Atomic)
npm run deploy-prod

# Verify & Fix
npm run verify    # Quality check
npm run fix       # Auto-fix lint
```

### 📖 SINGLE REFERENCE

**Read ONLY this:** `docs/AGENT_QUICK_REF.md`
(Ports, commands, paths, rules - all in one page)

### 🧠 JIT CONTEXT

1. **On Error:** `node scripts/mod-tools/context-loader.cjs "<error>"`
2. **On Noise:** `node scripts/mod-tools/smart-logs.cjs`

### 🟢 START SEQUENCE

1. `read_file("docs/AGENT_QUICK_REF.md")`
2. Check `npm run verify`
3. Report: "**ASANMOD v3.1.0 CURSOR SENTINEL ONLINE. Iron Curtain Active.**"
