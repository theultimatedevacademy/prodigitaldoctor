/*
Purpose: Catalog of medicines (brand/generic) used in prescription building and search.
Key fields: brandName, genericName, unique_composition (Composition refs), exact_composition (string), form, manufacturer, substitutes, sideEffects, usage, chemicalClass, habitForming, therapeuticClass, actionClass.
Indexes: text index across brandName and genericName for search; index on unique_composition for composition-based search.
Relationships: unique_composition -> Composition, substitutes -> Medication (self-reference). Referenced in prescriptions.
Usage notes: keep unique_composition populated for each medication so the backend can expand composition IDs for DDI checks. exact_composition stores the raw composition string. Smart search handles brand name, generic name, and composition name queries. Consider integrating an external drug database for richer metadata or later migrating to Elastic/Algolia for fuzzy search.
*/

import mongoose, { Schema } from "mongoose";

const MedicationSchema = new Schema({
  brandName: { type: String, index: true },
  genericName: { type: String, index: true },
  unique_composition: [{ type: Schema.Types.ObjectId, ref: "Composition" }],
  exact_composition: String, // Raw composition string (e.g., "Paracetamol 500mg + Caffeine 50mg")
  form: String, // Tablet, Capsule, Syrup, Injection, etc.
  manufacturer: String,
  substitutes: [{ type: Schema.Types.ObjectId, ref: "Medication" }], // Alternate medicines
  sideEffects: String, // Common side effects description
  usage: String, // Therapeutic usage/indications
  chemicalClass: String, // Chemical classification
  habitForming: { type: Boolean, default: false }, // Whether habit forming
  therapeuticClass: String, // Therapeutic classification
  actionClass: String, // Action/pharmacological classification
  createdAt: Date,
});

// Text index for brand name and generic name search
MedicationSchema.index({ brandName: "text", genericName: "text" });

// Regular index for unique_composition for efficient composition-based queries
MedicationSchema.index({ unique_composition: 1 });

export default mongoose.model("Medication", MedicationSchema);
