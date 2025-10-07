/* 
Purpose: Catalog of medicines (brand/generic) used in prescription building and search.
Key fields: brandName, genericName, compositions (Composition refs), form, strength, schedule, manufacturer, atcCode, ndcCode.
Indexes: text index across brandName and genericName for search.
Relationships: compositions -> Composition. Referenced in prescriptions.
Usage notes: keep compositions populated for each medication so the backend can expand composition IDs for DDI checks. Consider integrating an external drug database for richer metadata or later migrating to Elastic/Algolia for fuzzy search.
*/

import mongoose, { Schema } from "mongoose";

const MedicationSchema = new Schema({
  brandName: { type: String, index: true },
  genericName: { type: String, index: true },
  compositions: [{ type: Schema.Types.ObjectId, ref: "Composition" }],
  form: String,
  strength: String,
  schedule: String,
  rxRequired: { type: Boolean, default: true },
  manufacturer: String,
  atcCode: String,
  ndcCode: String,
  createdAt: Date,
});

MedicationSchema.index({ brandName: "text", genericName: "text" });

export default mongoose.model("Medication", MedicationSchema);
