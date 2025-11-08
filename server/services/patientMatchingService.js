/**
 * Patient Matching Service
 * Implements smart patient matching using phone number and name similarity
 * Uses Jaro-Winkler algorithm for fuzzy name matching
 * Only matches patients with cancelled or no appointments
 */

import Patient from '../models/patient.js';
import Appointment from '../models/appointment.js';
import logger from '../utils/logger.js';
import { generatePatientCode } from '../utils/patientCodeGenerator.js';
import mongoose from 'mongoose';

/**
 * Calculate Jaro-Winkler similarity between two strings
 * Returns a score between 0 (no match) and 1 (exact match)
 * @param {string} s1 - First string
 * @param {string} s2 - Second string
 * @returns {number} Similarity score (0-1)
 */
function jaroWinklerSimilarity(s1, s2) {
  // Normalize strings
  s1 = s1 || '';
  s2 = s2 || '';
  
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;

  // Jaro Similarity calculation
  const matchWindow = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);
  
  let matches = 0;
  let transpositions = 0;

  // Find matches
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, s2.length);

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  // Find transpositions
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const jaro = (matches / s1.length + matches / s2.length + 
                (matches - transpositions / 2) / matches) / 3;

  // Winkler modification (boost for common prefix)
  const prefixLength = Math.min(4, Math.max(
    ...Array.from({ length: Math.min(s1.length, s2.length) }, (_, i) => i)
      .filter(i => s1[i] === s2[i])
      .map(i => i + 1)
  ) || 0);

  return jaro + prefixLength * 0.1 * (1 - jaro);
}

/**
 * Normalize name for matching
 * - Lowercase
 * - Trim whitespace
 * - Remove common titles
 * - Normalize spacing
 * @param {string} name - Raw name
 * @returns {string} Normalized name
 */
function normalizeName(name) {
  if (!name) return '';
  
  let normalized = name.toLowerCase().trim();
  
  // Remove common Indian titles (case-insensitive)
  const titles = ['dr', 'mr', 'mrs', 'ms', 'shri', 'smt', 'miss'];
  const words = normalized.split(/\s+/);
  
  // Remove title if it's the first word
  if (words.length > 1 && titles.includes(words[0])) {
    words.shift();
  }
  
  // Remove 'kumari' if it's the last word
  if (words.length > 1 && words[words.length - 1] === 'kumari') {
    words.pop();
  }
  
  // Join and normalize spacing
  normalized = words.join(' ').replace(/\s+/g, ' ').trim();
  
  return normalized;
}

/**
 * Calculate name similarity between two names
 * @param {string} name1 - First name
 * @param {string} name2 - Second name
 * @returns {number} Similarity score (0-1)
 */
export function calculateNameSimilarity(name1, name2) {
  const normalized1 = normalizeName(name1);
  const normalized2 = normalizeName(name2);
  
  return jaroWinklerSimilarity(normalized1, normalized2);
}

/**
 * Find eligible patients for matching
 * Only returns patients with cancelled appointments or no appointments
 * Uses aggregation for optimal performance
 * @param {string} phone - Phone number
 * @param {string} clinicId - Clinic ID
 * @returns {Promise<Array>} Array of eligible patient documents
 */
