// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || "http://localhost:5000/api",
  TIMEOUT: parseInt(process.env.API_TIMEOUT || "30000", 10),
};

// App Configuration
export const APP_CONFIG = {
  NAME: "Ocura360",
  VERSION: "1.0.0",
};

// User Roles
export const USER_ROLES = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  CLINIC_OWNER: "clinic_owner",
  STAFF: "staff",
  ADMIN: "admin",
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no-show",
};

// Gender Options
export const GENDER = {
  MALE: "M",
  FEMALE: "F",
  OTHER: "O",
};
