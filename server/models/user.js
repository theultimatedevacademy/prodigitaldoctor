/* Purpose: Represents an application user mapped to a Clerk account (doctors, assistants, clinic owners, patients, admins).
Key fields: clerkId (unique), roles (['patient','doctor','assistant','clinic_owner','admin']), name, email, phone, profilePhotoUrl, qualifications, specializations, hprId, clinics (refs), linkedPatientCodes.
Indexes: clerkId unique, email index, text index on name.
Relationships: references Clinic (membership/ownership), used as doctor or createdBy in other models.
Usage notes: map Clerk JWT sub to clerkId in auth middleware; create minimal User row on first sign-in if desired; store doctor metadata (HPR, qualifications) here. Keep PII handling (email/phone) secure and consider field-level encryption for production.
 */

import mongoose from "mongoose";
const { Schema } = mongoose;

const LinkedCodeSchema = new Schema(
  {
    clinic: { type: Schema.Types.ObjectId, ref: "Clinic" },
    doctor: { type: Schema.Types.ObjectId, ref: "User" },
    code: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    roles: [
      {
        type: String,
        enum: ["patient", "doctor", "assistant", "clinic_owner", "admin"],
        required: true,
      },
    ],
    name: { type: String },
    email: { type: String, index: true },
    phone: { type: String },
    profilePhotoUrl: { type: String },
    qualifications: { type: String },
    specializations: [String],
    hprId: { type: String },
    clinics: [{ type: Schema.Types.ObjectId, ref: "Clinic" }],
    linkedPatientCodes: [LinkedCodeSchema],
  },
  { timestamps: true }
);

UserSchema.index({ name: "text" });

export default mongoose.model("User", UserSchema);
