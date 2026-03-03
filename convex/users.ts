// convex/users.ts
import { mutation, query } from "./_generated/server";

/**
 * Upserts the authenticated user into our `users` table.
 * Called once on the client immediately after sign-in.
 * New users always get the "user" role; the "admin" role must be
 * assigned manually via the Convex dashboard (or a seed script).
 */
export const upsertUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!existing) {
      await ctx.db.insert("users", {
        tokenIdentifier: identity.tokenIdentifier,
        role: "user",
      });
    }

    // Return the role so callers can use it immediately
    return existing?.role ?? "user";
  },
});

/**
 * Returns the role ("admin" | "user") for the currently signed-in user,
 * or null if the caller is unauthenticated.
 */
export const getCurrentUserRole = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    // Gracefully default to "user" if no record yet (race condition on first sign-in)
    return (user?.role ?? "user") as "admin" | "user";
  },
});
