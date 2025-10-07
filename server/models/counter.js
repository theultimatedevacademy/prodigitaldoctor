/* 
Purpose: A simple sequence helper for generating monotonic per-key counters used for deterministic unique codes (patient codes, invoice numbers).
Key fields: _id (sequence key string), seq (number).
Indexes: primary on _id.
Usage notes: use findByIdAndUpdate(..., { $inc: { seq: 1 } }, { upsert: true, new: true }) inside transactions or with proper error-handling to obtain safe increments. Combine the seq with clinic/doctor shortcodes and a random suffix to form patientCode. Avoid using timestamps alone for uniqueness.
*/

import mongoose from "mongoose";
const { Schema } = mongoose;

const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export default mongoose.model("Counter", CounterSchema);
