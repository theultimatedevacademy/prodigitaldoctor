/**
 * FHIR R4 Mapper Utility
 * TODO: Implement ABDM-compliant FHIR payload generation
 * Placeholder for future ABDM integration
 */

import logger from './logger.js';

/**
 * Map patient to FHIR Patient resource
 * TODO: Implement ABDM FHIR R4 Patient resource mapping
 * 
 * @param {Object} patient - Patient document
 * @returns {Object} FHIR Patient resource
 */
export function mapPatientToFHIR(patient) {
  logger.warn('FHIR mapping not implemented - using placeholder');
  
  // Placeholder FHIR Patient resource
  return {
    resourceType: 'Patient',
    id: patient._id.toString(),
    identifier: [
      {
        system: 'https://ndhm.gov.in/patient',
        value: patient.abhaNumber || patient._id.toString(),
      },
    ],
    name: [
      {
        text: patient.name,
      },
    ],
    telecom: [
      {
        system: 'phone',
        value: patient.phone,
      },
    ],
    gender: patient.gender === 'M' ? 'male' : patient.gender === 'F' ? 'female' : 'other',
    birthDate: patient.dob ? patient.dob.toISOString().split('T')[0] : undefined,
  };
}

/**
 * Map prescription to FHIR MedicationRequest bundle
 * TODO: Implement ABDM FHIR R4 MedicationRequest bundle
 * 
 * @param {Object} prescription - Prescription document
 * @returns {Object} FHIR Bundle
 */
export function mapPrescriptionToFHIR(prescription) {
  logger.warn('FHIR prescription mapping not implemented - using placeholder');
  
  // Placeholder FHIR Bundle
  return {
    resourceType: 'Bundle',
    type: 'document',
    timestamp: new Date().toISOString(),
    entry: [
      {
        resource: {
          resourceType: 'MedicationRequest',
          id: prescription._id?.toString() || 'temp-id',
          status: 'active',
          intent: 'order',
          medicationCodeableConcept: {
            text: 'Medications - see prescription details',
          },
        },
      },
    ],
  };
}

/**
 * Map practitioner (doctor) to FHIR Practitioner resource
 * TODO: Implement ABDM FHIR R4 Practitioner resource with HPR ID
 */
export function mapPractitionerToFHIR(doctor) {
  logger.warn('FHIR practitioner mapping not implemented - using placeholder');
  
  return {
    resourceType: 'Practitioner',
    id: doctor._id.toString(),
    identifier: [
      {
        system: 'https://ndhm.gov.in/hpr',
        value: doctor.hprId || doctor._id.toString(),
      },
    ],
    name: [
      {
        text: doctor.name,
      },
    ],
  };
}

export default {
  mapPatientToFHIR,
  mapPrescriptionToFHIR,
  mapPractitionerToFHIR,
};
