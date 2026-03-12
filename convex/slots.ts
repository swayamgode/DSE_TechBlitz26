import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSlots = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("slots").collect();
  },
});

// Query to compute available capacity for the slots
export const getSlotsWithAvailability = query({
  args: {},
  handler: async (ctx) => {
    const slots = await ctx.db.query("slots").collect();
    const appointments = await ctx.db.query("appointments").collect();
    
    return slots.map(slot => {
      // Find non-cancelled appointments for this slot
      const slotAppointments = appointments.filter(a => a.slotId === slot._id && a.status !== "cancelled");
      
      const regularCount = slotAppointments.filter(a => a.type === "regular").length;
      const priorityCount = slotAppointments.filter(a => a.type === "priority").length;
      
      return {
        ...slot,
        totalAppointments: slotAppointments.length,
        availableRegular: Math.max(0, slot.regularSlots - regularCount),
        availablePriority: Math.max(0, slot.prioritySlots - priorityCount),
      };
    });
  },
});

// Allow Receptionist to manually create slots
export const createSlot = mutation({
  args: {
    startTime: v.string(), // e.g. "09:00 AM"
    endTime: v.string(),   // e.g. "10:00 AM"
    regularSlots: v.number(),
    prioritySlots: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("slots", {
      startTime: args.startTime,
      endTime: args.endTime,
      regularSlots: args.regularSlots,
      prioritySlots: args.prioritySlots,
    });
  },
});

export const initializeSlots = mutation({
  args: {},
  handler: async (ctx) => {
    // Only initialize if slots table is empty
    const existingSlots = await ctx.db.query("slots").collect();
    if (existingSlots.length > 0) {
      return "Slots already initialized";
    }

    const defaultSlots = [
      { start: "09:00 AM", end: "10:00 AM" },
      { start: "10:00 AM", end: "11:00 AM" },
      { start: "11:00 AM", end: "12:00 PM" },
      { start: "12:00 PM", end: "01:00 PM" },
      { start: "02:00 PM", end: "03:00 PM" },
      { start: "03:00 PM", end: "04:00 PM" },
      { start: "04:00 PM", end: "05:00 PM" },
    ];

    for (const slot of defaultSlots) {
      await ctx.db.insert("slots", {
        startTime: slot.start,
        endTime: slot.end,
        regularSlots: 10,  // From prompt: 10 regular slots
        prioritySlots: 2,  // From prompt: 2 priority slots
      });
    }

    return "Successfully initialized slots";
  },
});
