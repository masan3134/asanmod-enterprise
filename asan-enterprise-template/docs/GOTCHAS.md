---
type: reference
agent_role: all
context_depth: 2
required_knowledge: []
last_audited: "2026-01-14"
---

# Known Gotchas

> **Common pitfalls and their solutions.**

## 🔴 tRPC

### "Cannot find procedure"

**Cause:** Router not registered in `_app.ts`
**Solution:**

```typescript
// src/server/routers/_app.ts
import { newRouter } from "./new-router";
export const appRouter = router({
  new: newRouter, // <- Add this
});
```

### "Input validation failed"

**Cause:** Zod schema doesn't match input
**Solution:** Check your `z.object()` matches the data being sent

---

## 🔴 Drizzle ORM

### "Relation already exists"

**Cause:** Migration naming conflict
**Solution:**

1. Delete migration file in `drizzle/`
2. Run `npm run db:generate` again

### "Column does not exist"

**Cause:** Schema changed but migration not run
**Solution:**

```bash
npm run db:generate
npm run db:migrate
```

---

## 🔴 Next.js

### "Hydration mismatch"

**Cause:** Server and client render differently
**Solution:** Wrap client-only code:

```tsx
"use client";
import { useEffect, useState } from "react";

function ClientOnly({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return children;
}
```

### "Window is not defined"

**Cause:** Using browser APIs in server component
**Solution:** Add `"use client"` directive or use dynamic import:

```tsx
const Component = dynamic(() => import("./Component"), { ssr: false });
```

---

## 🔴 TypeScript

### "Type 'X' is not assignable to type 'Y'"

**Cause:** Type mismatch
**Solution:** Check your types match. Use explicit typing:

```typescript
const data: ExpectedType = await fetch();
```

### "Cannot find module '@/...'"

**Cause:** Path alias not configured
**Solution:** Check `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 🔴 Git Hooks

### "Commit rejected: format invalid"

**Cause:** Commit message doesn't match pattern
**Solution:** Use format: `ID: TASK-001 | Description`

### "Pre-commit failed: console.log found"

**Cause:** `console.log` in source code
**Solution:** Remove console.log or use proper logger

---

## 🔴 Development

### "Port already in use"

**Solution:**

```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>

# Or use killall
npx kill-port 3000
```

### "ECONNREFUSED ::1:5432"

**Cause:** PostgreSQL not running or IPv6 issue
**Solution:**

1. Start PostgreSQL: `sudo systemctl start postgresql`
2. Or change host in `.env` to `127.0.0.1` instead of `localhost`
