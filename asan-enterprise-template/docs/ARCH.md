# 🏗️ ASANMOD ARCHITECTURE & AGENT ROLES

## 📜 The Agent Social Contract
This project is designed for **Autonomous AI Orchestration**. As an Agent, you are expected to:
1. **Never Hardcode:** Read configuration from `docs/asanmod-core.json`.
2. **Verify Before Push:** Always run `npm run verify` and ensure a 0/0/0 state.
3. **Log Evidence:** Ensure your actions generate logs in the `logs/` directory.

---

## 👥 Agent Specialized Roles

### 🎨 Frontend Agent
- **Target:** `src/app`, `src/components`, `index.css`.
- **Constraint:** Use Vanilla CSS or Tailwind as per user request. No inline styles.
- **Goal:** WOW aesthetics with dark mode support.

### 🔌 API & Backend Agent
- **Target:** `src/server`, `src/db`.
- **Constraint:** Ensure type-safe tRPC procedures and Drizzle migrations.
- **Goal:** Zero-friction data flow with proper validation.

### 🛡️ Infrastructure & DevOps Agent
- **Target:** `scripts/mod-tools`, `package.json`, `PM2`.
- **Constraint:** Maintain the "Iron Curtain" between DEV and PROD.
- **Goal:** 100% deterministic deployment.

---

## 📁 System Topology
- `src/app/`: Next.js App Router (UI structure)
- `src/server/`: tRPC Routers & Backend Logic
- `src/db/`: Drizzle Schema & Connection
- `docs/`: Authority (json configs, rules)
- `scripts/`: Manual & Autonomous tools
- `logs/`: Evidence trails for all audits

*Verified by ASANMOD Enterprise v2.0.2*
