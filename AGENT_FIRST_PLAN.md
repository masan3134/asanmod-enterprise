---
type: task_list
agent_role: all
context_depth: 5
required_knowledge: ["asanmod_core"]
last_audited: "2026-01-18"
critical: true
---

# 🤖 AGENT FIRST PLAN (Chronological Onboarding)

> **Instructions for Agent:** Follow this plan strictly from top to bottom. Do not skip any steps. Mark tasks as complete as you progress.
> **Philosophy:** You are the **Technical Lead**. The User is only a conversation partner. You are responsible for all environment setup, coding, and fixing technical issues. Do not ask the User for permission to fix a bug or run a command. Just do it.

---

## 🛠️ PHASE 1: System Baseline

- [ ] **Read Governance** | EXEC: `cat docs/asanmod-core.json docs/AGENT_QUICK_REF.md` | CHECK: Confirm ports and constraints are understood
- [ ] **Install Dependencies** | EXEC: `npm install` | CHECK: `ls node_modules | wc -l` returns >100

### ⚠️ WIZARD IS INTERACTIVE - READ THIS FIRST!

The wizard requires user input. You MUST:
1. **Ask the USER** for project details BEFORE running wizard
2. **Use send_command_input** to provide answers when wizard prompts

#### Step 1: Collect Info from USER
Ask the user:
- "What is your project name?" (e.g., "My SaaS App")
- "Brief description?" (e.g., "A task management app")
- "Which modules? 1=auth, 2=users, 3=admin, 4=payments, 5=files" (e.g., "1,2,3")

#### Step 2: Run Wizard with Inputs
- [ ] **Run AI Wizard** | EXEC: `npm run wizard`
- When `Project name:` prompt appears → send_command_input: `{project_name}\n`
- When `Description:` prompt appears → send_command_input: `{description}\n`
- When `Enter numbers (e.g., 1,2,3):` appears → send_command_input: `{modules}\n`
- When `Deploy to production? (y/N):` appears → send_command_input: `n\n`
- CHECK: `grep -r "\[PROJECT_NAME\]" . --exclude-dir=node_modules | wc -l` returns 0

- [ ] **Verify Placeholders** | EXEC: N/A | CHECK: `grep -r "WIZARD_WILL_FILL" . --exclude-dir=node_modules | wc -l` returns 0

## 🗄️ PHASE 2: Infrastructure Sync
- [ ] **Environment Check** | EXEC: `cp .env.example .env` | CHECK: `grep "DATABASE_URL" .env` returns non-empty
- [ ] **Database Schema** | EXEC: `npm run db:push`
  - ⚠️ **Note**: If `db:push` asks for confirmation to create a database or apply changes, use `send_command_input: "y\n"`.
  - CHECK: `psql -d <DB_NAME> -c '\dt' | wc -l` shows tables
- [ ] **Seed Initial Data** | EXEC: `npm run seed` | CHECK: `cat .asanmod/manifest.json | jq '.flags.db_seeded'` returns true
- [ ] **Admin Account** | EXEC: `npm run create-admin` | CHECK: `cat .asanmod/manifest.json | jq '.flags.admin_created'` returns true

## 🔍 PHASE 3: Quality Gate Verification
- [ ] **Pre-Commit Verify** | EXEC: `npm run verify` | CHECK: `cat .asanmod/manifest.json | jq '.verification.gates_passed'` returns [1,2,3,4,5,6]
  - All 6 Gates (Lint, TSC, Test, Audit, Build, Env) MUST pass.
- [ ] **Health Check** | EXEC: `npm run health` | CHECK: `cat .asanmod/manifest.json | jq '.health.last_check'` is recent ISO timestamp

## 🟢 PHASE 4: Activation
- [ ] **Start Dev Mode** | EXEC: `npm run dev` | CHECK: `curl -f http://localhost:3000` returns 200 OK
- [ ] **Final Check** | EXEC: N/A | CHECK: Access `http://localhost:3000` (or as configured in `asanmod-core.json`) in browser

---

## 🔒 HARD RULES FOR AGENTS
1. **Full Autonomy**: You are responsible for the entire technical stack. If a script fails, debug it and fix it. Do not wait for user help.
2. **Never Hardcode**: Always read ports and paths from `docs/asanmod-core.json`.
3. **0/0/0 Policy**: No commits without a full `npm run verify` pass.
4. **Commit Format**: Use `feat(scope): message` as enforced by Husky.
5. **Iron Curtain**: Respect the isolation between DEV and PROD environments.
6. **Manifest-First**: Always read `.asanmod/manifest.json` at startup to understand system state.
7. **Strict Artifact Management**:
   - **Technical Docs**: Save ONLY to `docs/`
   - **Agent Audit/Reports**: Save ONLY to `docs/agents/`
   - **Project Plans**: Save ONLY to `docs/plans/`
   - **NEVER** write reports or internal logs to the root directory.

*Verified by ASANMOD Governance v3.2.0*
