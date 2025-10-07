/* Purpose: Canonical active substances (chemical salts / ingredients) used to relate medications and drive DDI rules.
Key fields: name, synonyms, atcCode, description.
Indexes: text/index on name (fast name/synonym search).
Relationships: referenced by Medication.compositions and by DDI.compA/compB.
Usage notes: normalize composition names and synonyms during seed/import to avoid duplicates. Maintain mapping to ATC codes for downstream summarization or analytics.
*/

import mongoose from "mongoose";
const { Schema } = mongoose;

const CompositionSchema = new Schema({
  name: { type: String, required: true, index: true },
  synonyms: [String],
  atcCode: String,
  description: String,
  createdAt: Date,
});

CompositionSchema.index({ name: "text" });

export default mongoose.model("Composition", CompositionSchema);
