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
      position: 0, // We calculate dynamic priority ranking in the query
      arrivalTime: new Date().toISOString(),
      priority: isPriority,
    });
    
    return queueId;
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
      
    // 3. Sorting logic for real FCFS with Priority overrides
    // 🔀 Priority patients jump ahead of regular patients.
    // 🔀 If both are same priority status -> earlier arrival time goes first.
    allInSlot.sort((a, b) => {
      if (a.priority === b.priority) {
        return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime();
      }
      return a.priority ? -1 : 1;
    });
    
    // 4. Determine their ranking (1-indexed)
    const index = allInSlot.findIndex(q => q._id === userQueue._id);
    const position = index + 1;
    
    return {
      position: position,
      totalInQueue: allInSlot.length,
      estimatedWaitTime: position * 10, // Approx 10 mins wait per person
      isPriority: userQueue.priority,
      arrivalTime: userQueue.arrivalTime,
    };
  }
});

// Used by Receptionist and Doctor to view the live line
export const getLiveQueue = query({
  args: {},
  handler: async (ctx) => {
    // 1. Get all current queues
    const allQueueEntries = await ctx.db.query("queue").collect();
    
    // We only want people who are still waiting or consulting. 
    // In a real app we'd filter by active date.
    
    // 2. Map and sort them
    const mapped = await Promise.all(allQueueEntries.map(async (q) => {
      const patient = await ctx.db.get(q.patientId);
      
      // Fetch medical info for the doctor's view
      const medInfo = await ctx.db
        .query("medicalInfo")
        .withIndex("by_patient", (qi) => qi.eq("patientId", q.patientId))
        .first();

      const timeStr = new Date(q.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      return {
        _id: q._id,
        patientId: q.patientId,
        name: patient?.name || "Unknown Patient",
        type: q.priority ? "Priority" : "Regular",
        time: timeStr,
        rawTime: q.arrivalTime,
        priority: q.priority,
        status: "Waiting",
        medicalInfo: medInfo ?? null,
      };
    }));
    
    // 3. Sorting logic overrides
    mapped.sort((a, b) => {
      if (a.priority === b.priority) {
        return new Date(a.rawTime).getTime() - new Date(b.rawTime).getTime();
      }
      return a.priority ? -1 : 1;
    });
    
    return mapped;
  }
});
