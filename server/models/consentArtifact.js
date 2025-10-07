/* 
Purpose: Stores ABDM consent artifacts and consent request lifecycle (request IDs, status, full artifact JSON).
Key fields: patient, consentRequestId, requesterId, purpose, hiTypes, permission, artifact (full JSON), status (REQUESTED/GRANTED/REJECTED/REVOKED), createdAt, expiresAt.
Indexes: (useful to query by patient and consentRequestId).
Relationships: references Patient.
Usage notes: Save the entire artifact returned by ABDM for auditability. Validate webhooks using ABDM signature, then update ConsentArtifact accordingly. Respect expiresAt and implement periodic cleanup/archival if needed. Protect artifact storage with encryption.
*/

import mongoose from "mongoose";
const { Schema } = mongoose;

const ConsentSchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: "Patient" },
  consentRequestId: String,
  requesterId: String,
  purpose: String,
  hiTypes: [String],
  permission: Schema.Types.Mixed,
  artifact: Schema.Types.Mixed,
  status: {
    type: String,
    enum: ["REQUESTED", "GRANTED", "REJECTED", "REVOKED"],
  },
  createdAt: Date,
  expiresAt: Date,
});

export default mongoose.model("ConsentArtifact", ConsentSchema);
