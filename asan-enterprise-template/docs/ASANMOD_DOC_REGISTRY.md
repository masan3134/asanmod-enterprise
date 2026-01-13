# ASANMOD v9.1 DOCUMENTATION REGISTRY

<!--
ASANMOD v1.1.1 - DOCUMENTATION HEADER
ID: REGISTRY-001
STATUS: ACTIVE
TYPE: INDEX
LAST_UPDATED: 2026-01-13 (UTC)
VERSION: v1.1.1
-->

> **Source of Truth:** This file lists ALL valid ASANMOD v1.1.1 "EXECUTABLE RULES" documentation. Any file NOT listed here is considered DEPRECATED or ARCHIVED.

## 🏛️ THE CONSTITUTION (Core)

| ID            | Filename                                                                           | Status     | Version | Description                                    |
| :------------ | :--------------------------------------------------------------------------------- | :--------- | :------ | :--------------------------------------------- |
| **CONST-001** | [`docs/ASANMOD_MASTER_MANUAL.md`](docs/ASANMOD_MASTER_MANUAL.md)                   | **ACTIVE** | v9.0    | The supreme law of the ecosystem.              |
| **CONST-002** | [`CURSOR.md`](CURSOR.md)                                                           | **ACTIVE** | v1.1.1  | Activation Protocol for VS Code Agents.        |
| **CONST-003** | [`GEMINI.md`](GEMINI.md)                                                           | **ACTIVE** | v1.1.1  | Activation Protocol for LLM Agents.            |
| **CONST-004** | [`.cursorrules`](.cursorrules)                                                     | **ACTIVE** | v1.1.1  | Machine-readable ruleset for IDE.              |
| **CONST-005** | [`ikai.mdc`](ikai.mdc)                                                             | **ACTIVE** | v1.1.1  | Project context and coding patterns.           |
| **CONST-006** | [`CLAUDE.md`](CLAUDE.md)                                                           | **ACTIVE** | v1.1.1  | Activation Protocol for Claude Agents.         |
| **CONST-007** | [`docs/ASANMOD_ISOLATION_PROTOCOL.md`](docs/ASANMOD_ISOLATION_PROTOCOL.md)         | **ACTIVE** | v1.1.1  | **Iron Curtain:** Dev/Prod Isolation Rules.    |
| **CORE-001**  | [`docs/asanmod-core.json`](docs/asanmod-core.json)                                 | **ACTIVE** | v1.1.1  | Machine-readable core configuration.           |
| **CORE-002**  | [`docs/AGENT_QUICK_REF.md`](docs/AGENT_QUICK_REF.md)                               | **ACTIVE** | v9.0    | Single-page agent reference (ports, commands). |
| **TOOL-001**  | [`scripts/mod-tools/pm`](scripts/mod-tools/pm)                                     | **ACTIVE** | v9.0    | PM2 wrapper script (alias system).             |
| **TOOL-002**  | [`scripts/mod-tools/env-helper.cjs`](scripts/mod-tools/env-helper.cjs)             | **ACTIVE** | v9.0    | Environment helper module.                     |
| **TOOL-003**  | [`scripts/mod-tools/context-autoload.cjs`](scripts/mod-tools/context-autoload.cjs) | **ACTIVE** | v9.1    | Auto-detect Context Pack from keywords.        |
| **TOOL-004**  | [`scripts/mod-tools/validate-command.cjs`](scripts/mod-tools/validate-command.cjs) | **ACTIVE** | v9.1    | Command validator (rejects bad PM2 calls).     |
| **TOOL-005**  | [`scripts/mod-tools/state-sanitize.cjs`](scripts/mod-tools/state-sanitize.cjs)     | **ACTIVE** | v9.1    | State TTL and cleanup (24h, 5 history).        |
| **TOOL-006**  | [`docs/ASANMOD_FULL_VERIFY_PROMPT.md`](docs/ASANMOD_FULL_VERIFY_PROMPT.md)         | **ACTIVE** | v1.1.1  | Full system verification prompt template.      |
| **CORE-003**  | [`docs/AGENT_QUICK_REF_COMPACT.md`](docs/AGENT_QUICK_REF_COMPACT.md)               | **ACTIVE** | v9.1    | Compact Quick Ref (68% token reduction).       |

## 📜 SPECIALIZED RULES (Context)

| ID                | Filename                                                   | Status     | Version | Description                            |
| :---------------- | :--------------------------------------------------------- | :--------- | :------ | :------------------------------------- |
| **RULE-DB-001**   | [`docs/rules/DB_RULES.md`](docs/rules/DB_RULES.md)         | **ACTIVE** | v8.1    | Database & Prisma Rules.               |
| **RULE-UI-001**   | [`docs/rules/UI_RULES.md`](docs/rules/UI_RULES.md)         | **ACTIVE** | v8.1    | UI, CSS & Frontend Architecture Rules. |
| **RULE-API-001**  | [`docs/rules/API_RULES.md`](docs/rules/API_RULES.md)       | **ACTIVE** | v8.1    | API & Backend Architecture Rules.      |
| **RULE-AUTH-001** | [`docs/rules/AUTH_RULES.md`](docs/rules/AUTH_RULES.md)     | **ACTIVE** | v8.1    | RBAC, Middleware, Session Rules.       |
| **RULE-SEC-001**  | [`docs/rules/SAFE_ZONES.json`](docs/rules/SAFE_ZONES.json) | **ACTIVE** | v8.1    | Critical file protection definitions.  |

