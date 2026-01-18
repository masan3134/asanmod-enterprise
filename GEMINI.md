---
type: documentation
agent_role: gemini_agent
context_depth: 5
required_knowledge: ["asanmod_core"]
last_audited: "2026-01-18"
critical: true
---

<!--
ASANMOD v1.3.0 - GEMINI PROTOCOL
-->

# ASANMOD v1.3.0: GEMINI PROTOCOL

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

- DEV: 3000 (app-dev)
- PROD: 3002 (app-prod)

## ⚡ PM2 COMMANDS (v10.0)

```bash
# Standard Commands
./scripts/mod-tools/pm dev status
./scripts/mod-tools/pm prod restart
./scripts/mod-tools/pm dev logs

# 🤖 AI-RESPONSIVE (v10.0)
./scripts/mod-tools/pm dev errors     # Hata taraması (UTC+3)
./scripts/mod-tools/pm prod diag      # Diagnostic rapor
./scripts/mod-tools/pm dev health     # Servis sağlığı
./scripts/mod-tools/pm dev memory     # Memory kullanımı
```

## 🏥 DB PROTECTION (v3.1.0)

```bash
npm run db:health          # DEV DB orphan kontrolü
npm run db:health:prod     # PROD DB orphan kontrolü
npm run db:sync-check      # DEV vs PROD karşılaştırma
```

**Güvenlik:** Bu scriptler SALT-OKUNUR - hiçbir veri değiştirmez.

## 📖 REFERENCE

All info in `docs/AGENT_QUICK_REF.md`

---

*ASANMOD v1.3.0 - AI-Responsive PM2*
