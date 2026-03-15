import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    password: v.optional(v.string()), // Basic testing password
    role: v.union(v.literal("patient"), v.literal("doctor"), v.literal("receptionist")),
    wantsBreak: v.optional(v.boolean()),
  }),

  slots: defineTable({
    date: v.optional(v.string()),  // e.g. "2026-03-13"
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
    status: v.optional(v.union(v.literal("Waiting"), v.literal("Consulting"))),
  }),

  medicalInfo: defineTable({
    patientId: v.id("users"),
    age: v.optional(v.number()),
    gender: v.optional(v.string()),
    bloodType: v.optional(v.string()),
    isDiabetic: v.boolean(),
    isHypertensive: v.boolean(),
    hasHeartDisease: v.boolean(),
    hasAsthma: v.boolean(),
    conditions: v.optional(v.string()),   // Comma-separated or freeform
    allergies: v.optional(v.string()),
    currentMedications: v.optional(v.string()),
    notes: v.optional(v.string()),        // Doctor / patient free notes
    emergencyContact: v.optional(v.string()),
    
    // Blockchain / Security Fields
    checksum: v.optional(v.string()),     // SHA-256 hash of the record content
    lastVerified: v.optional(v.string()), // ISO Timestamp
    version: v.number(),                  // For audit trailing
  }).index("by_patient", ["patientId"]),

  // Immutable Ledger (Blockchain History)
  medicalAudit: defineTable({
    patientId: v.id("users"),
    timestamp: v.string(),
    checksum: v.string(),
    version: v.number(),
    data: v.string(),                     // JSON string of the medical state
    blockIndex: v.number(),               // Sequential block number
  }).index("by_patient", ["patientId"]),

  medicalFiles: defineTable({
    patientId: v.id("users"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    checksum: v.string(), // Integrity hash
    timestamp: v.string(),
  }).index("by_patient", ["patientId"]),
});
