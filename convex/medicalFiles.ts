import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate a URL for the patient to upload their document
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Save metadata after upload completion
export const saveFileMetadata = mutation({
  args: {
    patientId: v.id("users"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    checksum: v.string(), // Client-calculated or server-calculated
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("medicalFiles", {
      patientId: args.patientId,
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      checksum: args.checksum,
      timestamp: new Date().toISOString(),
    });
  },
});

// Get all files for a specific patient
export const getFiles = query({
  args: { patientId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.patientId) return [];
    
    const files = await ctx.db
      .query("medicalFiles")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId!))
      .order("desc")
      .collect();

    // Map files to include their download URLs
    return Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.storageId),
      }))
    );
  },
});

// Delete a file
export const deleteFile = mutation({
  args: { fileId: v.id("medicalFiles"), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
    await ctx.db.delete(args.fileId);
  },
});
