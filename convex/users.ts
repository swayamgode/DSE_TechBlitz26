import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const loginOrCreate = mutation({
  args: {
    name: v.string(),
    role: v.union(v.literal("patient"), v.literal("doctor"), v.literal("receptionist")),
  },
  handler: async (ctx, args) => {
    // Basic search to see if "user" already exists
    // (This is a simplified mock-auth approach for your developer testing)
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.and(
        q.eq(q.field("name"), args.name),
        q.eq(q.field("role"), args.role)
      ))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    // Otherwise, create a new user in the DB
    const newUserId = await ctx.db.insert("users", {
      name: args.name,
      role: args.role,
    });
    
    return newUserId;
  },
});

export const getUser = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    return await ctx.db.get(args.userId);
  },
});
