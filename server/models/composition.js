/* Purpose: Canonical active substances (chemical salts / ingredients) used to relate medications and drive DDI rules.
Key fields: name, description.
Indexes: text/index on name (fast name search).
Relationships: referenced by Medication.compositions and by DDI.compA/compB.
Usage notes: normalize composition names during seed/import to avoid duplicates.
*/

import mongoose from "mongoose";
const { Schema } = mongoose;

const CompositionSchema = new Schema({
  name: { type: String, required: true, index: true },
  description: String,
  createdAt: Date,
});

CompositionSchema.index({ name: "text" });

export default mongoose.model("Composition", CompositionSchema);
