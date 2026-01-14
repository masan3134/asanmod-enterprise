---
type: reference
agent_role: ops_engineer
context_depth: 3
required_knowledge: []
last_audited: "2026-01-14"
---

# Troubleshooting Guide

## Common Issues

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use killall
npx kill-port 3000
```

---

### Database Connection Failed

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solutions:**

1. **PostgreSQL not running:**
   ```bash
   # Start PostgreSQL
   sudo systemctl start postgresql

   # Or on macOS
   brew services start postgresql
   ```

2. **Wrong DATABASE_URL:**
   - Check `.env` file
   - Verify host, port, username, password, database name

3. **Database doesn't exist:**
   ```bash
   createdb your_db_name
   ```

---

### Type Errors After Update

**Problem:** TypeScript errors after pulling changes

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Drizzle types
npm run db:generate
```

---

### Migrations Not Applied

**Problem:** Schema changes not reflected in database

**Solution:**
```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate

# If stuck, check migrations folder
ls drizzle/
```

---

### Build Fails

**Problem:** `npm run build` fails

**Common causes:**

1. **TypeScript errors:**
   ```bash
   npm run lint
   npx tsc --noEmit
   ```

2. **Missing environment variables:**
   - Check `.env` has all required vars
   - Compare with `.env.example`

3. **Dependency issues:**
   ```bash
   npm ci
   ```

---

### PM2 Issues

**Problem:** PM2 not starting/restarting

**Solutions:**

1. **Check logs:**
   ```bash
   pm2 logs
   pm2 logs backend --lines 50
   ```

2. **Restart PM2:**
   ```bash
   pm2 delete all
   pm2 start ecosystem.config.js
   ```

3. **Check ecosystem config:**
   - Verify paths
   - Verify environment variables

---

### Nginx 502 Bad Gateway

**Problem:** Nginx returns 502 error

**Solutions:**

1. **Check backend is running:**
   ```bash
   curl localhost:3001
   pm2 status
   ```

2. **Check Nginx config:**
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

3. **Check logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

---

### "Module not found" Errors

**Problem:** Import errors for `@/...` paths

**Solution:**
- Check `tsconfig.json` has correct paths
- Restart dev server
- Restart IDE

---

### Hot Reload Not Working

**Problem:** Changes not reflected during development

**Solutions:**

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Check file watchers limit (Linux):**
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

---

## Getting Help

1. Check this guide first
2. Search [GitHub Issues](https://github.com/masan3134/asanmod-enterprise/issues)
3. Check logs: `.asanmod/logs/`
4. Ask in team chat with:
   - Error message
   - Steps to reproduce
   - Logs
