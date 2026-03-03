// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Table for the recommendations
  recommendations: defineTable({
    title: v.string(),
    genre: v.string(), 
    link: v.string(),
    blurb: v.string(),
    authorId: v.string(), // Clerk user ID to link the author
    authorName: v.string(), 
    isStaffPick: v.optional(v.boolean()), // Admins can toggle this
  }).index("by_genre", ["genre"]), // Index for easy filtering by type

  // Table to handle roles and RBAC securely
  users: defineTable({
    tokenIdentifier: v.string(), // Clerk's unique identifier
    role: v.union(v.literal("admin"), v.literal("user")),
  }).index("by_token", ["tokenIdentifier"]),
});