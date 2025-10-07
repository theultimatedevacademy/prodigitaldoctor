/* Purpose: Bookings between patients and doctors (useful for dashboard, calendar, visit lifecycle).
Key fields: clinic, doctor, patient, startAt, endAt, status (scheduled/completed/cancelled/no-show), notes, createdBy.
Indexes: compound on { clinic, startAt } and { doctor, startAt } for quick daily/day-range queries and conflict detection.
Relationships: refs to Clinic, User (doctor), Patient.
Usage notes: validate overlapping slots (doctor-level conflict detection) before insert. Use transactions when creating appointment tied to other records. Expose calendar endpoints with server-side date filters for performance.
*/

import mongoose from "mongoose";
const { Schema } = mongoose;

const AppointmentSchema = new Schema(
  {
    clinic: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    startAt: { type: Date, required: true },
    endAt: Date,
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AppointmentSchema.index({ clinic: 1, startAt: 1 });
AppointmentSchema.index({ doctor: 1, startAt: 1 });

export default mongoose.model("Appointment", AppointmentSchema);
