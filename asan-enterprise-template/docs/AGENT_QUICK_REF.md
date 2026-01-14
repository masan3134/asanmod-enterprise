# 🚀 AGENT QUICK REFERENCE

> **Single page, all information. Read asanmod-core.json first.**

---

## 🔒 HARD CONSTRAINTS

| Rule                                   | Enforcement         |
| -------------------------------------- | ------------------- |
| Commit format: `type(scope): message` | `.husky/commit-msg` |
| Ports from asanmod-core.json           | Configuration file  |

---

## 🌐 NETWORK (from asanmod-core.json)

| Environment | Frontend | Backend |
| ----------- | -------- | ------- |
| **DEV**     | 3000     | 3001    |
| **PROD**    | 3002     | 3003    |

---

## 🔑 ESSENTIAL COMMANDS

### Development
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run lint           # Run ESLint
npm run fix            # Auto-fix lint issues
```

### Database
```bash
npm run db:generate    # Generate migrations
npm run db:migrate     # Run migrations
npm run db:push        # Push schema (dev only)
npm run seed           # Seed database
npm run create-admin   # Create admin user
npm run backup         # Backup database
npm run restore        # Restore database
```

### Production & Deployment
```bash
npm run verify         # Full quality check (lint+typecheck+build)
npm run deploy-prod    # Safe production deployment
npm run health         # System health check
```

### PM2
```bash
./scripts/mod-tools/pm dev status      # Check dev status
./scripts/mod-tools/pm dev restart     # Restart dev
./scripts/mod-tools/pm prod status     # Check prod status
./scripts/mod-tools/pm prod restart    # Restart prod
./scripts/mod-tools/pm prod logs       # View prod logs
```

---

## 📋 COMMIT FORMAT

```bash
feat(auth): add login validation
fix(api): resolve CORS issue
docs(readme): update installation
```

**Valid types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## 📚 DOCUMENTATION

- `asanmod-core.json` - Core config (READ FIRST)
- `GETTING_STARTED.md` - Complete setup guide
- `GEMINI.md` - Gemini protocol
- `CURSOR.md` - Cursor protocol
- `CLAUDE.md` - Claude protocol

---

*ASANMOD v2.0.1*
