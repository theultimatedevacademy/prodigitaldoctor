/* Purpose: Bookings between patients and doctors (useful for dashboard, calendar, visit lifecycle).
Key fields: clinic, doctor, patient, startAt, endAt, status (scheduled/completed/cancelled/no-show), visitType (first_visit/follow_up), vitals, tempPatientData, notes, createdBy.
Indexes: compound on { clinic, startAt } and { doctor, startAt } for quick daily/day-range queries and conflict detection.
Relationships: refs to Clinic, User (doctor), Patient.
Usage notes: validate overlapping slots (doctor-level conflict detection) before insert. Use transactions when creating appointment tied to other records. Expose calendar endpoints with server-side date filters for performance.
For first_visit, tempPatientData stores name/phone until patient record is created. Vitals are optional and recorded when patient arrives.
*/

import mongoose from "mongoose";
const { Schema } = mongoose;

const TempPatientDataSchema = new Schema(
  {
    name: { type: String },
    phone: { type: String },
  },
  { _id: false }
);

const VitalsSchema = new Schema(
  {
    height: { type: Number }, // cm
    weight: { type: Number }, // kg
    temperature: { type: Number }, // °F
    bloodPressureSystolic: { type: Number },
    bloodPressureDiastolic: { type: Number },
    pulse: { type: Number }, // bpm
    spo2: { type: Number }, // %
    recordedAt: { type: Date, default: Date.now },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User" },
    notes: String,
  },
  { _id: false }
);

const ClinicalNotesSchema = new Schema(
  {
    chiefComplaint: String, // Why patient came (can be filled by staff)
    symptoms: String, // Detailed symptoms (doctor fills)
    examination: String, // Physical examination findings
    diagnosis: String, // Doctor's diagnosis
    treatmentPlan: String, // Treatment recommended
    additionalNotes: String, // Any other notes
    recordedAt: { type: Date, default: Date.now },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const AppointmentSchema = new Schema(
  {
    clinic: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "User" },
    patient: { type: Schema.Types.ObjectId, ref: "Patient" },
    visitType: {
      type: String,
      enum: ["first_visit", "follow_up"],
      default: "first_visit",
    },
    tempPatientData: TempPatientDataSchema,
    startAt: { type: Date, required: true },
    endAt: Date,
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "cancelled"],
      default: "scheduled",
    },
    vitals: VitalsSchema,
    clinicalNotes: ClinicalNotesSchema,
    notes: String, // General notes (legacy)
    prescriptions: [{ type: Schema.Types.ObjectId, ref: "Prescription" }], // Link to prescriptions created
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AppointmentSchema.index({ clinic: 1, startAt: 1 });
AppointmentSchema.index({ doctor: 1, startAt: 1 });

export default mongoose.model("Appointment", AppointmentSchema);
