import { z } from "zod";
import { posts } from "./schema";

// Zod Validators
export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  authorId: z.string().uuid("Invalid author ID"),
});

export const updatePostSchema = createPostSchema.partial().omit({ authorId: true });

// TypeScript Types
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
