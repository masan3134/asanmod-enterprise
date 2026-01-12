/**
 * AUTO-GENERATED DATABASE SCHEMA
 *
 * This file exports all module schemas and defines their relations.
 * Relations are centralized here to avoid circular dependencies.
 */

// Table Exports
export * from "../modules/users/schema";
export * from "../modules/posts/schema";

// Centralized Relations
import { relations } from "drizzle-orm";
import { users } from "../modules/users/schema";
import { posts } from "../modules/posts/schema";

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
