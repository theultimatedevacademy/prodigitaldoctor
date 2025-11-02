/**
 * Application-wide constants
 * Contains API endpoints, configuration values, and enums
 * Matches web app constants for consistency
 */

// API Base URL - defaults to localhost for development
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// API Endpoints (base URL already includes /api)
export const API_ENDPOINTS = {
  // Auth
  ME: '/auth/me',
  UPDATE_MY_ROLE: '/auth/my-role',

  // Patients
  PATIENTS: '/patients',
  PATIENT_BY_ID: (id) => `/patients/${id}`,
  SEARCH_PATIENTS_FOR_APPOINTMENT: '/appointments/search-patients',

  // Clinics
  CLINICS: '/clinics',
  CLINIC_BY_ID: (id) => `/clinics/${id}`,
  INVITE_STAFF: (clinicId) => `/clinics/${clinicId}/invite`,
  ACCEPT_INVITATION: (clinicId) => `/clinics/${clinicId}/accept-invite`,
  REJECT_INVITATION: (clinicId) => `/clinics/${clinicId}/reject-invite`,
  REMOVE_STAFF: (clinicId, userId) => `/clinics/${clinicId}/staff/${userId}`,
  PENDING_INVITATIONS: `/auth/invitations/pending`, // Get all pending invitations for current user

  // Appointments
  APPOINTMENTS: '/appointments',
  APPOINTMENT_BY_ID: (id) => `/appointments/${id}`,
  FIRST_VISIT_APPOINTMENT: '/appointments/first-visit',
  FOLLOW_UP_APPOINTMENT: '/appointments/follow-up',
  APPOINTMENT_VITALS: (id) => `/appointments/${id}/vitals`,
  APPOINTMENT_CLINICAL_NOTES: (id) => `/appointments/${id}/clinical-notes`,
  APPOINTMENT_STATUS: (id) => `/appointments/${id}/status`,
  APPOINTMENT_ASSIGN_DOCTOR: (id) => `/appointments/${id}/assign-doctor`,
  APPOINTMENT_CANCEL: (id) => `/appointments/${id}/cancel`,
  APPOINTMENT_COMPLETE: (id) => `/appointments/${id}/complete`,
  APPOINTMENT_CALENDAR: '/appointments/calendar',

  // Prescriptions
  PRESCRIPTIONS: '/prescriptions',
  PRESCRIPTION_BY_ID: (id) => `/prescriptions/${id}`,
  PRESCRIPTION_PDF_DATA: (id) => `/prescriptions/${id}/pdf-data`,
  PRESCRIPTION_PDF: (id) => `/prescriptions/${id}/pdf`,
  PRESCRIPTION_STATS: '/prescriptions/stats',

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

  // Analytics
  ANALYTICS_DASHBOARD: '/analytics/dashboard',
  ANALYTICS_APPOINTMENTS: '/analytics/appointments',
  ANALYTICS_PRESCRIPTIONS: '/analytics/prescriptions',

  // Subscription
  SUBSCRIPTION: '/subscription',
  SUBSCRIPTION_UPGRADE: '/subscription/upgrade',
  SUBSCRIPTION_CANCEL: '/subscription/cancel',

  // Admin
  ADMIN_SEED: '/admin/seed',
  ADMIN_USERS: '/admin/users',
  ADMIN_STATS: '/admin/stats',
};

// User Roles
export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  STAFF: 'staff',
  CLINIC_OWNER: 'clinic_owner',
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

// Appointment Status Labels (for display)
export const APPOINTMENT_STATUS_LABELS = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'Scheduled',
  [APPOINTMENT_STATUS.CONFIRMED]: 'Confirmed',
  [APPOINTMENT_STATUS.IN_PROGRESS]: 'In Progress',
  [APPOINTMENT_STATUS.COMPLETED]: 'Completed',
  [APPOINTMENT_STATUS.CANCELLED]: 'Cancelled',
  [APPOINTMENT_STATUS.NO_SHOW]: 'No Show',
};

// Appointment Status Colors (for badges)
export const APPOINTMENT_STATUS_COLORS = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'blue',
  [APPOINTMENT_STATUS.CONFIRMED]: 'green',
  [APPOINTMENT_STATUS.IN_PROGRESS]: 'yellow',
  [APPOINTMENT_STATUS.COMPLETED]: 'gray',
  [APPOINTMENT_STATUS.CANCELLED]: 'red',
  [APPOINTMENT_STATUS.NO_SHOW]: 'orange',
};

// Visit Types
export const VISIT_TYPES = {
  FIRST_VISIT: 'first-visit',
  FOLLOW_UP: 'follow-up',
};

// Visit Type Labels
export const VISIT_TYPE_LABELS = {
  [VISIT_TYPES.FIRST_VISIT]: 'First Visit',
  [VISIT_TYPES.FOLLOW_UP]: 'Follow-up',
};

// DDI Severity Levels
export const DDI_SEVERITY = {
  MINOR: 'minor',
  MODERATE: 'moderate',
  MAJOR: 'major',
  CONTRAINDICATED: 'contraindicated',
};

