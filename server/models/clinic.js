/* 
Purpose: A clinic/organization where doctors practice — owner, staff, hours, address, HFR mapping.
Key fields: name, address (line1/line2/city/state/pin), contact, logoUrl, workingHours, owner (User ref), staff (subdocuments), hfrId.
Indexes: address.city, address.pin.
Relationships: owner -> User; staff.user -> User. Clinic is the scoping entity for patients, appointments, prescriptions.
Usage notes: enforce clinic-scoped RBAC in middleware. Use clinic.hfrId for ABDM HFR mapping. Staff invites stored as staff entries (accepted flag). Consider audit when changing owner/staff.
*/

import mongoose from "mongoose";
const { Schema } = mongoose;

const StaffSubSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["doctor", "assistant", "receptionist"] },
    invitedAt: Date,
    accepted: { type: Boolean, default: false },
  },
  { _id: false }
);

const WorkingHoursSchema = new Schema(
  {
    monday: [{ start: String, end: String }],
    tuesday: [{ start: String, end: String }],
    wednesday: [{ start: String, end: String }],
    thursday: [{ start: String, end: String }],
    friday: [{ start: String, end: String }],
    saturday: [{ start: String, end: String }],
    sunday: [{ start: String, end: String }],
  },
  { _id: false }
);

const ClinicSchema = new Schema({
  name: { type: String, required: true },
  address: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    pin: String,
  },
  contact: { phone: String, email: String },
  logoUrl: String,
  workingHours: WorkingHoursSchema,
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  staff: [StaffSubSchema],
  hfrId: String,
  createdAt: { type: Date, default: Date.now },
});

ClinicSchema.index({ "address.city": 1 });
ClinicSchema.index({ "address.pin": 1 });

export default mongoose.model("Clinic", ClinicSchema);
