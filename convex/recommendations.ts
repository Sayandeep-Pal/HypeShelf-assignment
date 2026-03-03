// convex/recommendations.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper — resolves the Clerk identity + stored role.
// All mutations that require auth call this first, so access-control logic
// is centralised in one place and not duplicated across handlers.
// ─────────────────────────────────────────────────────────────────────────────
async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated: please sign in.");

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();

  // Graceful default: if the row hasn't been written yet treat as "user"
  const role: "admin" | "user" = user?.role ?? "user";
  return { identity, role };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PUBLIC QUERY — returns all recommendations, newest first.
//    No authentication required; safe to call from the public page.
// ─────────────────────────────────────────────────────────────────────────────
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("recommendations").order("desc").collect();
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. PUBLIC QUERY — preview: only the 5 latest picks for the landing page.
// ─────────────────────────────────────────────────────────────────────────────
export const getPublicLatest = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("recommendations").order("desc").take(5);
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. AUTHENTICATED MUTATION — add a recommendation.
//    Any signed-in user may call this.
// ─────────────────────────────────────────────────────────────────────────────
export const add = mutation({
  args: {
    title: v.string(),
    genre: v.string(),
    link: v.string(),
    blurb: v.string(),
  },
  handler: async (ctx, args) => {
    const { identity } = await requireAuth(ctx);

    await ctx.db.insert("recommendations", {
      title: args.title,
      genre: args.genre,
      link: args.link,
      blurb: args.blurb,
      authorId: identity.subject,       // Clerk user ID — stable, non-guessable
      authorName: identity.name ?? "Anonymous",
      isStaffPick: false,
    });
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. RBAC MUTATION — delete a recommendation.
//    • admin  → may delete any recommendation
//    • user   → may only delete their own
// ─────────────────────────────────────────────────────────────────────────────
export const remove = mutation({
  args: { id: v.id("recommendations") },
  handler: async (ctx, args) => {
    const { identity, role } = await requireAuth(ctx);
    const rec = await ctx.db.get(args.id);
    if (!rec) throw new Error("Recommendation not found.");

    const isOwner = rec.authorId === identity.subject;
    if (role !== "admin" && !isOwner) {
      throw new Error("Unauthorized: you can only delete your own recommendations.");
    }

    await ctx.db.delete(args.id);
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. RBAC MUTATION — toggle "Staff Pick" badge.
//    Exclusively for admins.
// ─────────────────────────────────────────────────────────────────────────────
export const toggleStaffPick = mutation({
  args: { id: v.id("recommendations"), isStaffPick: v.boolean() },
  handler: async (ctx, args) => {
    const { role } = await requireAuth(ctx);
    if (role !== "admin") {
      throw new Error("Unauthorized: only admins can manage staff picks.");
    }
    await ctx.db.patch(args.id, { isStaffPick: args.isStaffPick });
  },
});