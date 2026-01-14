---
type: reference
agent_role: all
context_depth: 2
required_knowledge: ["asanmod_core"]
last_audited: "2026-01-14"
---

# ASANMOD v2.1.0-alpha DOCUMENTATION REGISTRY

<!--
ASANMOD v2.1.0-alpha - DOCUMENTATION HEADER
ID: REGISTRY-001
STATUS: ACTIVE
TYPE: INDEX
LAST_UPDATED: 2026-01-14 (UTC)
VERSION: v2.1.0-alpha
-->

> **Source of Truth:** This file lists ALL valid ASANMOD v2.1.0-alpha documentation for the Enterprise Template. Any file NOT listed here does not exist in this template.

---

## 🏛️ CORE DOCUMENTATION

| ID            | Filename                                                       | Status     | Version | Description                                  |
| :------------ | :------------------------------------------------------------- | :--------- | :------ | :------------------------------------------- |
| **CONST-001** | [`README.md`](../README.md)                                    | **ACTIVE** | v2.1.0-alpha  | Project overview and quick start             |
| **CONST-002** | [`GEMINI.md`](../GEMINI.md)                                    | **ACTIVE** | v2.1.0-alpha  | Gemini agent protocol (FIRST RUN SEQUENCE)   |
| **CONST-003** | [`CURSOR.md`](../CURSOR.md)                                    | **ACTIVE** | v2.1.0-alpha  | Cursor agent protocol (FIRST RUN SEQUENCE)   |
| **CONST-004** | [`CLAUDE.md`](../CLAUDE.md)                                    | **ACTIVE** | v2.1.0-alpha  | Claude agent protocol (FIRST RUN SEQUENCE)   |
| **CORE-001**  | [`docs/asanmod-core.json`](asanmod-core.json)                  | **ACTIVE** | v2.1.0-alpha  | Machine-readable core configuration (SSOT)   |
| **CORE-002**  | [`docs/AGENT_QUICK_REF.md`](AGENT_QUICK_REF.md)                | **ACTIVE** | v2.1.0-alpha  | Single-page agent reference (all commands)   |
| **CORE-003**  | [`docs/GETTING_STARTED.md`](GETTING_STARTED.md)                | **ACTIVE** | v2.1.0-alpha  | Complete 8-step setup guide                  |
| **CORE-004**  | [`docs/ASANMOD_DOC_REGISTRY.md`](ASANMOD_DOC_REGISTRY.md)      | **ACTIVE** | v2.1.0-alpha  | This file - documentation index              |

---

## 📚 SETUP & DEPLOYMENT

| ID          | Filename                                   | Status     | Version | Description                          |
| :---------- | :----------------------------------------- | :--------- | :------ | :----------------------------------- |
| **SETUP-001** | [`docs/MCP_SETUP.md`](MCP_SETUP.md)          | **ACTIVE** | v2.1.0-alpha  | MCP server setup guide               |
| **SETUP-002** | [`docs/DEPLOYMENT.md`](DEPLOYMENT.md)        | **ACTIVE** | v2.1.0-alpha  | Production deployment guide          |
| **SETUP-003** | [`.env.example`](../.env.example)            | **ACTIVE** | v2.1.0-alpha  | Environment variables template       |

---

## 📖 ADDITIONAL GUIDES

| ID | Filename | Status | Version | Description |
| :-- | :------- | :----- | :------ | :---------- |
| **GUIDE-001** | [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) | **ACTIVE** | v2.1.0-alpha | System architecture overview |
| **GUIDE-002** | [`docs/CONVENTIONS.md`](CONVENTIONS.md) | **ACTIVE** | v2.1.0-alpha | Code conventions |
| **GUIDE-003** | [`docs/PATTERNS.md`](PATTERNS.md) | **ACTIVE** | v2.1.0-alpha | Common patterns |
| **GUIDE-004** | [`docs/GOTCHAS.md`](GOTCHAS.md) | **ACTIVE** | v2.1.0-alpha | Common pitfalls |
| **GUIDE-005** | [`docs/SECURITY.md`](SECURITY.md) | **ACTIVE** | v2.1.0-alpha | Security best practices |
| **GUIDE-006** | [`docs/TESTING.md`](TESTING.md) | **ACTIVE** | v2.1.0-alpha | Testing guide |
| **GUIDE-007** | [`docs/TROUBLESHOOTING.md`](TROUBLESHOOTING.md) | **ACTIVE** | v2.1.0-alpha | Troubleshooting guide |

