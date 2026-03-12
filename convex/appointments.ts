import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const bookSlot = mutation({
  args: {
    userId: v.id("users"),
    slotId: v.id("slots"),
    type: v.union(v.literal("regular"), v.literal("priority")),
  },
  handler: async (ctx, args) => {
    // Check if slot exists
    const slot = await ctx.db.get(args.slotId);
    if (!slot) throw new Error("Slot not found");

    // Get all appointments for this slot
    const appointmentsForSlot = await ctx.db
      .query("appointments")
      .filter((q) => q.eq(q.field("slotId"), args.slotId))
      .collect();

    // Calculate current bookings
    const regularCount = appointmentsForSlot.filter(a => a.type === "regular" && a.status !== "cancelled").length;
    const priorityCount = appointmentsForSlot.filter(a => a.type === "priority" && a.status !== "cancelled").length;

    // Reject if full
    if (args.type === "regular" && regularCount >= slot.regularSlots) {
      throw new Error("No regular slots available for this time.");
    }
    if (args.type === "priority" && priorityCount >= slot.prioritySlots) {
      throw new Error("No priority slots available for this time.");
    }

    // Check if user already has an active booking for this slot
    const alreadyBooked = appointmentsForSlot.find(a => a.userId === args.userId && a.status !== "cancelled");
    if (alreadyBooked) {
      throw new Error("You already have a booking for this time slot.");
    }

    // Insert the appointment
    const appointmentId = await ctx.db.insert("appointments", {
      userId: args.userId,
      slotId: args.slotId,
      type: args.type,
      checkedIn: false,
      status: "scheduled",
    });

    return appointmentId;
  }
});

// Query to get appointments for a specific user
export const getUserAppointments = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    
    return await ctx.db
      .query("appointments")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  }
});
