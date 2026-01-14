---
type: reference
agent_role: all
context_depth: 2
required_knowledge: []
last_audited: "2026-01-14"
---

# Coding Conventions

> **Naming and style rules for consistency.**

## 📁 File Naming

| Type       | Convention        | Example                       |
| ---------- | ----------------- | ----------------------------- |
| Pages      | `kebab-case`      | `user-profile/page.tsx`       |
| Components | `PascalCase`      | `UserCard.tsx`                |
| Utilities  | `camelCase`       | `formatDate.ts`               |
| Types      | `PascalCase`      | `types.ts` with `UserProfile` |
| Constants  | `SCREAMING_SNAKE` | `const MAX_RETRIES = 3`       |

## 🏷️ Naming Rules

### Variables & Functions

```typescript
// ✅ Good
const userName = "John";
function getUserById(id: string) {}

// ❌ Bad
const user_name = "John";
function get_user_by_id(id: string) {}
```

### Components

```typescript
// ✅ Good
function UserProfileCard() {}

// ❌ Bad
function userProfileCard() {}
function User_Profile_Card() {}
```

### Types & Interfaces

```typescript
// ✅ Good
interface UserProfile {}
type CreateUserInput = {};

// ❌ Bad
interface IUserProfile {}
type createUserInput = {};
```

## 🌐 API Naming

### Endpoints (tRPC Procedures)

- Use **singular** nouns for resources
- Use **camelCase** for procedure names

```typescript
// ✅ Good
trpc.user.getById.useQuery();
trpc.customer.create.useMutation();

// ❌ Bad
trpc.users.get_by_id.useQuery();
trpc.Customers.Create.useMutation();
```

### Database Tables

- Use **snake_case** for table names
- Use **plural** for table names

```typescript
// ✅ Good
pgTable("users", {});
pgTable("order_items", {});

// ❌ Bad
pgTable("User", {});
pgTable("orderItem", {});
```

## 📝 Code Style

### Imports Order

1. React/Next.js
2. Third-party libraries
3. Internal imports (`@/`)
4. Relative imports (`./`)
5. Types

```typescript
// Example
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { UserCard } from "./UserCard";

import type { User } from "@/types";
```

### Comments

```typescript
// Single line comment for simple notes

/**
 * Multi-line comment for complex explanations
 * or function documentation.
 */

// TODO: Description of pending work
// FIXME: Description of known issue
```

## 🚫 Prohibited

| Rule             | Reason                        |
| ---------------- | ----------------------------- |
| No `any` type    | Use `unknown` or proper types |
| No `console.log` | Use logger or remove          |
| No magic numbers | Use named constants           |
| No inline styles | Use Tailwind classes          |
