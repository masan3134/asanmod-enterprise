# ASANMOD Quick Reference

> **Single Source of Truth for Agent Operations**

## 🔧 Essential Commands

| Command               | Description                  |
| --------------------- | ---------------------------- |
| `npm run dev`         | Start development server     |
| `npm run build`       | Build for production         |
| `npm run verify`      | Quality check (lint + types) |
| `npm run fix`         | Auto-fix linting issues      |
| `npm run status`      | Show system dashboard        |
| `npm run wizard`      | Run setup wizard             |
| `npm run deploy-prod` | Deploy to production         |
| `npm run seed`        | Load initial data            |

## 🌐 Network Ports

| Service  | Development | Production |
| -------- | ----------- | ---------- |
| Frontend | 3000        | 3002       |
| Backend  | 3001        | 3003       |

**Dev Binding:** `0.0.0.0`
**Prod Binding:** `127.0.0.1` (localhost only)

## 📁 Key Paths

| Purpose      | Path                     |
| ------------ | ------------------------ |
| Pages        | `src/app/`               |
| Components   | `src/components/`        |
| tRPC Routers | `src/server/routers/`    |
| DB Schema    | `src/db/schema/`         |
| Utilities    | `src/lib/`               |
| Scripts      | `scripts/mod-tools/`     |
| State        | `.asanmod/state/`        |
| Config       | `docs/asanmod-core.json` |

## 🛡️ Quality Gates

All commits must pass:

1. **ESLint:** Zero errors
2. **TypeScript:** Zero errors
3. **Console Ban:** No `console.log` in src/
4. **Commit Format:** `ID: TASK-001 | Description`

## 📋 Patterns

### Add a New Page

```
src/app/[page-name]/page.tsx
```

### Add a New tRPC Router

```
src/server/routers/[module].ts
```

Then register in `src/server/routers/_app.ts`

### Add a New DB Table

```
src/db/schema/[table].ts
```

Then run: `npm run db:generate && npm run db:migrate`

## 🚨 Common Errors

| Error                  | Solution                  |
| ---------------------- | ------------------------- |
| "Port already in use"  | `npm run kill-port 3000`  |
| "DB connection failed" | Check `.env` DATABASE_URL |
| "Type error in tRPC"   | Ensure Zod schema matches |

## 📖 Reference Files

- **Config:** [docs/asanmod-core.json](./asanmod-core.json)
- **Patterns:** [docs/PATTERNS.md](./PATTERNS.md)
- **Conventions:** [docs/CONVENTIONS.md](./CONVENTIONS.md)
