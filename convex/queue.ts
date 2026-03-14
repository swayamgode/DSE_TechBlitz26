import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Mutation to handle QR scan and checking a patient into the live queue
export const checkInPatient = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // 1. Find an upcoming appointment for this user that hasn't been checked in
    const appointments = await ctx.db
      .query("appointments")
      .filter((q) => q.and(
         q.eq(q.field("userId"), args.userId),
         q.eq(q.field("status"), "scheduled")
      ))
      .collect();

    // Filter out already checked-in appointments in JS,
    // because checkedIn may be undefined/null for older records
    const pending = appointments.filter((a) => !a.checkedIn);

    if (pending.length === 0) {
      throw new Error("No upcoming booked appointments found or already checked-in.");
    }
    
    // Take the first matching appointment
    const appointment = pending[0];
    const isPriority = appointment.type === "priority";
    
    // 2. Mark appointment as checked-in
    await ctx.db.patch(appointment._id, {
      checkedIn: true,
    });
    
    // 3. Insert into the live FCFS queue table
    const queueId = await ctx.db.insert("queue", {
      slotId: appointment.slotId,
      patientId: args.userId,
      position: 0, 
      arrivalTime: new Date().toISOString(),
      priority: isPriority,
      status: "Waiting",
    });
    
    return queueId;
  }
});

// Mutation to call a patient (start consultation)
export const callPatient = mutation({
  args: { queueId: v.id("queue") },
  handler: async (ctx, args) => {
    // Set all other patients in the same slot to 'Waiting' if needed, 
    // but typically only one is 'Consulting' at a time.
    await ctx.db.patch(args.queueId, { status: "Consulting" });
  }
});

// Mutation to remove a patient from queue (completed or cancelled)
export const removeFromQueue = mutation({
  args: { queueId: v.id("queue"), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.queueId);
    if (!entry) return;

    // Find the corresponding appointment and update it
    const appointment = await ctx.db
      .query("appointments")
      .filter((q) => q.and(
        q.eq(q.field("userId"), entry.patientId),
        q.eq(q.field("slotId"), entry.slotId),
        q.eq(q.field("status"), "scheduled")
      ))
      .first();

    if (appointment) {
      await ctx.db.patch(appointment._id, { 
        status: (args.status as any) || "completed" 
      });
    }

    await ctx.db.delete(args.queueId);
  }
});

// Query to get a user's dynamically calculated position in the queue
export const getQueuePosition = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    
    // 1. Find user's active queue entry
    const userQueue = await ctx.db
      .query("queue")
      .filter((q) => q.eq(q.field("patientId"), args.userId))
      .first();
      
    if (!userQueue) return null; // Not checked in or already seen
    
    // 2. Find all current queue entries for this specific time slot
    const allInSlot = await ctx.db
      .query("queue")
      .filter((q) => q.eq(q.field("slotId"), userQueue.slotId))
      .collect();
      
    // 3. Sorting logic
    allInSlot.sort((a, b) => {
      if (a.priority === b.priority) {
        return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime();
      }
      return a.priority ? -1 : 1;
    });
    
    // 4. Determine ranking
    const index = allInSlot.findIndex(q => q._id === userQueue._id);
    return {
      position: index + 1,
      totalInQueue: allInSlot.length,
      estimatedWaitTime: index * 10,
      isPriority: userQueue.priority,
      arrivalTime: userQueue.arrivalTime,
      status: userQueue.status || "Waiting",
    };
  }
});

// Used by Receptionist and Doctor to view the live line
export const getLiveQueue = query({
  args: { slotId: v.optional(v.id("slots")) },
  handler: async (ctx, args) => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    let allQueueEntries;
    if (args.slotId) {
      allQueueEntries = await ctx.db
        .query("queue")
        .filter((q) => q.eq(q.field("slotId"), args.slotId))
        .collect();
    } else {
      const slotsToday = await ctx.db
        .query("slots")
        .filter((q) => q.or(
          q.eq(q.field("date"), today),
          q.eq(q.field("date"), undefined)
        ))
        .collect();
      const slotIds = new Set(slotsToday.map(s => s._id));
      const allEntries = await ctx.db.query("queue").collect();
      allQueueEntries = allEntries.filter(q => slotIds.has(q.slotId));
    }
    
    const mapped = await Promise.all(allQueueEntries.map(async (q) => {
      const patient = await ctx.db.get(q.patientId);
      const medInfo = await ctx.db
        .query("medicalInfo")
        .withIndex("by_patient", (qi) => qi.eq("patientId", q.patientId))
        .first();

      const dateObj = new Date(q.arrivalTime);
      const timeStr = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
      
      return {
        _id: q._id,
        patientId: q.patientId,
        name: patient?.name || "Unknown Patient",
        type: q.priority ? "Priority" : "Regular",
        time: `${dateStr}, ${timeStr}`,
        rawTime: q.arrivalTime,
        priority: q.priority,
        status: q.status || "Waiting",
        medicalInfo: medInfo ?? null,
      };
    }));
    
    mapped.sort((a, b) => {
      if (a.priority === b.priority) {
        return new Date(a.rawTime).getTime() - new Date(b.rawTime).getTime();
      }
      return a.priority ? -1 : 1;
    });
    
    return mapped;
  }
});
