import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSlots = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("slots").collect();
  },
});

// Query to compute available capacity for the slots — returns ALL dates
export const getSlotsWithAvailability = query({
  args: {},
  handler: async (ctx) => {
    const slots = await ctx.db.query("slots").collect();
    const appointments = await ctx.db.query("appointments").collect();

    const result = await Promise.all(slots.map(async (slot) => {
      const slotAppointments = appointments.filter(a => a.slotId === slot._id && a.status !== "cancelled");

      const regularCount = slotAppointments.filter(a => a.type === "regular").length;
      const priorityCount = slotAppointments.filter(a => a.type === "priority").length;

      const bookedPatients = await Promise.all(slotAppointments.map(async (a) => {
        const user = await ctx.db.get(a.userId);
        return {
          name: user?.name || "Unknown",
          type: a.type,
          status: a.status,
          checkedIn: a.checkedIn,
        };
      }));

      return {
        ...slot,
        totalAppointments: slotAppointments.length,
        availableRegular: Math.max(0, slot.regularSlots - regularCount),
        availablePriority: Math.max(0, slot.prioritySlots - priorityCount),
        bookedPatients,
      };
    }));

    // Sort by date then time
    const parseTime = (timeStr: string) => {
      const [time, modifier] = timeStr.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (modifier === 'PM' && h !== 12) h += 12;
      if (modifier === 'AM' && h === 12) h = 0;
      return (h * 60) + m;
    };

    return result.sort((a, b) => {
      const dateA = a.date ?? "";
      const dateB = b.date ?? "";
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return parseTime(a.startTime) - parseTime(b.startTime);
    });
  },
});

// Allow Receptionist to manually create slots
export const createSlot = mutation({
  args: {
    date: v.string(),      // e.g. "2026-03-13"
    startTime: v.string(), // e.g. "09:00 AM"
    endTime: v.string(),   // e.g. "10:00 AM"
    regularSlots: v.number(),
    prioritySlots: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("slots", {
      date: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
      regularSlots: args.regularSlots,
      prioritySlots: args.prioritySlots,
    });
  },
});

export const updateSlot = mutation({
  args: {
    slotId: v.id("slots"),
    date: v.string(),      
    startTime: v.string(), 
    endTime: v.string(),   
    regularSlots: v.number(),
    prioritySlots: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.slotId, {
      date: args.date,
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

    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

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
        date: today,
        startTime: slot.start,
        endTime: slot.end,
        regularSlots: 10,  // From prompt: 10 regular slots
        prioritySlots: 2,  // From prompt: 2 priority slots
      });
    }

    return "Successfully initialized slots";
  },
});

export const getCurrentSlot = query({
  args: {},
  handler: async (ctx) => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const nowMinutes = (hours * 60) + minutes;

    const slots = await ctx.db
      .query("slots")
      .filter((q) => q.or(
        q.eq(q.field("date"), today),
        q.eq(q.field("date"), undefined)
      ))
      .collect();

    const parseTime = (timeStr: string) => {
      const [time, modifier] = timeStr.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (modifier === 'PM' && h !== 12) h += 12;
      if (modifier === 'AM' && h === 12) h = 0;
      return (h * 60) + m;
    };

    // Find the slot that contains the current time
    const activeSlot = slots.find(s => {
      const start = parseTime(s.startTime);
      const end = parseTime(s.endTime);
      return nowMinutes >= start && nowMinutes < end;
    });

    if (activeSlot) return activeSlot;

    // If no slot is exactly running, find the NEXT upcoming slot
    const upcomingSlots = slots.filter(s => parseTime(s.startTime) > nowMinutes)
      .sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));

    return upcomingSlots[0] || slots[slots.length - 1] || null;
  },
});
