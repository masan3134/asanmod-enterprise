---
type: task_list
agent_role: all
context_depth: 5
required_knowledge: ["asanmod_core"]
last_audited: "2026-01-15"
critical: true
---

# 🤖 AGENT FIRST PLAN (Chronological Onboarding)

> **Instructions for Agent:** Follow this plan strictly from top to bottom. Do not skip any steps. Mark tasks as complete as you progress.

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
- [ ] **Database Schema** | EXEC: `npm run db:push` | CHECK: `psql -d <DB_NAME> -c '\dt' | wc -l` shows tables
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

## 🔒 HARD RULES BY ASANMOD
1. **Never Hardcode:** Always read ports and paths from `docs/asanmod-core.json`.
2. **0/0/0 Policy:** No commits without a full `npm run verify` pass.
3. **Commit Format:** Use `feat(scope): message` as enforced by Husky.
4. **Iron Curtain:** Respect the isolation between DEV and PROD environments.
5. **Manifest-First:** Always read `.asanmod/manifest.json` at startup to understand system state.

*Verified by ASANMOD Governance v2.2.0*
