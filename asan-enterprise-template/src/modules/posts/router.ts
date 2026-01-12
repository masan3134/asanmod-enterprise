import { router, publicProcedure } from "@/server/trpc";
import { db } from "@/db";
import { posts } from "./schema";
import { createPostSchema, updatePostSchema } from "./types";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const postsRouter = router({
  list: publicProcedure
    .query(async () => {
      return db.select().from(posts);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const result = await db.select().from(posts).where(eq(posts.id, input.id));
      return result[0];
    }),

  getByAuthor: publicProcedure
    .input(z.object({ authorId: z.string().uuid() }))
    .query(async ({ input }) => {
      return db.select().from(posts).where(eq(posts.authorId, input.authorId));
    }),

  create: publicProcedure
    .input(createPostSchema)
    .mutation(async ({ input }) => {
      const result = await db.insert(posts).values(input).returning();
      return result[0];
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: updatePostSchema,
    }))
    .mutation(async ({ input }) => {
      const result = await db
        .update(posts)
        .set(input.data)
        .where(eq(posts.id, input.id))
        .returning();
      return result[0];
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await db.delete(posts).where(eq(posts.id, input.id));
      return { success: true };
    }),
});
