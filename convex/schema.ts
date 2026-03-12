import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    role: v.union(v.literal("patient"), v.literal("doctor"), v.literal("receptionist")),
  }),

  slots: defineTable({
    startTime: v.string(), // e.g. "09:00 AM"
    endTime: v.string(),   // e.g. "10:00 AM"
    regularSlots: v.number(),
    prioritySlots: v.number(),
  }),

  appointments: defineTable({
    userId: v.id("users"),
    slotId: v.id("slots"),
    type: v.union(v.literal("regular"), v.literal("priority")),
    checkedIn: v.boolean(),
    status: v.union(v.literal("scheduled"), v.literal("completed"), v.literal("cancelled"), v.literal("no-show")),
  }),

  queue: defineTable({
    slotId: v.id("slots"),
    patientId: v.id("users"),
    position: v.number(),
    arrivalTime: v.string(), // ISODate string
    priority: v.boolean(),
  }),
});
