---
type: reference
agent_role: all
context_depth: 3
required_knowledge: ["conventions"]
last_audited: "2026-01-14"
---

# Coding Patterns

> **Standard patterns for implementing features in this project.**

## 📄 Adding a New Page

### 1. Create the Page File

```tsx
// src/app/[page-name]/page.tsx
import { PageHeader } from "@/components/layout/PageHeader";

export default function PageName() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader title="Page Title" />
      {/* Page content */}
    </div>
  );
}
```

### 2. Add to Navigation (if needed)

Update `src/components/layout/Sidebar.tsx`

---

## 🔌 Adding a New tRPC Router

### 1. Create the Router

```typescript
// src/server/routers/example.ts
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const exampleRouter = router({
  // Public endpoint
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(examples);
  }),

  // Protected endpoint (requires auth)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(examples).values(input);
    }),
});
```

### 2. Register in App Router

```typescript
// src/server/routers/_app.ts
import { exampleRouter } from "./example";

export const appRouter = router({
  example: exampleRouter,
  // ... other routers
});
```

---

## 🗃️ Adding a New DB Table

### 1. Create Schema

```typescript
// src/db/schema/example.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const examples = pgTable("examples", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type inference
export type Example = typeof examples.$inferSelect;
export type NewExample = typeof examples.$inferInsert;
```

### 2. Export from Index

```typescript
// src/db/schema/index.ts
export * from "./example";
```

### 3. Run Migration

```bash
npm run db:generate
npm run db:migrate
```

---

## 🎨 Adding a New Component

### 1. Create Component

```tsx
// src/components/[ComponentName].tsx
"use client";

import { cn } from "@/lib/utils";

interface ComponentNameProps {
  className?: string;
  children?: React.ReactNode;
}

export function ComponentName({ className, children }: ComponentNameProps) {
  return <div className={cn("base-styles", className)}>{children}</div>;
}
```

### 2. Export (optional)

Add to `src/components/index.ts` if shared widely.

---

## 📝 Form Pattern (Zod + React Hook Form)

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    // Handle submission
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>{/* Form fields */}</form>
  );
}
```

---

## 🔄 API Call Pattern (Client Component)

```tsx
"use client";

import { trpc } from "@/lib/trpc";

export function ExampleList() {
  const { data, isLoading, error } = trpc.example.getAll.useQuery();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <ul>
      {data?.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```
