<!--
ASANMOD v3.2.0 - DOCUMENTATION HEADER
ID: CONST-00X
STATUS: ACTIVE
TYPE: PROTOCOL
LAST_UPDATED: 2026-01-18 (UTC)
VERSION: v3.2.0
-->

# ASANMOD v3.2.0: GEMINI HARD CONSTRAINT PROTOCOL

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

| Environment | PM2 Name | Port | Access |
| ----------- | -------- | ---- | ------ |
| **DEV** | `app-dev` | **3000** | Hot Reload ✅ |
| **PROD** | `app-prod` | **3002** | Stable (PROD) ❌ |

**Verification Ritual:** `curl http://localhost:3000` (Dev) / `curl http://localhost:3002` (Prod) MUST return 200 OK.

### ⚡ v3.2.0 AUTOMATION

```bash
# PM2 Wrapper (v10.0 AI-Responsive)
./scripts/mod-tools/pm dev status      # Check status
./scripts/mod-tools/pm dev errors      # 🤖 Error scan (UTC+3)
./scripts/mod-tools/pm prod diag       # 🤖 Full diagnostic
./scripts/mod-tools/pm dev health      # 🤖 Health check

# Core Operations
npm run verify      # Quality check (0/0/0)
npm run fix         # Auto-fix lint
npm run deploy-prod # Production deploy
```

### 📖 SINGLE REFERENCE
**Read ONLY this:** `docs/AGENT_QUICK_REF.md`
(Ports, commands, paths, rules - all in one page)

### 🧠 JIT CONTEXT
1. **On Error:** `node scripts/mod-tools/context-loader.cjs "<error>"`
2. **On Noise:** `node scripts/mod-tools/smart-logs.cjs`

### 🟢 START SEQUENCE
1. Read `docs/AGENT_QUICK_REF.md`
2. Run `npm run verify`
3. Report: "**ASANMOD v3.2.0 ONLINE. Iron Curtain Active.**"