// DDI Severity Labels
export const DDI_SEVERITY_LABELS = {
  [DDI_SEVERITY.MINOR]: 'Minor',
  [DDI_SEVERITY.MODERATE]: 'Moderate',
  [DDI_SEVERITY.MAJOR]: 'Major',
  [DDI_SEVERITY.CONTRAINDICATED]: 'Contraindicated',
};

// DDI Severity Colors
export const DDI_SEVERITY_COLORS = {
  [DDI_SEVERITY.MINOR]: 'blue',
  [DDI_SEVERITY.MODERATE]: 'yellow',
  [DDI_SEVERITY.MAJOR]: 'orange',
  [DDI_SEVERITY.CONTRAINDICATED]: 'red',
};

// Gender Options
export const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
  { value: 'U', label: 'Prefer not to say' },
];

// Gender Labels
export const GENDER_LABELS = {
  M: 'Male',
  F: 'Female',
  O: 'Other',
  U: 'Prefer not to say',
};

// Medication Frequencies
export const MEDICATION_FREQUENCIES = [
  { value: 'OD', label: 'Once Daily (OD)' },
  { value: 'BID', label: 'Twice Daily (BID)' },
  { value: 'TID', label: 'Three Times Daily (TID)' },
  { value: 'QID', label: 'Four Times Daily (QID)' },
  { value: 'PRN', label: 'As Needed (PRN)' },
  { value: 'STAT', label: 'Immediately (STAT)' },
];

// Medication Frequency Labels
export const MEDICATION_FREQUENCY_LABELS = {
  OD: 'Once Daily',
  BID: 'Twice Daily',
  TID: 'Three Times Daily',
  QID: 'Four Times Daily',
  PRN: 'As Needed',
  STAT: 'Immediately',
};

// Dosage Units
export const DOSAGE_UNITS = [
  { value: 'mg', label: 'mg' },
  { value: 'g', label: 'g' },
  { value: 'mcg', label: 'mcg' },
  { value: 'ml', label: 'ml' },
  { value: 'units', label: 'units' },
  { value: 'tablets', label: 'tablets' },
  { value: 'capsules', label: 'capsules' },
  { value: 'drops', label: 'drops' },
  { value: 'puffs', label: 'puffs' },
];

// Duration Units
export const DURATION_UNITS = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
];

// Medication Categories
export const MEDICATION_CATEGORIES = [
  'Antibiotic',
  'Analgesic',
  'Antihypertensive',
  'Antidiabetic',
  'Antihistamine',
  'Antacid',
  'Vitamin',
  'Supplement',
  'Other',
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
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB in bytes
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    PDF: ['application/pdf'],
    DOCUMENT: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  },
  ALLOWED_EXTENSIONS: {
    IMAGE: ['.jpg', '.jpeg', '.png', '.webp'],
    PDF: ['.pdf'],
    DOCUMENT: ['.pdf', '.jpg', '.jpeg', '.png'],
  },
};

// Toast auto-dismiss duration (in ms)
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  INFO: 4000,
  WARNING: 4000,
};

// Query keys for React Query
export const QUERY_KEYS = {
  // Auth
  ME: ['me'],

  // Patients
  PATIENTS: (clinicId, filters = {}) => ['patients', clinicId, filters],
  PATIENT: (id) => ['patient', id],
  PATIENT_HISTORY: (id) => ['patient-history', id],
  SEARCH_PATIENTS: (query, clinicId) => ['search-patients', query, clinicId],

  // Clinics
  CLINICS: ['clinics'],
  CLINIC: (id) => ['clinic', id],
  PENDING_INVITATIONS: ['pending-invitations'], // All pending invitations for current user

  // Appointments
  APPOINTMENTS: ['appointments'],
  APPOINTMENT: (id) => ['appointment', id],
  APPOINTMENT_CALENDAR: ['appointment-calendar'],

  // Prescriptions
  PRESCRIPTIONS: ['prescriptions'],
  PRESCRIPTION: (id) => ['prescription', id],
  PRESCRIPTION_PDF_DATA: (id) => ['prescription-pdf-data', id],
  PRESCRIPTION_STATS: ['prescription-stats'],

  // Medications
  MEDICATIONS: ['medications'],
  MEDICATION: (id) => ['medication', id],
  MEDICATIONS_SEARCH: ['medications-search'],

  // Analytics
  DASHBOARD_STATS: ['dashboard-stats'],
  ANALYTICS_APPOINTMENTS: ['analytics-appointments'],
  ANALYTICS_PRESCRIPTIONS: ['analytics-prescriptions'],

  // Subscription
  SUBSCRIPTION: ['subscription'],
};

// Cache times (in milliseconds)
export const CACHE_TIMES = {
  SHORT: 1 * 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 10 * 60 * 1000, // 10 minutes
  VERY_LONG: 30 * 60 * 1000, // 30 minutes
};

