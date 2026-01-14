---
type: task_list
agent_role: ops_engineer
context_depth: 4
required_knowledge: ["deployment"]
last_audited: "2026-01-14"
---

# Deployment Checklist

> **Before deploying to production, verify all items below.**

## 🔴 Pre-Deployment (CRITICAL)

- [ ] All tests passing (`npm run test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Verify passes (`npm run verify`)
- [ ] No console.log in production code
- [ ] Environment variables set in `.env.prod`
- [ ] Database migrations applied
- [ ] Secrets rotated (if needed)

## 🟡 Configuration

- [ ] `DATABASE_URL` points to production database
- [ ] `NODE_ENV=production`
- [ ] API URLs updated to production endpoints
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled

## 🛡️ Security

- [ ] All secrets in environment variables (not code)
- [ ] HTTPS enforced
- [ ] Security headers configured in Nginx
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified

## 🌐 Infrastructure

- [ ] PM2 ecosystem config updated
- [ ] Nginx configuration verified
- [ ] SSL certificate installed and valid
- [ ] Domain DNS configured
- [ ] Backup strategy in place

## 📊 Monitoring

- [ ] Error tracking configured (optional)
- [ ] Health check endpoint responding
- [ ] Logs accessible
- [ ] Alerts configured (optional)

## 🚀 Deployment Steps

1. **Backup current deployment**
   ```bash
   npm run backup
   ```

2. **Pull latest code**
   ```bash
   git pull origin main
   ```

3. **Install dependencies**
   ```bash
   npm ci --production
   ```

4. **Run migrations**
   ```bash
   npm run db:migrate
   ```

5. **Build application**
   ```bash
   npm run build
   ```

6. **Deploy with script**
   ```bash
   npm run deploy-prod
   ```

7. **Verify deployment**
   ```bash
   curl -I https://your-domain.com
   npm run health
   ```

## 🔄 Rollback Plan

If issues occur:

```bash
# Restore from backup
npm run restore

# Rollback to previous version
git checkout HEAD~1
npm run deploy-prod
```

---

*Last updated: [DATE]*
