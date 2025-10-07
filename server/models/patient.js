/* 
Purpose: Patient demographics, contact, linked ABHA (ABHA number & status), and patient codes generated per clinic/doctor.
Key fields: name, dob, gender, phone, email, addresses, abhaNumber, abhaLinked, patientCodes (array of clinic/doctor/code entries), notes.
Indexes: unique sparse index on patientCodes.code (ensures patient codes unique across collection), unique sparse index on abhaNumber when present, index on phone.
Relationships: patientCodes reference Clinic and User (doctor). Prescription and Appointment reference Patient.
Usage notes: generate patient code atomically (Counter + transaction) and push to patient.patientCodes. Use sparse unique index carefully: it enforces uniqueness for documents that include a patientCodes.code value. For deletion/merging workflows, consider soft-delete flags and retention. Encrypt PII if required.
 */

import mongoose from "mongoose";
const { Schema } = mongoose;

const PatientCodeSchema = new Schema(
  {
    clinic: { type: Schema.Types.ObjectId, ref: "Clinic" },
    doctor: { type: Schema.Types.ObjectId, ref: "User" },
    code: { type: String },
    createdAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
  },
  { _id: false }
);

const AddressSchema = new Schema(
  { line1: String, city: String, state: String, pin: String },
  { _id: false }
);

const PatientSchema = new Schema(
  {
    name: { type: String, required: true },
    dob: Date,
    gender: { type: String, enum: ["M", "F", "O"] },
    phone: { type: String, index: true },
    email: String,
    addresses: [AddressSchema],
    abhaNumber: { type: String },
    abhaLinked: { type: Boolean, default: false },
    patientCodes: [PatientCodeSchema],
    notes: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

PatientSchema.index({ "patientCodes.code": 1 }, { unique: true, sparse: true });
PatientSchema.index({ abhaNumber: 1 }, { unique: true, sparse: true });

export default mongoose.model("Patient", PatientSchema);
