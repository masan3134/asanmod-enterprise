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
```

### Database
```bash
npm run db:generate    # Generate migrations
npm run db:migrate     # Run migrations
npm run db:push        # Push schema (dev only)
npm run seed           # Seed database
npm run create-admin   # Create admin user
```

### PM2
```bash
./scripts/mod-tools/pm dev status
./scripts/mod-tools/pm prod status
```

### Deployment
```bash
npm run deploy         # Deploy to production
```

---

## 📋 COMMIT FORMAT

```bash
feat(auth): add login validation
fix(api): resolve CORS issue
docs(readme): update installation
```

---

## 📚 DOCUMENTATION

- `asanmod-core.json` - Core config (READ FIRST)
- `GEMINI.md` - Gemini protocol
- `CURSOR.md` - Cursor protocol
- `CLAUDE.md` - Claude protocol

---

*ASANMOD v1.1.1*
