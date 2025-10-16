/**
 * Patient Code Generator
 * Generates unique patient codes using clinic/doctor context and atomic counters
 */

import { nanoid } from 'nanoid';
import Counter from '../models/counter.js';
import logger from './logger.js';

/**
 * Generate unique patient code
 * Format: {CLINIC_SHORT}-{DOCTOR_SHORT}-{SEQUENCE}-{RANDOM}
 * Example: ABC-DR-0001-X7K
 * 
 * @param {string} clinicId - Clinic MongoDB ID
 * @param {string} doctorId - Doctor MongoDB ID
 * @param {string} clinicName - Clinic name for short code
 * @param {string} doctorName - Doctor name for short code
 * @returns {Promise<string>} Unique patient code
 */
export async function generatePatientCode(clinicId, doctorId, clinicName, doctorName) {
  try {
    // Generate short codes
    const clinicShort = generateShortCode(clinicName);
    const doctorShort = generateShortCode(doctorName, 2);
    
    // Create counter key
    const counterKey = `patient_${clinicId}_${doctorId}`;
    
    // Atomically increment counter
    const counter = await Counter.findByIdAndUpdate(
      counterKey,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    
    // Format sequence number with leading zeros
    const sequence = String(counter.seq).padStart(4, '0');
    
    // Generate random suffix for additional uniqueness
    const randomSuffix = nanoid(3).toUpperCase();
    
    // Combine to form patient code
    const patientCode = `${clinicShort}-${doctorShort}-${sequence}-${randomSuffix}`;
    
    logger.info({ patientCode, clinicId, doctorId }, 'Generated patient code');
    return patientCode;
  } catch (error) {
    logger.error({ error, clinicId, doctorId }, 'Error generating patient code');
    throw error;
  }
}

/**
 * Generate short code from name
 * @param {string} name - Full name
 * @param {number} length - Length of short code
 * @returns {string} Short code
 */
function generateShortCode(name, length = 3) {
  if (!name) return nanoid(length).toUpperCase();
  
  // Remove special characters and split into words
  const words = name.toUpperCase().replace(/[^A-Z0-9\s]/g, '').split(/\s+/);
  
  if (words.length === 1) {
    // Single word: take first N characters
    return words[0].substring(0, length);
  } else {
    // Multiple words: take first letter of each word
    return words.map(w => w[0]).join('').substring(0, length);
  }
}

/**
 * Validate patient code format
 * @param {string} code - Patient code to validate
 * @returns {boolean} True if valid
 */
export function validatePatientCode(code) {
  // Format: XXX-XX-0000-XXX (letters/numbers allowed)
  const pattern = /^[A-Z0-9]{2,4}-[A-Z0-9]{2}-\d{4}-[A-Z0-9]{3}$/;
  return pattern.test(code);
}

export default {
  generatePatientCode,
  validatePatientCode,
};
