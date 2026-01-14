# Folder Structure Guidelines

> **For Agents**: Best practices for organizing ASANMOD project files as it scales

---

## 📂 Router Organization

### Current (Small Projects - OK for <10 routes):
```
src/server/routers/
├── _app.ts
├── auth.ts
├── items.ts
└── users.ts
```

### Recommended (Growing Projects - 10+ routes):
```
src/server/routers/
├── _app.ts
├── auth/
│   ├── index.ts       # Export aggregated router
│   ├── login.ts
│   ├── register.ts
│   └── oauth.ts
├── users/
│   ├── index.ts
│   ├── profile.ts
│   └── settings.ts
└── items/
    ├── index.ts
    ├── crud.ts
    └── categories.ts
```

### Rules:
1. **Domain-based folders**: Group related endpoints (auth, users, items, admin)
2. **index.ts exports**: Aggregate domain routers
3. **Max 200 lines**: Split files when they exceed 200 lines
4. **Related together**: Keep domain logic in domain folder

### Example:
```typescript
// src/server/routers/items/index.ts
import { router } from '@/server/trpc';
import { crudRouter } from './crud';
import { categoriesRouter } from './categories';

export const itemsRouter = router({
  ...crudRouter,
  categories: categoriesRouter,
});
```

```typescript
// src/server/routers/items/crud.ts
import { router, protectedProcedure } from '@/server/trpc';
import { z } from 'zod';

export const crudRouter = {
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.items.findMany();
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(items).values(input);
    }),
};
```


---

## 📚 Lib Organization

### Current (Small Projects):
```
src/lib/
├── auth.ts
├── utils.ts
└── validation.ts
```

### Recommended (30+ utilities):
```
src/lib/
├── auth/
│   ├── jwt.ts
│   ├── password.ts
│   └── session.ts
├── validation/
│   ├── schemas.ts
│   └── custom-validators.ts
├── formatters/
│   ├── date.ts
│   ├── currency.ts
│   └── phone.ts
└── integrations/
    ├── email.ts
    ├── sms.ts
    └── payments.ts
```

---

## 🎯 When to Reorganize

**Trigger Points**:
- 10+ router files → Domain folders
- 30+ lib utilities → Category folders
- File >200 lines → Split into smaller files
- Related code scattered → Group by domain

---

**Link**: See [AGENT_QUICK_REF.md](./AGENT_QUICK_REF.md) for all commands
