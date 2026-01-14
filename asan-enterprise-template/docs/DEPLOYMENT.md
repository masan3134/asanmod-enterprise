---
type: documentation
agent_role: ops_engineer
context_depth: 5
required_knowledge: ["pm2", "postgres"]
last_audited: "2026-01-14"
---

# Deployment Guide

## Prerequisites

- Server with Node.js 20+ installed
- PostgreSQL database
- Domain name (optional)
- SSH access to server

## GitHub Secrets Setup

For automated deployment via GitHub Actions, configure these secrets:

**Navigate to**: Repository → Settings → Secrets and variables → Actions

| Secret | Description | Example Value |
|--------|-------------|---------------|
| `DEPLOY_HOST` | Server IP or domain | `123.456.789.0` or `example.com` |
| `DEPLOY_USER` | SSH username | `ubuntu` or `root` |
| `DEPLOY_KEY` | SSH private key | `-----BEGIN RSA PRIVATE KEY-----...` |
| `DATABASE_URL` | Production database URL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Production JWT secret | Generate with `openssl rand -base64 32` |
| `PRODUCTION_URL` | Your production domain | `https://example.com` |

## Manual Deployment

### 1. Build for Production

```bash
npm run build
```

### 2. Deploy to Server

```bash
# Using the deploy script
npm run deploy-prod
```

### 3. Verify Deployment

```bash
# Check server status
ssh user@server "pm2 status"

# Check logs
ssh user@server "pm2 logs app-name"
```

## Environment Variables

Ensure these are set on the production server in `.env.production`:

```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="your-production-secret"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"
```

## Rollback

If deployment fails:

```bash
# SSH into server
ssh user@server

# Revert to previous version
pm2 restart app-name
```

##Monitoring

Check application health:

```bash
curl https://yourdomain.com/api/health
```
