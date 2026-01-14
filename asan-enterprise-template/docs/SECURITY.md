---
type: reference
agent_role: security_specialist
context_depth: 4
required_knowledge: ["jwt", "auth"]
last_audited: "2026-01-14"
---

# Security Guidelines

## Authentication

### Password Hashing
```typescript
import bcrypt from "bcryptjs";

// Hash password
const hash = await bcrypt.hash(password, 12);

// Verify password
const isValid = await bcrypt.compare(password, hash);
```

### JWT Tokens
```typescript
import jwt from "jsonwebtoken";

// Create token
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: "7d" }
);

// Verify token
const payload = jwt.verify(token, process.env.JWT_SECRET!);
```

## Input Validation

**ALWAYS validate inputs with Zod:**

```typescript
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

// In tRPC procedure
.input(createUserSchema)
.mutation(async ({ input }) => {
  // input is typed and validated
});
```

## SQL Injection Prevention

Drizzle ORM protects against SQL injection by default:

```typescript
// ✅ Safe - parameterized query
const user = await db.select().from(users).where(eq(users.id, input.id));

// ❌ Never do this
// db.execute(sql`SELECT * FROM users WHERE id = ${input.id}`);
```

## XSS Prevention

React escapes by default. Avoid:

```tsx
// ❌ Dangerous
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Safe
<div>{userInput}</div>
```

## CORS Configuration

In `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://your-domain.com" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE" },
        ],
      },
    ];
  },
};
```

## Security Headers

Add to Nginx or middleware:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## Environment Variables

**Never commit secrets:**

```bash
# .env (in .gitignore)
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

## Role-Based Access Control

Use auth middleware:

```typescript
import { requireRole } from "@/server/middleware/auth";

export const adminRouter = router({
  deleteUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      requireRole(ctx.user, "admin");
      // Only admins can reach here
    }),
});
```

## Rate Limiting

Implement in middleware or Nginx:

```
# Nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
location /api {
    limit_req zone=api burst=20 nodelay;
}
```
