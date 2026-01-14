---
type: documentation
agent_role: all
context_depth: 5
required_knowledge: ["asanmod_core"]
last_audited: "2026-01-14"
---

# Getting Started with ASANMOD Enterprise Template

> **Complete setup guide for first-time users AND agents**

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 20.x or higher
- **PostgreSQL** 14.x or higher
- **npm** or **yarn**
- **Git** (REQUIRED)

Optional:
- **PM2** (for production deployment)

---

## 🚨 IMPORTANT: Git Repository Setup

**This template MUST be in a Git repository.**

### If Cloning from GitHub (Recommended)
```bash
git clone https://github.com/masan3134/asanmod-enterprise.git my-app
cd my-app/asan-enterprise-template
```

### If Starting Fresh
```bash
# Create your project directory
mkdir my-app
cd my-app

# Initialize Git FIRST
git init
git branch -M main

# Copy template files here
# ... then continue with setup
```

**Why Git is mandatory:**
- Husky hooks enforce code quality
- Commit format validation
- Version control for all changes

---

## 🚀 Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will:
- Install ~755 packages
- **Automatically setup Husky hooks** (via `prepare` script)

**Expected time**: 1-2 minutes

**Verify Husky installed:**
```bash
ls -la .husky/
# Should show: commit-msg, pre-commit
```

---

### 2. Setup PostgreSQL Database

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE my_app_dev_db;

# Create user (optional)
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE my_app_dev_db TO myuser;

# Exit
\q
```

#### Verify Connection

```bash
psql -U postgres -d my_app_dev_db -c "SELECT 1;"
```

---

### 3. Configure Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit .env
nano .env
```

#### Required Variables

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/my_app_dev_db"

# JWT Secret (GENERATE NEW!)
JWT_SECRET="change-this-to-a-random-secret-key"

# Admin User
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password"
```

#### Generate Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy output to `JWT_SECRET` in `.env`.

---

### 4. Initialize Database Schema

```bash
npm run db:push
```

**Expected output:**
```
✓ Database schema pushed successfully
```

---

### 5. Create Admin User (Optional)

```bash
npm run create-admin
```

---

### 6. Seed Database (Optional)

```bash
npm run seed
```

Creates 3 test users for development.

---

### 7. Start Development Server

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 15.0.0
- Local:        http://localhost:3000

✓ Ready in 2.3s
```

Open browser to **http://localhost:3000**

---

## 🔒 Git & Code Quality Setup

### Husky Hooks (Auto-installed)

After `npm install`, two hooks are active:

**1. Pre-commit Hook** (`.husky/pre-commit`)
- Runs `npm run lint` on changed files
- Blocks commit if linting fails
- Ensures code quality

**2. Commit Message Hook** (`.husky/commit-msg`)
- Enforces conventional commit format
- **Format**: `type(scope): message`

### Commit Format Rules

**Valid commit types:**
```
feat     - New feature
fix      - Bug fix
docs     - Documentation changes
style    - Code style (formatting, etc.)
refactor - Code refactoring
test     - Adding tests
chore    - Maintenance tasks
```

**Examples:**
```bash
✅ git commit -m "feat(auth): add login validation"
✅ git commit -m "fix(api): resolve CORS issue"
✅ git commit -m "docs(readme): update installation steps"

❌ git commit -m "updated stuff"         # Missing type
❌ git commit -m "WIP feature"           # Not conventional
```

### Testing Hooks

```bash
# Test pre-commit
git add .
git commit -m "test: verifying hooks"
# Should run lint automatically

# If lint fails, commit is blocked
# Fix issues, then retry
```

---

## 🚀 PM2 Production Setup

### Install PM2 Globally

```bash
npm install -g pm2

# Verify installation
pm2 --version
```

### Dev/Prod Port Isolation

**CRITICAL: Dev and Prod run on DIFFERENT ports**

