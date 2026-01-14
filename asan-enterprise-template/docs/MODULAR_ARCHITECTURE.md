---
type: reference
agent_role: architect
context_depth: 4
required_knowledge: ["architecture"]
last_audited: "2026-01-14"
---

# 🏗️ Modular Architecture - Implementation Guide

## ✅ Structure Implemented

The template now follows a **fully modular, feature-based architecture**:

```
src/
├── modules/
│   ├── users/
│   │   ├── schema.ts      ✅ User tables
│   │   ├── router.ts      ✅ CRUD operations
│   │   ├── types.ts       ✅ Zod validators
│   │   ├── components/    ✅ Ready for UI
│   │   └── lib/           ✅ Module utilities
│   │
│   └── posts/
│       ├── schema.ts      ✅ Post tables
│       ├── router.ts      ✅ CRUD operations
│       ├── types.ts       ✅ Zod validators
│       ├── components/    ✅ Ready for UI
│       └── lib/           ✅ Module utilities
│
├── db/
│   ├── index.ts           ✅ Drizzle client
│   └── schema.ts          ✅ AUTO-MERGE (exports all modules)
│
└── server/
    ├── trpc.ts            ✅ tRPC setup
    └── index.ts           ✅ AUTO-MERGE (merges all routers)
```

## 📦 Module Features

Each module now includes:

### Users Module

- ✅ Full CRUD: `list`, `getById`, `create`, `update`, `delete`
- ✅ Zod validation for all inputs
- ✅ TypeScript types auto-inferred from Drizzle
- ✅ Relation to Posts module

### Posts Module

- ✅ Full CRUD: `list`, `getById`, `getByAuthor`, `create`, `update`, `delete`
- ✅ Foreign key to Users
- ✅ Zod validation
- ✅ Complete type safety

## 🔗 Auto-Merge Files

### `src/db/schema.ts`

Auto-exports all module schemas. When wizard adds a new module, it appends:

```typescript
export * from "../modules/[new-module]/schema";
```

### `src/server/index.ts`

Auto-merges all routers. When wizard adds a new module, it:

1. Imports the router
2. Adds it to `appRouter`
3. Updates the modules list in health check

## 🚀 Adding New Modules

### Manual (For Now)

1. Create directory: `src/modules/[name]/`
2. Add files: `schema.ts`, `router.ts`, `types.ts`
3. Update `src/db/schema.ts`: Add export line
4. Update `src/server/index.ts`: Import and merge router

### Automated (After Wizard Update)

```bash
asan wizard
# Answer: "What modules?" → "Billing"
# Agent automatically creates complete Billing module
```

## 📊 Benefits Achieved

✅ **Isolation**: Each module is self-contained
✅ **Scalability**: Add 100+ modules without complexity
✅ **Type Safety**: End-to-end from DB to API
✅ **Auto-Merge**: No manual router configuration
✅ **Ghost-Dev Ready**: Wizard can generate modules autonomously

---

**Next Step**: Update `asan-wizard.js` to generate modules from strategic interview answers.