## 📋 CONTRACTS (Agent Behavior)

| ID               | Filename                                                                           | Status     | Version | Description                                  |
| :--------------- | :--------------------------------------------------------------------------------- | :--------- | :------ | :------------------------------------------- |
| **CONTRACT-001** | [`docs/contracts/AGENT_CONTRACT_v8.md`](docs/contracts/AGENT_CONTRACT_v8.md)       | **ACTIVE** | v8.1    | Agent behavior contract (Hard Constraints).  |
| **CONTRACT-002** | [`docs/contracts/DEV_STRICT_MODE.md`](docs/contracts/DEV_STRICT_MODE.md)           | **ACTIVE** | v8.1    | DEV strict mode definition (The Law).        |
| **CONTRACT-003** | [`docs/contracts/HARD_STOP_CONDITIONS.md`](docs/contracts/HARD_STOP_CONDITIONS.md) | **ACTIVE** | v8.1    | Hard-stop conditions (agent stop scenarios). |

## 🎯 CONTEXT PACKS (JIT Context Loading)

| ID                  | Filename                                                               | Status     | Version | Description                              |
| :------------------ | :--------------------------------------------------------------------- | :--------- | :------ | :--------------------------------------- |
| **PACK-UI-001**     | [`docs/packs/ContextPack_UI.md`](docs/packs/ContextPack_UI.md)         | **ACTIVE** | v8.1    | UI context pack (frontend changes).      |
| **PACK-DB-001**     | [`docs/packs/ContextPack_DB.md`](docs/packs/ContextPack_DB.md)         | **ACTIVE** | v8.1    | DB context pack (database/migration).    |
| **PACK-API-001**    | [`docs/packs/ContextPack_API.md`](docs/packs/ContextPack_API.md)       | **ACTIVE** | v8.1    | API context pack (backend endpoints).    |
| **PACK-AUTH-001**   | [`docs/packs/ContextPack_AUTH.md`](docs/packs/ContextPack_AUTH.md)     | **ACTIVE** | v8.1    | AUTH context pack (RBAC/authentication). |
| **PACK-DEPLOY-001** | [`docs/packs/ContextPack_DEPLOY.md`](docs/packs/ContextPack_DEPLOY.md) | **ACTIVE** | v8.1    | DEPLOY context pack (deployment/PM2).    |
| **PACK-SEO-001**    | [`docs/packs/ContextPack_SEO.md`](docs/packs/ContextPack_SEO.md)       | **ACTIVE** | v8.1    | SEO context pack (metadata/sitemap).     |

## 🔄 WORKFLOWS (Agent Execution)

| ID               | Filename                                                                       | Status     | Version | Description                                 |
| :--------------- | :----------------------------------------------------------------------------- | :--------- | :------ | :------------------------------------------ |
| **WORKFLOW-001** | [`docs/workflows/AGENT_WORKFLOW_v8.md`](docs/workflows/AGENT_WORKFLOW_v8.md)   | **ACTIVE** | v8.1    | Agent workflow template (Hard Constraints). |
| **WORKFLOW-002** | [`docs/workflows/EXAMPLE_TRANSCRIPT.md`](docs/workflows/EXAMPLE_TRANSCRIPT.md) | **ACTIVE** | v8.1    | Example transcript (ideal task execution).  |

## 🛠️ OPERATIONS (Commands & Scripts)

| ID          | Filename                                                             | Status     | Version | Description                                                   |
| :---------- | :------------------------------------------------------------------- | :--------- | :------ | :------------------------------------------------------------ |
| **OPS-001** | [`docs/ops/COMMAND_REGISTRY.md`](docs/ops/COMMAND_REGISTRY.md)       | **ACTIVE** | v8.1    | Command & Script Registry (Hard Constraints).                 |
| **OPS-002** | [`docs/ops/KPI_SCOREBOARD.md`](docs/ops/KPI_SCOREBOARD.md)           | **ACTIVE** | v8.1    | KPI Scoreboard (speed/quality/reality/context/token metrics). |
| **OPS-003** | [`docs/ops/STRICT_MODE_ROLLOUT.md`](docs/ops/STRICT_MODE_ROLLOUT.md) | **ACTIVE** | v8.1    | Strict Mode Rollout Guide (DEV -> PROD controlled rollout).   |

## 🏗️ ARCHITECTURE (System Map)