| Environment | Frontend | Backend |
|-------------|----------|---------|
| **Development** | 3000 | 3001 |
| **Production** | 3002 | 3003 |

**Why?**
- Both can run simultaneously
- No port conflicts
- Complete isolation

### Start Production

```bash
# Build
npm run build

# Start with PM2
./scripts/mod-tools/pm prod start

# Verify
curl http://localhost:3002
# Should return 200 OK
```

### PM2 Commands (via Wrapper)

```bash
# Development
./scripts/mod-tools/pm dev status
./scripts/mod-tools/pm dev restart
./scripts/mod-tools/pm dev logs

# Production
./scripts/mod-tools/pm prod status
./scripts/mod-tools/pm prod restart
./scripts/mod-tools/pm prod logs
```

**Never use `pm2` directly! Always use the wrapper.**

### PM2 Configuration

Configuration is in `ecosystem.config.cjs`:
- Dev: Fork mode with watch/hot-reload
- Prod: Cluster mode for performance

---

## ✅ Verification Checklist

### Infrastructure
- [ ] Git repository initialized
- [ ] Husky hooks installed (`.husky/` exists)
- [ ] Can make commits (hooks work)
- [ ] PM2 installed globally (optional)

### Frontend
- [ ] http://localhost:3000 loads
- [ ] Landing page displays
- [ ] Login/Register accessible

### Database
- [ ] Database created
- [ ] Schema pushed
- [ ] Can connect via psql

### Build
- [ ] `npm run build` succeeds (0 errors)
- [ ] `npm run lint` passes

### Git Workflow
- [ ] Commits follow conventional format
- [ ] Pre-commit hook runs lint
- [ ] Can push to remote

---

## 🤖 For AI Agents

### First-Time Setup Sequence

1. **Read protocol**: `GEMINI.md` or `CURSOR.md` or `CLAUDE.md`
2. **Run wizard**: `npm run wizard` (MANDATORY)
3. **Read this guide**: Complete all steps above
4. **Read configuration**: `docs/asanmod-core.json`
5. **Read commands**: `docs/AGENT_QUICK_REF.md`

### Critical Rules

- **ALWAYS** commit with conventional format
- **ALWAYS** run `npm run lint` before push
- **NEVER** use `pm2` directly (use `./scripts/mod-tools/pm`)
- **NEVER** hardcode ports (read from `asanmod-core.json`)
- **NEVER** touch production on port 3002 (dev only)

### Port Configuration

**Dev Environment** (for development):
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

**Prod Environment** (for production):
- Frontend: `http://localhost:3002`
- Backend: `http://localhost:3003`

Always start on DEV ports unless deploying.

---

## 🔧 Troubleshooting

### Husky Hooks Not Working

```bash
# Reinstall hooks
npm run prepare

# Verify
ls -la .husky/
# Should show commit-msg and pre-commit
```

### Commit Blocked

```bash
# Check what's wrong
npm run lint

# Fix issues
npm run fix

# Retry commit
git commit -m "fix(scope): message"
```

### PM2 Command Not Found

```bash
# Install PM2 globally
npm install -g pm2

# Or use npx
npx pm2 status
```

### Port Already in Use

```bash
# Find process
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)

# Restart
npm run dev
```

---

## 🎯 Next Steps

### Development Workflow

1. Make changes to code
2. Test locally (`npm run dev`)
3. Run lint (`npm run lint`)
4. Commit with conventional format
5. Push to remote

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete guide.

Quick version:
```bash
npm run build
./scripts/mod-tools/pm prod start
curl http://localhost:3002  # Verify
```

---

## 📚 Additional Resources

- [AGENT_QUICK_REF.md](./AGENT_QUICK_REF.md) - All commands
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [MCP_SETUP.md](./MCP_SETUP.md) - MCP server setup
- [asanmod-core.json](./asanmod-core.json) - Core configuration

---

*Last Updated: 2026-01-14*
*Template Version: 2.1.0-alpha*
