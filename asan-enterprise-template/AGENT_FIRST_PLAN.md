# 🤖 AGENT FIRST PLAN (Chronological Onboarding)

> **Instructions for Agent:** Follow this plan strictly from top to bottom. Do not skip any steps. Mark tasks as complete as you progress.

---

## 🛠️ PHASE 1: System Baseline
- [ ] **Read Governance** | EXEC: `cat docs/asanmod-core.json docs/AGENT_QUICK_REF.md` | CHECK: Confirm ports and constraints are understood
- [ ] **Install Dependencies** | EXEC: `npm install` | CHECK: `ls node_modules | wc -l` returns >100
- [ ] **Run AI Wizard** | EXEC: `npm run wizard` | CHECK: `grep -r "\[PROJECT_NAME\]" . --exclude-dir=node_modules | wc -l` returns 0
  - *Note: Wizard will perform a system audit. Provide your consensus to proceed if prompted.*
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

*Verified by ASANMOD Governance v2.1.0-alpha*
