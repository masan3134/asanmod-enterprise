# 🤖 AGENT FIRST PLAN (Chronological Onboarding)

> **Instructions for Agent:** Follow this plan strictly from top to bottom. Do not skip any steps. Mark tasks as complete as you progress.

---

## 🛠️ PHASE 1: System Baseline
- [ ] **Read Governance:** Read `docs/asanmod-core.json` and `docs/AGENT_QUICK_REF.md`.
- [ ] **Install Dependencies:** Run `npm install`.
- [ ] **Run AI Wizard:** Run `npm run wizard`.
  - *Note: Wizard will perform a system audit. Provide your consensus to proceed if prompted.*
- [ ] **Verify Placeholders:** Ensure the wizard purged all `[PROJECT_NAME]` and `WIZARD_WILL_FILL` strings.

## 🗄️ PHASE 2: Infrastructure Sync
- [ ] **Environment Check:** Copy `.env.example` to `.env` and configure `DATABASE_URL`.
- [ ] **Database Schema:** Run `npm run db:push`.
- [ ] **Seed Initial Data:** Run `npm run seed`.
- [ ] **Admin Account:** Run `npm run create-admin`.

## 🔍 PHASE 3: Quality Gate Verification
- [ ] **Pre-Commit Verify:** Run `npm run verify`.
  - All 6 Gates (Lint, TSC, Test, Audit, Build, Env) MUST pass.
- [ ] **Health Check:** Run `npm run health`.

## 🟢 PHASE 4: Activation
- [ ] **Start Dev Mode:** Run `npm run dev`.
- [ ] **Final Check:** Access `http://localhost:3000` (or as configured in `asanmod-core.json`).

---

## 🔒 HARD RULES BY ASANMOD
1. **Never Hardcode:** Always read ports and paths from `docs/asanmod-core.json`.
2. **0/0/0 Policy:** No commits without a full `npm run verify` pass.
3. **Commit Format:** Use `feat(scope): message` as enforced by Husky.
4. **Iron Curtain:** Respect the isolation between DEV and PROD environments.

*Verified by ASANMOD Governance v2.1.0-alpha*
