/* 
Purpose: Records of a prescription: meds list, DDI warnings, PDF (S3) link, FHIR payload for ABDM, and HIP transaction details.
Key fields: clinic, doctor, patient, appointment, meds (med + compRefs + dosage/frequency/duration), diagnosis, notes, pdfUrl, pdfS3Key, ddiWarnings, abhaShareStatus, transactionId, fhirPayload.
Indexes: { patient, createdAt } and { clinic, createdAt } for history queries.
Relationships: references Medication, Composition, User, Patient, Clinic, Appointment.
Usage notes:

On create: expand requested medicationIds to composition IDs, run DDI checks, store ddiWarnings.

Persist full fhirPayload for audit and debugging.

Generate PDF in background worker (Puppeteer) and upload to S3; set pdfUrl & pdfS3Key when done.

abhaShareStatus tracks ABDM HIP share lifecycle (NOT_SHARED, PENDING, DELIVERED, FAILED).

For contraindicated warnings, backend should either reject or record override actions in AuditLog. Consider redaction/retention policy for saved FHIR payloads and PDF files.
*/
import mongoose from "mongoose";
const { Schema } = mongoose;

const PrescriptionMedSchema = new Schema(
  {
    medication: { type: Schema.Types.ObjectId, ref: "Medication" },
    compRefs: [{ type: Schema.Types.ObjectId, ref: "Composition" }],
    dosage: String,
    frequency: String,
    duration: String,
    notes: String,
  },
  { _id: false }
);

const DDIDetailSchema = new Schema(
  {
    severity: { type: String },
    text: { type: String },
    compA: { type: Schema.Types.ObjectId, ref: "Composition" },
    compB: { type: Schema.Types.ObjectId, ref: "Composition" },
    recommendation: String,
  },
  { _id: false }
);

const PrescriptionSchema = new Schema(
  {
    clinic: { type: Schema.Types.ObjectId, ref: "Clinic" },
    doctor: { type: Schema.Types.ObjectId, ref: "User" },
    patient: { type: Schema.Types.ObjectId, ref: "Patient" },
    appointment: { type: Schema.Types.ObjectId, ref: "Appointment" },
    abhaShareStatus: {
      type: String,
      enum: ["NOT_SHARED", "PENDING", "DELIVERED", "FAILED"],
      default: "NOT_SHARED",
    },
    meds: [PrescriptionMedSchema],
    diagnosis: [{ code: String, text: String }],
    notes: String,
    pdfUrl: String,
    pdfS3Key: String,
    ddiWarnings: [DDIDetailSchema],
    transactionId: String,
    fhirPayload: Schema.Types.Mixed,
    editHistory: [{
      editedAt: { type: Date, default: Date.now },
      editedBy: { type: Schema.Types.ObjectId, ref: "User" }
    }],
    lastEditedAt: Date,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

PrescriptionSchema.index({ patient: 1, createdAt: -1 });
PrescriptionSchema.index({ clinic: 1, createdAt: -1 });
// Unique sparse index: only one prescription per appointment (sparse allows null for prescriptions without appointments)
PrescriptionSchema.index({ appointment: 1 }, { unique: true, sparse: true });

export default mongoose.model("Prescription", PrescriptionSchema);
