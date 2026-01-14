---
type: reference
agent_role: qa_engineer
context_depth: 3
required_knowledge: ["jest"]
last_audited: "2026-01-14"
---

# Testing Guide

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Writing Tests

### Unit Tests

```typescript
// __tests__/utils.test.ts
import { formatDate } from "@/lib/utils";

describe("formatDate", () => {
  it("should format date correctly", () => {
    const date = new Date("2024-01-15");
    const result = formatDate(date);
    expect(result).toContain("2024");
  });
});
```

### Testing tRPC Procedures

```typescript
// __tests__/routers/user.test.ts
import { createContext } from "@/server/trpc";
import { appRouter } from "@/server/routers/_app";

describe("User Router", () => {
  it("should create user", async () => {
    const ctx = await createContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.user.create({
      email: "test@example.com",
      name: "Test User",
    });

    expect(user.email).toBe("test@example.com");
  });
});
```

### Testing Components

```tsx
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("should render children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByText("Click me"));
    expect(onClick).toHaveBeenCalled();
  });
});
```

## Test Fixtures

Create reusable test data in `__tests__/fixtures/`:

```typescript
// __tests__/fixtures/users.ts
export const testUser = {
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  role: "user",
};

export const adminUser = {
  id: "admin-user-id",
  email: "admin@example.com",
  name: "Admin User",
  role: "admin",
};
```

## Mocking

### Mock Database

```typescript
jest.mock("@/db", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue([testUser]),
  },
}));
```

### Mock External Services

```typescript
jest.mock("@/lib/email", () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
}));
```

## Coverage Requirements

Aim for:
- **Statements**: 80%
- **Branches**: 70%
- **Functions**: 80%
- **Lines**: 80%
