/* 
Purpose: Immutable (or append-only) audit entries for sensitive actions: HIP pushes, consent events, DDI override, logins, staff invites, ABHA create/verify, and admin changes.
Key fields: actor (User ref), action (string), resource (string), resourceId, ip, meta (freeform), createdAt.
Indexes: { actor, createdAt } and likely { resource, resourceId }.
Relationships: references User.
Usage notes: Always record who, what, when, why (meta). Encrypt PII in meta if present. Ensure retention and export policies (e.g., keep audit for X years). Use audit logs to support regulatory and troubleshooting needs. Write audits synchronously or via a fast append queue to avoid blocking critical flows.
*/

import mongoose from "mongoose";
const { Schema } = mongoose;

const AuditLogSchema = new Schema({
  actor: { type: Schema.Types.ObjectId, ref: "User" },
  action: String,
  resource: String,
  resourceId: Schema.Types.ObjectId,
  ip: String,
  meta: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

AuditLogSchema.index({ actor: 1, createdAt: -1 });

export default mongoose.model("AuditLog", AuditLogSchema);
