# Getting Started with ASANMOD Enterprise Template

> **Complete setup guide for first-time users**

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 20.x or higher
- **PostgreSQL** 14.x or higher
- **npm** or **yarn**
- **Git**

Optional:
- **PM2** (for production deployment)

---

## 🚀 Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repository-url> my-app
cd my-app
```

### 2. Install Dependencies

```bash
npm install
```

This will install ~755 packages including:
- Next.js 15
- React 18.3
- tRPC
- Drizzle ORM
- PostgreSQL driver
- And all dev dependencies

**Expected time**: 1-2 minutes

---

### 3. Setup PostgreSQL Database

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE my_app_dev_db;

# Create user (optional, if not using postgres user)
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE my_app_dev_db TO myuser;

# Exit psql
\q
```

#### Verify Connection

```bash
psql -U postgres -d my_app_dev_db -c "SELECT 1;"
```

Should return:
```
 ?column?
----------
        1
(1 row)
```

---

### 4. Configure Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit .env
nano .env  # or use your preferred editor
```

#### Required Variables

```bash
# Database Connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/my_app_dev_db"

# Authentication
JWT_SECRET="change-this-to-a-random-secret-key"

# Admin User (for create-admin script)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password"
```

#### Generate JWT Secret

```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output to `JWT_SECRET` in `.env`.

---

### 5. Initialize Database Schema

```bash
# Push schema to database
npm run db:push
```

This creates the `users` table and any other defined schemas.

**Expected output:**
```
✓ Database schema pushed successfully
```

#### Verify Schema

```bash
psql -U postgres -d my_app_dev_db -c "\dt"
```

Should show the `users` table.

---

### 6. Create Admin User (Optional)

```bash
npm run create-admin
```

**Expected output:**
```
👤 Creating admin user...
✅ Admin user created successfully!

📝 Admin Credentials:
   Email: admin@example.com
   Password: your-secure-password
```

---

### 7. Seed Database (Optional)

```bash
npm run seed
```

Creates 3 test users:
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `test123`
- Demo: `demo@example.com` / `test123`

---

### 8. Start Development Server

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 15.0.0
- Local:        http://localhost:3000
- Network:      http://192.168.1.x:3000

✓ Ready in 2.3s
```

#### Verify

Open browser to http://localhost:3000

You should see the landing page.

---

## ✅ Verification Checklist

After setup, verify everything works:

### Frontend
- [ ] http://localhost:3000 loads
- [ ] Landing page displays
- [ ] Login page accessible (/login)
- [ ] Register page accessible (/register)

### Database
- [ ] Database created
- [ ] Schema pushed successfully
- [ ] Admin user created (if ran create-admin)
- [ ] Can connect via psql

### Build
- [ ] `npm run build` succeeds (0 errors)
- [ ] `npm run lint` passes (0 errors)

### Scripts
- [ ] `npm run seed` works
- [ ] `npm run create-admin` works

---

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Restart
npm run dev
```

### Database Connection Error

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql

# Verify connection string
psql "postgresql://postgres:password@localhost:5432/my_app_dev_db"
```

### npm install Fails

```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Build Errors

```bash
# Check Node version
node --version  # Should be 20.x or higher

# Update Node if needed
nvm install 20
nvm use 20

# Retry build
npm run build
```

---

## 🎯 Next Steps

### Development

1. **Explore the code**
   - Check `src/app/` for pages
   - Check `src/components/` for components
   - Check `src/server/routers/` for tRPC routers

2. **Read documentation**
   - `docs/AGENT_QUICK_REF.md` - Quick reference
   - `docs/ARCHITECTURE.md` - System architecture
   - `docs/asanmod-core.json` - Core configuration

3. **Start building**
   - Add new pages in `src/app/`
   - Create components in `src/components/`
   - Add tRPC routers in `src/server/routers/`

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

Quick version:

```bash
# Build for production
npm run build

# Start with PM2
./scripts/mod-tools/pm prod start

# Verify
curl http://localhost:3002
```

---

## 🤖 For AI Agents

If you're an AI agent working on this project:

1. **Read first**:
   - `docs/asanmod-core.json` - Configuration
   - `docs/AGENT_QUICK_REF.md` - Commands
   - Your protocol file (`GEMINI.md`, `CURSOR.md`, or `CLAUDE.md`)

2. **Port configuration**:
   - DEV: 3000 (frontend), 3001 (backend)
   - PROD: 3002 (frontend), 3003 (backend)
   - Always read from `asanmod-core.json`

3. **Workflow**:
   - Make changes
   - Run `npm run lint`
   - Run `npm run build` to verify
   - Test locally
   - Commit with conventional format: `type(scope): message`

---

## 📚 Additional Resources

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [MCP_SETUP.md](./MCP_SETUP.md) - MCP server setup
- [AGENT_QUICK_REF.md](./AGENT_QUICK_REF.md) - Quick reference

---

## 🆘 Still Having Issues?

1. Check existing issues in the repository
2. Review troubleshooting section above
3. Ensure all prerequisites are installed
4. Verify environment variables are correct

---

*Last Updated: 2026-01-14*
*Template Version: 2.0*
