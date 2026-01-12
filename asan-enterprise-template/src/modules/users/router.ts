import { router, publicProcedure } from "@/server/trpc";
import { db } from "@/db";
import { users } from "./schema";
import { createUserSchema, updateUserSchema } from "./types";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const usersRouter = router({
  list: publicProcedure
    .query(async () => {
      return db.select().from(users);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const result = await db.select().from(users).where(eq(users.id, input.id));
      return result[0];
    }),

  create: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ input }) => {
      const result = await db.insert(users).values(input).returning();
      return result[0];
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: updateUserSchema,
    }))
    .mutation(async ({ input }) => {
      const result = await db
        .update(users)
        .set(input.data)
        .where(eq(users.id, input.id))
        .returning();
      return result[0];
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await db.delete(users).where(eq(users.id, input.id));
      return { success: true };
    }),
});
