import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import superjson from "superjson";
import { db } from "@/db";

/**
 * Create context for tRPC requests
 * This runs for every request and provides context to all procedures
 */
export const createContext = async () => {
  return {
    db,
    // Add user session here when auth is implemented
    // user: await getUser(req),
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

/**
 * Initialize tRPC with context and superjson transformer
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 * Throws UNAUTHORIZED if no user in context
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  // TODO: Implement actual auth check
  // For now, this is a placeholder that always allows access
  // Replace with: if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

  return next({
    ctx: {
      ...ctx,
      // user: ctx.user, // Guaranteed to be set
    },
  });
});
