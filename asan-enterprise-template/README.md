# ASAN Enterprise Template

> **Type-Safe Vibe Coding Starter Kit (ASANMOD v1.0.0)**

## 🚀 Getting Started

1. **Clone & Detach**

   ```bash
   cp -r packages/asan-enterprise-template my-new-saas
   cd my-new-saas
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Install ASAN CLI (If not global)**

   ```bash
   npm link @asanmod/cli
   ```

   ```bash

   ```

# 🚀 ASAN Enterprise Template v1.0.0

**AI-Native SaaS Skeleton | Ghost-Dev Protocol | ASANMOD Governance**

## 🎯 What Is This?

This is **not** a boilerplate. This is a **Software Factory**—a self-governed workspace that enables autonomous AI agents to build production-grade SaaS applications from a strategic interview.

### Core Stack (Type-Safe Vibe Coding)

- **Next.js 15** (App Router)
- **tRPC v11** (Type-safe API)
- **Drizzle ORM** (PostgreSQL)
- **Zod** (Validation)
- **Shadcn/UI + Tailwind CSS** (Components)

### Built-In Governance (ASANMOD v1.0.0)

- ✅ Physical quality barriers (Lint, TSC, State TTL)
- ✅ 40+ automation scripts (`scripts/mod-tools/`)
- ✅ MCP servers for agent-to-agent communication
- ✅ Ghost-Dev protocol for autonomous development

---

## 📋 Quick Start (For AI Agents)

### Step 1: Initialize the Project

```bash
cd asan-enterprise-template
asan init
```

This creates `.env`, ASANMOD state directories, and prepares the workspace.

### Step 2: Strategic Interview (Ghost-Dev Entry)

```bash
asan wizard
```

Answer 7 business questions. The agent will then:

- Generate database schemas
- Scaffold tRPC routers
- Create UI components
- Configure integrations

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Setup Database

```bash
# Update .env with your DATABASE_URL
npm run db:generate
npm run db:migrate
```

### Step 5: Verify Integrity

```bash
asan verify
```

### Step 6: Start Development

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🛡️ Agent Rules (READ FIRST)

**MANDATORY:** Read `docs/GHOST_DEV_PROTOCOL.md` before making changes.

**Key Constraints:**

- Never ask technical questions (library choices, DB structure, etc.)
- All UI must be mobile-first (`sm:`, `md:` prefixes)
- No `any` types—use Zod for all validation
- No `console.log` in `src/server/`—use proper logging
- Run `asan verify` before every commit

---

## 📂 Directory Structure

```
├── src/
│   ├── app/           # Next.js routes (Pages)
│   ├── server/        # tRPC routers (Business logic)
│   ├── db/            # Drizzle schema & client
│   ├── components/    # Shadcn/UI components
│   └── lib/           # Utilities
├── scripts/mod-tools/ # ASANMOD automation
├── mcp-servers/       # Agent communication
├── docs/              # Protocols & guides
└── .asanmod/          # State & logs
```

---

## ⚡ Core Commands

| Command         | Purpose                    |
| --------------- | -------------------------- |
| `asan verify`   | Full quality check (0/0/0) |
| `asan status`   | System health dashboard    |
| `asan wizard`   | Strategic interview        |
| `npm run dev`   | Start dev server           |
| `npm run build` | Production build           |

---

## 🧠 Philosophy: Ghost-Dev Protocol

This template operates under the **Zero-Question Autonomy** principle:

1. **Strategic Interview:** Agent asks 7 business questions
2. **Autonomous Mapping:** Agent decides all technical details
3. **Sealed Execution:** User receives completed, tested features
4. **0/0/0 Discipline:** Zero Lint, Zero Types, Zero Logs

**Result:** A production-ready SaaS without technical micromanagement.

---

## 📖 Documentation

- `docs/GHOST_DEV_PROTOCOL.md` - Agent operational rules
- `docs/AGENT_QUICK_REF.md` - Quick reference for constraints
- `.cursorrules` - IDE-level enforcement

---

## 🔐 License

MIT (Internal v1.0.0)

**ASANMOD v1.0.0 | Era of Vibe Coding**
before every commit.

- Mobile-first CSS always.
- No `any` types allowed.
