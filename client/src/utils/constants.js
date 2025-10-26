/**
 * Application-wide constants
 * Contains API endpoints, configuration values, and enums
 */

// API Base URL - defaults to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// API Endpoints (base URL already includes /api)
export const API_ENDPOINTS = {
  // Auth
  ME: '/auth/me',
  UPDATE_MY_ROLE: '/auth/my-role',
  
  // Patients
  PATIENTS: '/patients',
  PATIENT_BY_ID: (id) => `/patients/${id}`,
  
  // Clinics
  CLINICS: '/clinics',
  CLINIC_BY_ID: (id) => `/clinics/${id}`,
  
  // Appointments
  APPOINTMENTS: '/appointments',
  APPOINTMENT_BY_ID: (id) => `/appointments/${id}`,
  
  // Prescriptions
  PRESCRIPTIONS: '/prescriptions',
  PRESCRIPTION_BY_ID: (id) => `/prescriptions/${id}`,
  
  // Medications
  MEDICATIONS: '/medications',
  MEDICATIONS_SEARCH: '/medications/search',
  MEDICATION_BY_ID: (id) => `/medications/${id}`,
  
  // DDI (Drug-Drug Interactions)
  DDI_CHECK_MEDICATIONS: '/medications/check-ddi',
  DDI_CHECK_COMPOSITIONS: '/compositions/check-ddi',
  
  // Uploads
  UPLOAD_PRESIGN: '/uploads/presign',
  
  // ABDM
  ABDM_SHARE: '/abdm/share',
  
  // Admin
  ADMIN_SEED: '/admin/seed',
};

// User Roles
export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  STAFF: 'staff',
  ADMIN: 'admin',
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
};

// DDI Severity Levels
export const DDI_SEVERITY = {
  MINOR: 'minor',
  MODERATE: 'moderate',
  MAJOR: 'major',
  CONTRAINDICATED: 'contraindicated',
};

// Gender Options
export const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
  { value: 'U', label: 'Prefer not to say' },
];

// Medication Frequencies
export const MEDICATION_FREQUENCIES = [
  { value: 'OD', label: 'Once Daily (OD)' },
  { value: 'BID', label: 'Twice Daily (BID)' },
  { value: 'TID', label: 'Three Times Daily (TID)' },
  { value: 'QID', label: 'Four Times Daily (QID)' },
  { value: 'PRN', label: 'As Needed (PRN)' },
  { value: 'STAT', label: 'Immediately (STAT)' },
];

// Dosage Units
export const DOSAGE_UNITS = [
  { value: 'mg', label: 'mg' },
  { value: 'g', label: 'g' },
  { value: 'mcg', label: 'mcg' },
  { value: 'ml', label: 'ml' },
  { value: 'units', label: 'units' },
  { value: 'tablets', label: 'tablets' },
  { value: 'capsules', label: 'capsules' },
];

// Duration Units
export const DURATION_UNITS = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
];

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Debounce delays (in ms)
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  INPUT: 500,
};

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
    PDF: ['application/pdf'],
    DOCUMENT: ['application/pdf', 'image/jpeg', 'image/png'],
  },
};

// Toast auto-dismiss duration (in ms)
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  INFO: 4000,
};

// Query keys for React Query
export const QUERY_KEYS = {
  ME: ['me'],
  PATIENTS: ['patients'],
  PATIENT: (id) => ['patient', id],
  CLINICS: ['clinics'],
  CLINIC: (id) => ['clinic', id],
  APPOINTMENTS: ['appointments'],
  APPOINTMENT: (id) => ['appointment', id],
  PRESCRIPTIONS: ['prescriptions'],
  PRESCRIPTION: (id) => ['prescription', id],
  MEDICATIONS: ['medications'],
  MEDICATION: (id) => ['medication', id],
};

// Mock mode flag
export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';
