/* 
Purpose: Stores patient ratings/reviews for clinics and optionally for a specific doctor. Used by search/analytics.
Key fields: clinic, doctor (optional), patient, rating (1–5), review, createdAt.
Indexes: { clinic, doctor } for aggregation queries.
Relationships: references Clinic, User (doctor), Patient.
Usage notes: Use server-side controls to prevent multiple ratings per patient/visit or allow edits. Aggregate ratings for star displays and trending clinics.
*/

import mongoose from "mongoose";
const { Schema } = mongoose;

const ClinicRatingSchema = new Schema({
  clinic: { type: Schema.Types.ObjectId, ref: "Clinic" },
  doctor: { type: Schema.Types.ObjectId, ref: "User" },
  patient: { type: Schema.Types.ObjectId, ref: "Patient" },
  rating: { type: Number, min: 1, max: 5 },
  review: String,
  createdAt: Date,
});

ClinicRatingSchema.index({ clinic: 1, doctor: 1 });

export default mongoose.model("ClinicRating", ClinicRatingSchema);
