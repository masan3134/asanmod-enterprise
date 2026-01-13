# ASANMOD Enterprise Template

> **Production-ready SaaS foundation with autonomous governance.**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](./CHANGELOG.md)
[![ASANMOD](https://img.shields.io/badge/ASANMOD-v2.0-green.svg)](./docs/AGENT_QUICK_REF.md)

## 🚀 Quick Start

```bash
# 1. Clone or use this template
git clone https://github.com/your-org/your-project.git
cd your-project

# 2. Install dependencies
npm install

# 3. Run the setup wizard
npm run wizard

# 4. Start development
npm run dev
```

## 📦 What's Included

### Tech Stack

- **Framework:** Next.js 15 (App Router)
- **API:** tRPC (End-to-end type safety)
- **Database:** Drizzle ORM + PostgreSQL
- **Styling:** Tailwind CSS + Shadcn/UI
- **Validation:** Zod

### ASANMOD Governance

- **Physical Barriers:** Git hooks enforce quality (0/0/0 policy)
- **Single Source of Truth:** `docs/asanmod-core.json`
- **Agent Protocols:** CLAUDE.md, GEMINI.md, CURSOR.md
- **Automation:** 50+ scripts in `scripts/mod-tools/`

## 📁 Project Structure

```
├── src/
│   ├── app/          # Next.js pages
│   ├── components/   # UI components
│   ├── server/       # tRPC routers
│   └── db/           # Drizzle schema
├── scripts/
│   └── mod-tools/    # ASANMOD automation
├── docs/             # Documentation
└── .asanmod/         # Agent state
```

## 🛠️ Commands

| Command               | Description                  |
| --------------------- | ---------------------------- |
| `npm run dev`         | Start development server     |
| `npm run build`       | Build for production         |
| `npm run verify`      | Quality check (lint + types) |
| `npm run fix`         | Auto-fix linting issues      |
| `npm run status`      | Show ASANMOD dashboard       |
| `npm run wizard`      | Run setup wizard             |
| `npm run deploy-prod` | Deploy to production         |

## 📖 Documentation

- **Quick Reference:** [docs/AGENT_QUICK_REF.md](./docs/AGENT_QUICK_REF.md)
- **Patterns:** [docs/PATTERNS.md](./docs/PATTERNS.md)
- **Configuration:** [docs/asanmod-core.json](./docs/asanmod-core.json)

## 🛡️ Quality Gates

All commits must pass:

1. **Lint Check:** Zero ESLint errors
2. **Type Check:** Zero TypeScript errors
3. **Console Ban:** No `console.log` in production code
4. **Commit Format:** `ID: TASK-001 | Description`

## 📄 License

Private - See [LICENSE](./LICENSE)
