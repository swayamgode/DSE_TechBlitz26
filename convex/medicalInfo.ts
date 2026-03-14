import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Upsert: create or update medical info for a patient
export const saveMedicalInfo = mutation({
  args: {
    patientId: v.id("users"),
    age: v.optional(v.number()),
    gender: v.optional(v.string()),
    bloodType: v.optional(v.string()),
    isDiabetic: v.boolean(),
    isHypertensive: v.boolean(),
    hasHeartDisease: v.boolean(),
    hasAsthma: v.boolean(),
    conditions: v.optional(v.string()),
    allergies: v.optional(v.string()),
    currentMedications: v.optional(v.string()),
    notes: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Create a content string to hash (blockchain style)
    const content = JSON.stringify({
      p: args.patientId,
      d: args.isDiabetic,
      h: args.isHypertensive,
      hd: args.hasHeartDisease,
      as: args.hasAsthma,
      c: args.conditions || "",
      a: args.allergies || "",
      m: args.currentMedications || "",
      n: args.notes || "",
    });

    // Simple hashing for demonstration in the prototype 
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    const checksum = "hash-" + Math.abs(hash).toString(16).slice(0, 32);
    const timestamp = new Date().toISOString();

    const existing = await ctx.db
      .query("medicalInfo")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .first();

    const newVersion = (existing?.version ?? 0) + 1;

    // 2. Write to the Audit Ledger (Blockchain History)
    // Find the latest block index
    const lastBlock = await ctx.db
      .query("medicalAudit")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .first();

    await ctx.db.insert("medicalAudit", {
      patientId: args.patientId,
      timestamp,
      checksum,
      version: newVersion,
      data: content,
      blockIndex: (lastBlock?.blockIndex ?? 0) + 1,
    });

    if (existing) {
      await ctx.db.patch(existing._id, {
        age: args.age,
        gender: args.gender,
        bloodType: args.bloodType,
        isDiabetic: args.isDiabetic,
        isHypertensive: args.isHypertensive,
        hasHeartDisease: args.hasHeartDisease,
        hasAsthma: args.hasAsthma,
        conditions: args.conditions,
        allergies: args.allergies,
        currentMedications: args.currentMedications,
        notes: args.notes,
        emergencyContact: args.emergencyContact,
        // Security updates
        checksum,
        lastVerified: timestamp,
        version: newVersion,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("medicalInfo", {
        patientId: args.patientId,
        age: args.age,
        gender: args.gender,
        bloodType: args.bloodType,
        isDiabetic: args.isDiabetic,
        isHypertensive: args.isHypertensive,
        hasHeartDisease: args.hasHeartDisease,
        hasAsthma: args.hasAsthma,
        conditions: args.conditions,
        allergies: args.allergies,
        currentMedications: args.currentMedications,
        notes: args.notes,
        emergencyContact: args.emergencyContact,
        // Initial Security
        checksum,
        lastVerified: timestamp,
        version: newVersion,
      });
    }
  },
});

// Save consultation notes (simplified update for doctors)
export const saveConsultationNotes = mutation({
  args: {
    patientId: v.id("users"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("medicalInfo")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .first();

    if (!existing) {
       // Create minimal record if none exists
       return await ctx.db.insert("medicalInfo", {
         patientId: args.patientId,
         isDiabetic: false,
         isHypertensive: false,
         hasHeartDisease: false,
         hasAsthma: false,
         notes: args.notes,
         version: 1,
       });
    }

    const newVersion = (existing.version ?? 0) + 1;
    const timestamp = new Date().toISOString();

    // Re-hash with new notes
    const content = JSON.stringify({
      p: existing.patientId,
      d: existing.isDiabetic,
      h: existing.isHypertensive,
      hd: existing.hasHeartDisease,
      as: existing.hasAsthma,
      c: existing.conditions || "",
      a: existing.allergies || "",
      m: existing.currentMedications || "",
      n: args.notes || "",
    });

    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const checksum = "hash-" + Math.abs(hash).toString(16).slice(0, 32);

    await ctx.db.patch(existing._id, {
      notes: args.notes,
      checksum,
      lastVerified: timestamp,
      version: newVersion,
    });

    // Audit log
    await ctx.db.insert("medicalAudit", {
      patientId: args.patientId,
      timestamp,
      checksum,
      version: newVersion,
      data: content,
      blockIndex: 0, // Simplified for now
    });
  },
});

// Get medical history (ledger)
export const getMedicalHistory = query({
  args: { patientId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.patientId) return [];
    return await ctx.db
      .query("medicalAudit")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId!))
      .order("desc")
      .collect();
  },
});

// Get medical info for a specific patient
export const getMedicalInfo = query({
  args: { patientId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.patientId) return null;
    return await ctx.db
      .query("medicalInfo")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId!))
      .first();
  },
});
