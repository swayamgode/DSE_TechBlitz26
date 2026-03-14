import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Real-world apps should hash passwords (e.g. using bcrypt). 
// For this simple prototype, we use plaintext matching for demonstration.
export const register = mutation({
  args: {
    name: v.string(),
    password: v.string(),
    role: v.union(v.literal("patient"), v.literal("doctor"), v.literal("receptionist")),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existingUser) {
      throw new Error("User with this name already exists. Please login.");
    }

    const newUserId = await ctx.db.insert("users", {
      name: args.name,
      password: args.password,
      role: args.role,
    });
    
    return newUserId;
  },
});

export const login = mutation({
  args: {
    name: v.string(),
    password: v.string(),
    role: v.union(v.literal("patient"), v.literal("doctor"), v.literal("receptionist")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.and(
        q.eq(q.field("name"), args.name),
        q.eq(q.field("role"), args.role)
      ))
      .first();

    if (!user) {
      throw new Error("User not found or role mismatch.");
    }

    if (user.password !== args.password) {
      throw new Error("Invalid password.");
    }

    return user._id;
  },
});

export const getUser = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    return await ctx.db.get(args.userId);
  },
});

export const setBreakStatus = mutation({
  args: { 
    userId: v.id("users"),
    wantsBreak: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      wantsBreak: args.wantsBreak,
    });
  },
});

export const getDoctors = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "doctor"))
      .collect();
  },
});
