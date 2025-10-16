/* 
Purpose: Stores pairwise interaction rules between two compositions (active ingredients) with severity and recommendation. Used by DDI engine.
Key fields: compA, compB (Composition refs), severity (minor/moderate/major/contraindicated), description, recommendation, references.
Indexes: unique compound index { compA:1, compB:1 }.
Relationships: references Composition.
Usage notes: schema enforces normalization (compA < compB) using pre-validate hook so pairs are always stored in canonical order. When checking DDI, expand medications → unique composition list → check each unordered pair against this collection. Sort results by severity for UI. Add provenance references (PubMed/URLs) to references. Ensure admin UI to edit/add DDI rules is auditable.
 */
import mongoose from "mongoose";
const { Schema } = mongoose;

const DDISchema = new Schema({
  compA: { type: Schema.Types.ObjectId, ref: "Composition", required: true },
  compB: { type: Schema.Types.ObjectId, ref: "Composition", required: true },
  severity: {
    type: String,
    enum: ["minor", "moderate", "major", "contraindicated", "unknown"],
    default: "unknown" // Default for imported data without explicit severity
  },
  description: String,
  recommendation: String,
  references: [String],
  createdAt: { type: Date, default: Date.now },
});

DDISchema.pre("validate", function (next) {
  if (!this.compA || !this.compB) return next();
  const a = this.compA.toString();
  const b = this.compB.toString();
  if (a > b) {
    const tmp = this.compA;
    this.compA = this.compB;
    this.compB = tmp;
  }
  next();
});

DDISchema.index({ compA: 1, compB: 1 }, { unique: true });

export default mongoose.model("DDI", DDISchema);