async function findEligiblePatients(phone, clinicId) {
  try {
    const patients = await Patient.aggregate([
      // Step 1: Match by phone and clinic
      {
        $match: {
          phone: phone,
          'patientCodes.clinic': new mongoose.Types.ObjectId(clinicId)
        }
      },
      // Step 2: Join with appointments collection
      {
        $lookup: {
          from: 'appointments',
          localField: '_id',
          foreignField: 'patient',
          as: 'appointments'
        }
      },
      // Step 3: Count appointments by status
      {
        $addFields: {
          totalAppointments: { $size: '$appointments' },
          cancelledCount: {
            $size: {
              $filter: {
                input: '$appointments',
                cond: { $eq: ['$$this.status', 'cancelled'] }
              }
            }
          },
          nonCancelledCount: {
            $size: {
              $filter: {
                input: '$appointments',
                cond: { $ne: ['$$this.status', 'cancelled'] }
              }
            }
          }
        }
      },
      // Step 4: Filter - Keep only patients with:
      // - No appointments (totalAppointments = 0)
      // - OR only cancelled appointments (nonCancelledCount = 0 AND totalAppointments > 0)
      {
        $match: {
          $or: [
            { totalAppointments: 0 },
            { 
              $and: [
                { nonCancelledCount: 0 },
                { totalAppointments: { $gt: 0 } }
              ]
            }
          ]
        }
      },
      // Step 5: Clean up - remove temporary fields
      {
        $project: {
          appointments: 0,
          totalAppointments: 0,
          cancelledCount: 0,
          nonCancelledCount: 0
        }
      }
    ]);

    logger.info({
      phone,
      clinicId,
      eligibleCount: patients.length
    }, 'Found eligible patients (no appointments or only cancelled)');

    return patients;
  } catch (error) {
    logger.error({ error, phone, clinicId }, 'Error finding eligible patients');
    throw error;
  }
}

/**
 * Find matching patient based on phone and name
 * Only matches patients with cancelled or no appointments
 * @param {string} phone - Phone number
 * @param {string} name - Patient name
 * @param {string} clinicId - Clinic ID
 * @returns {Promise<Object|null>} Matching patient object or null
 */
export async function findMatchingPatient(phone, name, clinicId) {
  try {
    // Get similarity threshold from environment (default 80%)
    const thresholdPercent = parseInt(process.env.PATIENT_NAME_MATCH_THRESHOLD || '80');
    const threshold = thresholdPercent / 100;
    
    logger.info({ 
      phone, 
      name, 
      clinicId, 
      threshold: thresholdPercent 
    }, 'Starting patient matching');

    // Find eligible patients (phone match + only cancelled or no appointments)
    const eligiblePatients = await findEligiblePatients(phone, clinicId);

    if (eligiblePatients.length === 0) {
      return null;
    }

    // Calculate name similarity for each eligible patient
    const matches = eligiblePatients.map(patient => {
      const similarity = calculateNameSimilarity(name, patient.name);
      
      // Find the patient code for this clinic
      // Note: aggregation returns plain objects, so clinic is ObjectId not populated
      const patientCode = patient.patientCodes.find(
        pc => pc.clinic.toString() === clinicId.toString()
      );

      return {
        patient,
        similarity,
        patientCode: patientCode?.code
      };
    });

    // Filter matches above threshold
    const validMatches = matches.filter(m => m.similarity >= threshold);

    logger.info({
      totalCandidates: matches.length,
      validMatches: validMatches.length,
      matchDetails: matches.map(m => ({
        name: m.patient.name,
        similarity: (m.similarity * 100).toFixed(1) + '%',
        patientCode: m.patientCode
      }))
    }, 'Name similarity calculated');

    if (validMatches.length === 0) {
      logger.info({ threshold: thresholdPercent }, 'No matches above threshold');
      return null;
    }

    // Sort by similarity (desc), then by creation date (desc)
    validMatches.sort((a, b) => {
      if (Math.abs(a.similarity - b.similarity) > 0.01) {
        return b.similarity - a.similarity; // Higher similarity first
      }
      return new Date(b.patient.createdAt) - new Date(a.patient.createdAt); // More recent first
    });

    // Log warning if multiple matches found
    if (validMatches.length > 1) {
      logger.warn({
        phone,
        nameSearched: name,
        matchCount: validMatches.length,
        matches: validMatches.map(m => ({
          id: m.patient._id,
          name: m.patient.name,
          similarity: (m.similarity * 100).toFixed(1) + '%',
          patientCode: m.patientCode
        })),
        selectedMatch: validMatches[0].patient._id
      }, 'Multiple patients matched - selected highest similarity');
    }

    // Return top match
    return {
      matched: true,
      patient: validMatches[0].patient,
      patientCode: validMatches[0].patientCode,
      similarity: validMatches[0].similarity,
      message: 'Existing patient found and reused'
    };

  } catch (error) {
    logger.error({ error, phone, name, clinicId }, 'Error in findMatchingPatient');
    throw error;
  }
}

