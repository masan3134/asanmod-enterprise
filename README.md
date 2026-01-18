---
type: documentation
agent_role: project_lead
context_depth: 5
required_knowledge: ["asanmod_core"]
last_audited: "2026-01-18"
critical: true
---

# ASANMOD Enterprise Template v3.2.0

> **Autonomous Governance Protocol for AI-Native Enterprise Applications.**

ASANMOD is not just a template; it is a technical framework designed to provide a deterministic, stable, and isolated runtime for both Human developers and Autonomous AI Agents. It enforces strict separation of concerns, environment isolation (Iron Curtain), and automated quality gates.

---

## 🏗️ Technical Foundation

- **Framework:** Next.js 15 (App Router, Server Components, React 19)
- **API Layer:** tRPC (End-to-end type safety without code generation)
- **Database:** PostgreSQL + Drizzle ORM (Type-safe migrations and queries)
- **Security:** JWT (Stateless Auth) + Zod (Strict Schema Validation)
- **Ops:** PM2 v10.0 (Isolated DEV/PROD runtimes)

---

## 🕵️ AI-Native Operational Model

This template is specifically structured to minimize AI hallucination and maximize execution reliability:

1. **Deterministic Context:** All documentation utilizes YAML frontmatter for machine-readable metadata.
2. **Runtime State:** `.asanmod/manifest.json` provides a 20ms lookup for system health and verification status.
3. **Single Source of Truth:** `docs/asanmod-core.json` defines all ports, paths, and constraints.
4. **Autonomous Gates:** Built-in verification scripts (`npm run verify`) act as hard gates for code acceptance.

---

## ⚡ Core Automation (scripts/mod-tools)

| Command | Purpose | AI-Responsive Mode |
| :--- | :--- | :--- |
| `npm run verify` | Full quality scan (Lint, Static Analysis, Type-check, Build) | Returns JSON evidence logs |
| `pm dev errors` | Scans logs for errors with UTC+3 timestamps | Formatted for quick agent triage |
| `pm prod diag` | Generates a full system diagnostic report | E2E health summary |
| `npm run wizard` | Autonomous placeholder purging and project init | Non-interactive mode supported |

---

## 🛡️ Iron Curtain Protocol

ASANMOD enforces physical isolation between Development and Production:

- **DEV (Port 3000):** Local/Internal access for rapid iteration.
- **PROD (Port 3002):** Bound to `127.0.0.1`. No direct public access. Must use reverse proxy (Nginx).
- **Physical Isolation:** Separate Databases, separate PM2 processes, separate ENV files.

---

## 🚀 Quick Startup

```bash
git clone <repo> <dir>
cd <dir>
npm install       # Triggers auto-wizard
npm run dev       # Starts app-dev on port 3000
```

**Next Steps:**
- Configure `.env` using `.env.example`.
- Review `docs/AGENT_QUICK_REF.md` for all executable commands.
- Verify state with `npm run status`.

---

## 📖 Essential Documentation

- **[AGENT_QUICK_REF.md](docs/AGENT_QUICK_REF.md):** The primary command and port registry.
- **[asanmod-core.json](docs/asanmod-core.json):** The SSOT for all configuration.
- **[SECURITY.md](docs/SECURITY.md):** Technical security implementation and constraints.
- **[GETTING_STARTED.md](docs/GETTING_STARTED.md):** Step-by-step setup and architecture guide.

---

*ASANMOD v3.2.0 | Deterministic Software Engineering*
