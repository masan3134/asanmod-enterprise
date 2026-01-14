---
type: documentation
agent_role: cursor_agent
context_depth: 5
required_knowledge: ["asanmod_core"]
last_audited: "2026-01-14"
critical: true
---

<!--
ASANMOD v1.1.1 - CURSOR PROTOCOL
-->

# ASANMOD v1.1.1: CURSOR PROTOCOL

> **Read asanmod-core.json first.**

## 🚨 FIRST RUN SEQUENCE (MANDATORY)

**When you FIRST open this project, YOU MUST:**

1. **Read README.md** (overview)
2. **Run wizard**: `npm run wizard`
   - Configures project name
   - Updates placeholders
   - Creates .env file
3. **Read docs/GETTING_STARTED.md** (detailed setup)
4. **Read docs/asanmod-core.json** (configuration)
5. **Read docs/AGENT_QUICK_REF.md** (commands)

**DO NOT skip wizard! It configures the template for your project.**

---

## 🔒 CONSTRAINTS

- Commit format: `type(scope): message`
- Read `docs/asanmod-core.json` first
- Never hardcode ports/paths (use config)
- **VERSION LOCK**: Current project version is **3.0.0**. You are **STRICTLY FORBIDDEN** from changing this version string without explicit user command "CONFIRM_VERSION_BUMP".

## 🌐 PORTS

- DEV: 3000 (frontend), 3001 (backend)
- PROD: 3002 (frontend), 3003 (backend)

## 📖 REFERENCE

All info in `docs/AGENT_QUICK_REF.md`

---

*ASANMOD v1.1.1*
