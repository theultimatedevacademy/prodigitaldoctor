// API Endpoints matching your backend
export const ENDPOINTS = {
  // Auth
  AUTH: {
    ME: "/auth/me",
    UPDATE_PROFILE: "/auth/profile",
    UPDATE_ROLE: "/auth/my-role",
  },

  // Clinics
  CLINICS: {
    LIST: "/clinics",
    CREATE: "/clinics",
    GET: (id) => `/clinics/${id}`,
    UPDATE: (id) => `/clinics/${id}`,
    SEARCH: "/clinics/search",
    INVITE: (id) => `/clinics/${id}/invite`,
    ACCEPT_INVITE: (id) => `/clinics/${id}/accept-invite`,
    PENDING_INVITATIONS: "/clinics/invitations/pending",
    REMOVE_STAFF: (clinicId, staffId) =>
      `/clinics/${clinicId}/staff/${staffId}`,
    PATIENTS: (id) => `/clinics/${id}/patients`,
    PRESCRIPTIONS: (id) => `/clinics/${id}/prescriptions`,
  },

  // Patients
  PATIENTS: {
    CREATE: "/patients",
    SEARCH: "/patients/search",
    GET: (id) => `/patients/${id}`,
    UPDATE: (id) => `/patients/${id}`,
    HISTORY: (id) => `/patients/${id}/history`,
    PRESCRIPTIONS: (id) => `/patients/${id}/prescriptions`,
    LINK_CODE: "/patients/link-code",
    LINKED: "/patients/linked",
  },

  // Appointments
  APPOINTMENTS: {
    LIST: "/appointments",
    CREATE: "/appointments",
    GET: (id) => `/appointments/${id}`,
    UPDATE: (id) => `/appointments/${id}`,
    CANCEL: (id) => `/appointments/${id}/cancel`,
    COMPLETE: (id) => `/appointments/${id}/complete`,
    CALENDAR: "/appointments/calendar",
  },

  // Medications
  MEDICATIONS: {
    SEARCH: "/medications/search",
    GET: (id) => `/medications/${id}`,
    CHECK_DDI: "/medications/check-ddi",
  },

  // Compositions
  COMPOSITIONS: {
    SEARCH: "/compositions/search",
    CHECK_DDI: "/compositions/check-ddi",
  },

  // Prescriptions
  PRESCRIPTIONS: {
    CREATE: "/prescriptions",
    GET: (id) => `/prescriptions/${id}`,
    PDF_DATA: (id) => `/prescriptions/${id}/pdf-data`,
    UPDATE_PDF: (id) => `/prescriptions/${id}/pdf`,
    STATS: "/prescriptions/stats",
  },

  // Uploads
  UPLOADS: {
    PRESIGN: "/uploads/presign",
    SIGNED_URL: "/uploads/signed-url",
  },

  // Analytics
  ANALYTICS: {
    CLINIC_SUMMARY: (id) => `/analytics/clinic/${id}/summary`,
    DOCTOR_SUMMARY: (id) => `/analytics/doctor/${id}/summary`,
    PATIENT_TRENDS: (id) => `/analytics/clinic/${id}/patient-trends`,
  },

  // Admin
  ADMIN: {
    USERS: "/admin/users",
    UPDATE_USER_STATUS: (id) => `/admin/users/${id}/status`,
    DELETE_USER: (id) => `/admin/users/${id}`,
    STATS: "/admin/stats",
    AUDIT_LOGS: "/admin/audit-logs",
    FRAUD_DETECTION: "/admin/fraud-detection",
    CREATE_MEDICATION: "/admin/medications",
    CREATE_COMPOSITION: "/admin/compositions",
    DDI: "/admin/ddi",
    UPDATE_DDI: (id) => `/admin/ddi/${id}`,
    DELETE_DDI: (id) => `/admin/ddi/${id}`,
  },
};