// Stale times (in milliseconds)
export const STALE_TIMES = {
  SHORT: 30 * 1000, // 30 seconds
  MEDIUM: 2 * 60 * 1000, // 2 minutes
  LONG: 5 * 60 * 1000, // 5 minutes
  VERY_LONG: 10 * 60 * 1000, // 10 minutes
};

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
};

// Subscription Plan Labels
export const SUBSCRIPTION_PLAN_LABELS = {
  [SUBSCRIPTION_PLANS.FREE]: 'Free',
  [SUBSCRIPTION_PLANS.BASIC]: 'Basic',
  [SUBSCRIPTION_PLANS.PRO]: 'Pro',
  [SUBSCRIPTION_PLANS.ENTERPRISE]: 'Enterprise',
};

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  TRIAL: 'trial',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY', // Jan 01, 2024
  DISPLAY_WITH_TIME: 'MMM DD, YYYY hh:mm A', // Jan 01, 2024 10:30 AM
  API: 'YYYY-MM-DD', // 2024-01-01
  API_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss', // 2024-01-01T10:30:00
  TIME_ONLY: 'hh:mm A', // 10:30 AM
  TIME_24H: 'HH:mm', // 10:30
};

// Notification Types
export const NOTIFICATION_TYPES = {
  APPOINTMENT_REMINDER: 'appointment_reminder',
  APPOINTMENT_CREATED: 'appointment_created',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  APPOINTMENT_COMPLETED: 'appointment_completed',
  PRESCRIPTION_CREATED: 'prescription_created',
  INVITATION_RECEIVED: 'invitation_received',
  INVITATION_ACCEPTED: 'invitation_accepted',
  INVITATION_REJECTED: 'invitation_rejected',
  STAFF_ADDED: 'staff_added',
  STAFF_REMOVED: 'staff_removed',
  DEVELOPER_UPDATE: 'developer_update',
  PROMOTIONAL: 'promotional',
};

// Notification Priority
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  DEFAULT: 'default',
  HIGH: 'high',
  MAX: 'max',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'No internet connection. Please check your network.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  APPOINTMENT_CREATED: 'Appointment created successfully',
  APPOINTMENT_UPDATED: 'Appointment updated successfully',
  APPOINTMENT_CANCELLED: 'Appointment cancelled successfully',
  APPOINTMENT_COMPLETED: 'Appointment completed successfully',
  VITALS_SAVED: 'Vitals saved successfully',
  CLINICAL_NOTES_SAVED: 'Clinical notes saved successfully',
  PRESCRIPTION_CREATED: 'Prescription created successfully',
  PRESCRIPTION_UPDATED: 'Prescription updated successfully',
  PRESCRIPTION_DELETED: 'Prescription deleted successfully',
  PATIENT_CREATED: 'Patient created successfully',
  PATIENT_UPDATED: 'Patient updated successfully',
  CLINIC_CREATED: 'Clinic created successfully',
  CLINIC_UPDATED: 'Clinic updated successfully',
  INVITATION_SENT: 'Invitation sent successfully',
  INVITATION_ACCEPTED: 'Invitation accepted successfully',
  INVITATION_REJECTED: 'Invitation rejected successfully',
  STAFF_REMOVED: 'Staff member removed successfully',
  PDF_GENERATED: 'PDF generated successfully',
  FILE_UPLOADED: 'File uploaded successfully',
};

// Validation Rules
export const VALIDATION_RULES = {
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    PATTERN: /^[0-9]{10,15}$/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  PATIENT_CODE: {
    MIN_LENGTH: 4,
    MAX_LENGTH: 20,
  },
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Ocura360 Clinic',
  APP_VERSION: '1.0.0',
  SUPPORT_EMAIL: 'hello@ocura360.com',
  SUPPORT_PHONE: '+91',
  TERMS_URL: 'https://ocura360.com/terms',
  PRIVACY_URL: 'https://ocura360.com/privacy',
};

// Feature Flags (for gradual rollout)
export const FEATURE_FLAGS = {
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_PDF_GENERATION: true,
  ENABLE_DOCUMENT_UPLOAD: true,
  ENABLE_ABDM_INTEGRATION: false, // Future feature
  ENABLE_ANALYTICS: true,
  ENABLE_SUBSCRIPTION: true,
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  USER_ROLES,
  APPOINTMENT_STATUS,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
  VISIT_TYPES,
  VISIT_TYPE_LABELS,
  DDI_SEVERITY,
  DDI_SEVERITY_LABELS,
  DDI_SEVERITY_COLORS,
  GENDER_OPTIONS,
  GENDER_LABELS,
  MEDICATION_FREQUENCIES,
  MEDICATION_FREQUENCY_LABELS,
  DOSAGE_UNITS,
  DURATION_UNITS,
  MEDICATION_CATEGORIES,
  PAGINATION,
  DEBOUNCE_DELAYS,
  FILE_UPLOAD,
  TOAST_DURATION,
  QUERY_KEYS,
  CACHE_TIMES,
  STALE_TIMES,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_PLAN_LABELS,
  SUBSCRIPTION_STATUS,
  DATE_FORMATS,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITY,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  APP_CONFIG,
  FEATURE_FLAGS,
};