/**
 * Find or create patient with smart matching
 * @param {Object} patientData - Patient data
 * @param {string} clinicId - Clinic ID
 * @param {string} doctorId - Doctor ID
 * @param {string} clinicName - Clinic name
 * @param {string} doctorName - Doctor name
 * @returns {Promise<Object>} Patient object with metadata
 */
export async function findOrCreatePatient(patientData, clinicId, doctorId, clinicName, doctorName) {
  try {
    const { name, phone } = patientData;
    
    logger.info({
      phone,
      name,
      clinicId,
      doctorId,
      clinicName,
      doctorName
    }, '>>> findOrCreatePatient called');

    // Try to find matching patient
    logger.info({ phone, name, clinicId }, 'Searching for matching patient...');
    const matchResult = await findMatchingPatient(phone, name, clinicId);
    
    logger.info({
      matched: matchResult?.matched,
      patientId: matchResult?.patient?._id,
      similarity: matchResult?.similarity
    }, 'Patient matching result');

    if (matchResult && matchResult.matched) {
      // Patient matched - update with new booking data and reuse
      const oldName = matchResult.patient.name;
      
      // Get the actual patient document from database to update
      const patientDoc = await Patient.findById(matchResult.patient._id);
      
      if (!patientDoc) {
        logger.error({ patientId: matchResult.patient._id }, 'Matched patient not found in database');
        throw new Error('Matched patient document not found');
      }
      
      // Update patient fields with new booking data
      patientDoc.name = patientData.name;  // Use latest name
      patientDoc.age = patientData.age !== undefined ? patientData.age : patientDoc.age;
      patientDoc.gender = patientData.gender || patientDoc.gender;
      patientDoc.email = patientData.email || patientDoc.email;
      
      // Update addresses if provided
      if (patientData.addresses && patientData.addresses.length > 0) {
        patientDoc.addresses = patientData.addresses;
      }
      
      // Update other optional fields if provided
      if (patientData.bloodGroup) patientDoc.bloodGroup = patientData.bloodGroup;
      if (patientData.allergies) patientDoc.allergies = patientData.allergies;
      if (patientData.emergencyContact) patientDoc.emergencyContact = patientData.emergencyContact;
      if (patientData.abhaId) {
        patientDoc.abhaId = patientData.abhaId;
        patientDoc.abhaNumber = patientData.abhaId;
      }
      if (patientData.notes) patientDoc.notes = patientData.notes;
      
      // Save updated patient
      await patientDoc.save();
      
      logger.info({
        event: 'patient_matched_and_updated',
        phone: phone,
        oldName: oldName,
        newName: patientData.name,
        similarity: (matchResult.similarity * 100).toFixed(1) + '%',
        patientId: patientDoc._id,
        patientCode: matchResult.patientCode,
        clinicId: clinicId
      }, 'Patient record reused and updated with new booking data');

      return {
        patient: patientDoc,
        patientCode: matchResult.patientCode,
        isNew: false,
        reused: true,
        updated: true,
        similarity: matchResult.similarity,
        message: 'Existing patient record reused and updated'
      };
    }

    // No match found - create new patient
    const patientCode = await generatePatientCode(clinicId, doctorId, clinicName, doctorName);

    const newPatient = new Patient({
      ...patientData,
      patientCodes: [{
        clinic: clinicId,
        doctor: doctorId,
        code: patientCode,
        createdAt: new Date(),
        active: true
      }]
    });

    await newPatient.save();

    logger.info({
      event: 'patient_created',
      phone: phone,
      name: name,
      patientId: newPatient._id,
      patientCode: patientCode,
      clinicId: clinicId
    }, 'New patient record created');

    return {
      patient: newPatient,
      patientCode: patientCode,
      isNew: true,
      reused: false,
      message: 'New patient created successfully'
    };

  } catch (error) {
    logger.error({ error, patientData, clinicId, doctorId }, 'Error in findOrCreatePatient');
    throw error;
  }
}

export default {
  calculateNameSimilarity,
  findMatchingPatient,
  findOrCreatePatient,
  normalizeName
};