---

## 🛠️ SCRIPTS & TOOLS

| ID | Filename | Status | Version | Description |
| :-- | :------- | :----- | :------ | :---------- |
| **TOOL-001** | [`scripts/mod-tools/pm`](../scripts/mod-tools/pm) | **ACTIVE** | v2.1.0-alpha | PM2 wrapper script |
| **TOOL-002** | [`scripts/mod-tools/asan-wizard.js`](../scripts/mod-tools/asan-wizard.js) | **ACTIVE** | v2.1.0-alpha | Project setup wizard |
| **TOOL-003** | [`scripts/mod-tools/asan-init.js`](../scripts/mod-tools/asan-init.js) | **ACTIVE** | v2.1.0-alpha | Project initialization |
| **TOOL-004** | [`scripts/create-admin.ts`](../scripts/create-admin.ts) | **ACTIVE** | v2.1.0-alpha | Admin user creation |
| **TOOL-005** | [`scripts/seed.ts`](../scripts/seed.ts) | **ACTIVE** | v2.1.0-alpha | Database seeding |
| **TOOL-006** | [`scripts/mod-tools/verify.sh`](../scripts/mod-tools/verify.sh) | **ACTIVE** | v2.1.0-alpha | Code quality verification |
| **TOOL-007** | [`scripts/mod-tools/deploy-prod.sh`](../scripts/mod-tools/deploy-prod.sh) | **ACTIVE** | v2.1.0-alpha | Production deployment |
| **TOOL-008** | [`scripts/mod-tools/health-check.sh`](../scripts/mod-tools/health-check.sh) | **ACTIVE** | v2.1.0-alpha | System health check |

---

## ⚙️ CONFIGURATION

| ID | Filename | Status | Version | Description |
| :-- | :------- | :----- | :------ | :---------- |
| **CONFIG-001** | [`ecosystem.config.cjs`](../ecosystem.config.cjs) | **ACTIVE** | v2.1.0-alpha | PM2 dev/prod configuration |
| **CONFIG-002** | [`package.json`](../package.json) | **ACTIVE** | v2.1.0-alpha | npm scripts and dependencies |
| **CONFIG-003** | [`tsconfig.json`](../tsconfig.json) | **ACTIVE** | v2.1.0-alpha | TypeScript configuration |
| **CONFIG-004** | [`next.config.js`](../next.config.js) | **ACTIVE** | v2.1.0-alpha | Next.js configuration |
| **CONFIG-005** | [`tailwind.config.js`](../tailwind.config.js) | **ACTIVE** | v2.1.0-alpha | Tailwind CSS configuration |
| **CONFIG-006** | [`.husky/commit-msg`](../.husky/commit-msg) | **ACTIVE** | v2.1.0-alpha | Git commit message hook |
| **CONFIG-007** | [`.husky/pre-commit`](../.husky/pre-commit) | **ACTIVE** | v2.1.0-alpha | Git pre-commit hook |

---

## 🔄 UPDATE PROTOCOL

When modifying documentation:

1. **Check Registry**: Before reading/writing docs, check this registry
2. **Update Documentation**: Make your edits
3. **Update Registry**: If you create a NEW doc, add it to this registry
4. **Update Protocols**: If changing core rules, update `GEMINI.md`, `CURSOR.md`, `CLAUDE.md`
5. **Test**: Verify all links work

---

## 📝 QUICK LINKS

**For First-Time Users:**
1. Read [`README.md`](../README.md)
2. Run `npm run wizard` (MANDATORY)
3. Follow [`docs/GETTING_STARTED.md`](GETTING_STARTED.md)

**For AI Agents:**
1. Read your protocol ([`GEMINI.md`](../GEMINI.md), [`CURSOR.md`](../CURSOR.md), or [`CLAUDE.md`](../CLAUDE.md))
2. Read [`docs/asanmod-core.json`](asanmod-core.json)
3. Read [`docs/AGENT_QUICK_REF.md`](AGENT_QUICK_REF.md)

---

*Last Updated: 2026-01-14*
*Template Version: 2.1.0-alpha*
