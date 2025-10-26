/* Purpose: Represents an application user mapped to a Clerk account (doctors, staff, clinic owners).
Key fields: clerkId (unique), subscription (plan details), name, email, phone, profilePhotoUrl, qualifications, specializations, hprId, clinics (refs), linkedPatientCodes.
Indexes: clerkId unique, email index, text index on name.
Relationships: references Clinic (membership/ownership), used as doctor or createdBy in other models.
Usage notes: 
- User roles are derived from clinic relationships (owner vs staff), not stored globally
- Use getRoleInClinic() method to get role for specific clinic
- Subscription determines clinic creation limits
- Keep PII handling (email/phone) secure and consider field-level encryption for production.
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

const SubscriptionSchema = new Schema(
  {
    plan: {
      type: String,
      enum: ["free", "basic", "pro", "enterprise"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "trial", "expired", "cancelled"],
      default: "active",
    },
    maxClinics: { type: Number, default: 0 }, // 0=free, 1=basic, 3=pro, unlimited=999
    trialEndsAt: { type: Date },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    startedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    subscription: { type: SubscriptionSchema, default: () => ({}) },
    isAdmin: { type: Boolean, default: false },
    name: { type: String },
    email: { type: String, unique: true, sparse: true, lowercase: true },
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

/**
 * Get user's role in a specific clinic
 * @param {ObjectId} clinicId - The clinic ID
 * @returns {Promise<string|null>} 'clinic_owner' | 'doctor' | 'staff' | null
 */
UserSchema.methods.getRoleInClinic = async function (clinicId) {
  const Clinic = mongoose.model("Clinic");
  const clinic = await Clinic.findById(clinicId);

  if (!clinic) return null;

  // Check if user is owner
  if (clinic.owner.toString() === this._id.toString()) {
    return "clinic_owner";
  }

  // Check if user is staff
  const staffEntry = clinic.staff.find(
    (s) => s.user.toString() === this._id.toString() && s.accepted
  );

  return staffEntry ? staffEntry.role : null;
};

/**
 * Get all clinics owned by user
 * @returns {Promise<Array>} Array of clinics
 */
UserSchema.methods.getOwnedClinics = async function () {
  const Clinic = mongoose.model("Clinic");
  return await Clinic.find({ owner: this._id });
};

/**
 * Get all clinics where user is accepted staff
 * @returns {Promise<Array>} Array of clinics with role info
 */
UserSchema.methods.getStaffClinics = async function () {
  const Clinic = mongoose.model("Clinic");
  
  // Use $elemMatch to ensure both conditions apply to the SAME array element
  const clinics = await Clinic.find({
    staff: {
      $elemMatch: {
        user: this._id,
        accepted: true,
      },
    },
  });

  return clinics.map((clinic) => {
    const staffEntry = clinic.staff.find(
      (s) => s.user.toString() === this._id.toString() && s.accepted === true
    );
    return {
      ...clinic.toObject(),
      userRole: staffEntry.role,
    };
  });
};

/**
 * Get all clinics user has access to (owned + staff)
 * @returns {Promise<Array>} Array of clinics with role info
 */
UserSchema.methods.getAllClinics = async function () {
  const owned = await this.getOwnedClinics();
  const staff = await this.getStaffClinics();

  const ownedWithRole = owned.map((c) => ({
    ...c.toObject(),
    userRole: "clinic_owner",
  }));

  return [...ownedWithRole, ...staff];
};

/**
 * Check if user can create a new clinic based on subscription
 * @returns {Promise<boolean>}
 */
UserSchema.methods.canCreateClinic = async function () {
  const ownedClinics = await this.getOwnedClinics();
  const { maxClinics, status } = this.subscription;

  // Check if subscription is active or in trial
  if (status !== "active" && status !== "trial") {
    return false;
  }

  // Check trial expiry
  if (status === "trial" && this.subscription.trialEndsAt) {
    if (new Date() > this.subscription.trialEndsAt) {
      return false;
    }
  }

  // Enterprise has unlimited (999)
  if (maxClinics === 999) return true;

  return ownedClinics.length < maxClinics;
};

/**
 * Check if user has access to a specific clinic
 * @param {ObjectId} clinicId
 * @returns {Promise<boolean>}
 */
UserSchema.methods.hasAccessToClinic = async function (clinicId) {
  const role = await this.getRoleInClinic(clinicId);
  return role !== null;
};

export default mongoose.model("User", UserSchema);