| ID           | Filename                                                                                   | Status     | Version | Description                                 |
| :----------- | :----------------------------------------------------------------------------------------- | :--------- | :------ | :------------------------------------------ |
| **ARCH-001** | [`docs/architecture/ASANMOD_SYSTEM_MAP.md`](docs/architecture/ASANMOD_SYSTEM_MAP.md)       | **ACTIVE** | v8.1    | System map (critical files inventory).      |
| **ARCH-002** | [`docs/architecture/TRUTH_TABLE.md`](docs/architecture/TRUTH_TABLE.md)                     | **ACTIVE** | v8.1    | Truth table (source vs derived vs archive). |
| **ARCH-003** | [`docs/architecture/DEPRECATED_CANDIDATES.md`](docs/architecture/DEPRECATED_CANDIDATES.md) | **ACTIVE** | v8.1    | Deprecated candidates & archive plan.       |
| **ARCH-004** | [`docs/architecture/LINK_BREAKAGE_REPORT.md`](docs/architecture/LINK_BREAKAGE_REPORT.md)   | **ACTIVE** | v8.1    | Link breakage report (post-archive).        |
| **ARCH-005** | [`docs/architecture/V8_GAPS_REPORT.md`](docs/architecture/V8_GAPS_REPORT.md)               | **ACTIVE** | v8.1    | V8.0 Gaps Report (gaps report).             |

## 📚 GOVERNANCE (Sustainability)

| ID          | Filename                                                                                 | Status     | Version | Description                                   |
| :---------- | :--------------------------------------------------------------------------------------- | :--------- | :------ | :-------------------------------------------- |
| **GOV-001** | [`docs/governance/DRIFT_CHECKLIST.md`](docs/governance/DRIFT_CHECKLIST.md)               | **ACTIVE** | v8.1    | Drift checklist (weekly/monthly consistency). |
| **GOV-002** | [`docs/governance/VERSIONING_STRATEGY.md`](docs/governance/VERSIONING_STRATEGY.md)       | **ACTIVE** | v8.1    | Versioning strategy (semantic versioning).    |
| **GOV-003** | [`docs/governance/RELEASE_NOTES_TEMPLATE.md`](docs/governance/RELEASE_NOTES_TEMPLATE.md) | **ACTIVE** | v8.1    | Release notes template.                       |
| **GOV-004** | [`docs/governance/OWNERSHIP.md`](docs/governance/OWNERSHIP.md)                           | **ACTIVE** | v8.1    | Ownership definitions (user/agent/script).    |

## 📝 PROTOCOLS (Update & Maintenance)

| ID               | Filename                                                             | Status     | Version | Description                               |
| :--------------- | :------------------------------------------------------------------- | :--------- | :------ | :---------------------------------------- |
| **PROTOCOL-001** | [`docs/ASANMOD_UPDATE_PROTOCOL.md`](docs/ASANMOD_UPDATE_PROTOCOL.md) | **ACTIVE** | v8.1    | Update protocol (Big-3 + Inventory sync). |

## 📊 SYSTEM STATE

| ID            | Filename                                         | Status     | Version | Description                                   |
| :------------ | :----------------------------------------------- | :--------- | :------ | :-------------------------------------------- |
| **STATE-001** | [`docs/SYSTEM_STATUS.md`](docs/SYSTEM_STATUS.md) | **LIVE**   | AUTO    | Automated system health snapshot.             |
| **STATE-002** | [`docs/CREDENTIALS.md`](docs/CREDENTIALS.md)     | **ACTIVE** | v8.1    | Environment variable references (No secrets). |
| **STATE-003** | [`README.md`](README.md)                         | **ACTIVE** | v5.0    | Project entry point and overview.             |

## 📦 ARCHIVED (Legacy)

| Location                     | Description                         |
| :--------------------------- | :---------------------------------- |
| `docs/archive_v3_legacy/`    | All v3.x scripts and documentation. |
| `scripts/archive_legacy_v3/` | Deprecated shell/node scripts.      |
| `docs/archive/YYYY-MM/`      | Monthly archive (v8.0+).            |
| `scripts/archive/`           | Legacy scripts archive.             |

### Archive Metadata

- **Template:** `docs/archive/_METADATA_TEMPLATE.md`
- **Deprecated List:** `docs/architecture/DEPRECATED_CANDIDATES.md`
- **Link Breakage Report:** `docs/architecture/LINK_BREAKAGE_REPORT.md`

### 🔄 UPDATE PROTOCOL (Rule 0-DOCS)

1.  **Check Registry:** Before reading/writing docs, check this registry.
2.  **Update Header:** If modifying a doc, you **MUST** update the `LAST_UPDATED` field in the header.
3.  **UTC Time:** Always use UTC date (YYYY-MM-DD).
4.  **Registry Sync:** If you create a NEW doc, you **MUST** add it to this Registry immediately.
5.  **Prompt Sync:** If you update core rules, check `CURSOR.md` and `GEMINI.md` to see if they need mirroring.
