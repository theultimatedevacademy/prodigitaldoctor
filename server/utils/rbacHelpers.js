/**
 * RBAC Helper Functions
 * Centralized role-checking and permission logic
 */

import Clinic from '../models/clinic.js';
import User from '../models/user.js';

/**
 * Get user's role in a specific clinic
 * @param {ObjectId} userId - User's MongoDB _id
 * @param {ObjectId} clinicId - Clinic's MongoDB _id
 * @returns {Promise<string|null>} 'clinic_owner' | 'doctor' | 'staff' | null
 */
export const getUserClinicRole = async (userId, clinicId) => {
  const clinic = await Clinic.findById(clinicId);
  if (!clinic) return null;

  // Check if user is owner
  if (clinic.owner.toString() === userId.toString()) {
    return 'clinic_owner';
  }

  // Check if user is staff
  const staffEntry = clinic.staff.find(
    (s) => s.user.toString() === userId.toString() && s.accepted
  );

  return staffEntry ? staffEntry.role : null;
};

/**
 * Check if user has access to clinic (any role)
 * @param {ObjectId} userId
 * @param {ObjectId} clinicId
 * @returns {Promise<boolean>}
 */
export const hasClinicAccess = async (userId, clinicId) => {
  const role = await getUserClinicRole(userId, clinicId);
  return role !== null;
};

/**
 * Check if user is clinic owner
 * @param {ObjectId} userId
 * @param {ObjectId} clinicId
 * @returns {Promise<boolean>}
 */
export const isClinicOwner = async (userId, clinicId) => {
  const role = await getUserClinicRole(userId, clinicId);
  return role === 'clinic_owner';
};

/**
 * Check if user can manage staff (owner only)
 * @param {ObjectId} userId
 * @param {ObjectId} clinicId
 * @returns {Promise<boolean>}
 */
export const canManageStaff = async (userId, clinicId) => {
  return await isClinicOwner(userId, clinicId);
};

/**
 * Check if user can create prescriptions (owner or doctor)
 * @param {ObjectId} userId
 * @param {ObjectId} clinicId
 * @returns {Promise<boolean>}
 */
export const canCreatePrescription = async (userId, clinicId) => {
  const role = await getUserClinicRole(userId, clinicId);
  return role === 'clinic_owner' || role === 'doctor';
};

/**
 * Check if user can view all appointments (owner or staff)
 * @param {ObjectId} userId
 * @param {ObjectId} clinicId
 * @returns {Promise<boolean>}
 */
export const canViewAllAppointments = async (userId, clinicId) => {
  const role = await getUserClinicRole(userId, clinicId);
  return role === 'clinic_owner' || role === 'staff';
};

/**
 * Check if user can view all patients (owner or staff)
 * @param {ObjectId} userId
 * @param {ObjectId} clinicId
 * @returns {Promise<boolean>}
 */
export const canViewAllPatients = async (userId, clinicId) => {
  const role = await getUserClinicRole(userId, clinicId);
  return role === 'clinic_owner' || role === 'staff';
};

/**
 * Check if user can view all prescriptions (owner or staff)
 * @param {ObjectId} userId
 * @param {ObjectId} clinicId
 * @returns {Promise<boolean>}
 */
export const canViewAllPrescriptions = async (userId, clinicId) => {
  const role = await getUserClinicRole(userId, clinicId);
  return role === 'clinic_owner' || role === 'staff';
};

/**
 * Check if user can access medication database (owner or doctor)
 * @param {ObjectId} userId
 * @param {ObjectId} clinicId
 * @returns {Promise<boolean>}
 */
export const canAccessMedications = async (userId, clinicId) => {
  const role = await getUserClinicRole(userId, clinicId);
  return role === 'clinic_owner' || role === 'doctor';
};

/**
 * Check if user can edit clinic settings (owner only)
 * @param {ObjectId} userId
 * @param {ObjectId} clinicId
 * @returns {Promise<boolean>}
 */
export const canEditClinicSettings = async (userId, clinicId) => {
  return await isClinicOwner(userId, clinicId);
};

/**
 * Get all patients that a doctor has seen (via appointments or prescriptions)
 * @param {ObjectId} doctorId
 * @param {ObjectId} clinicId
 * @returns {Promise<Array>} Array of patient IDs
 */
export const getDoctorPatients = async (doctorId, clinicId) => {
  const Appointment = (await import('../models/appointment.js')).default;
  const Prescription = (await import('../models/prescription.js')).default;

  // Get unique patient IDs from appointments
  const appointments = await Appointment.find({
    clinic: clinicId,
    doctor: doctorId,
  }).distinct('patient');

  // Get unique patient IDs from prescriptions
  const prescriptions = await Prescription.find({
    clinic: clinicId,
    doctor: doctorId,
  }).distinct('patient');

  // Combine and deduplicate
  const patientIds = [...new Set([...appointments, ...prescriptions])];
  return patientIds;
};

/**
 * Check if doctor has access to specific patient
 * @param {ObjectId} doctorId
 * @param {ObjectId} patientId
 * @param {ObjectId} clinicId
 * @returns {Promise<boolean>}
 */
export const doctorHasAccessToPatient = async (doctorId, patientId, clinicId) => {
  const doctorPatients = await getDoctorPatients(doctorId, clinicId);
  return doctorPatients.some((id) => id.toString() === patientId.toString());
};

export default {
  getUserClinicRole,
  hasClinicAccess,
  isClinicOwner,
  canManageStaff,
  canCreatePrescription,
  canViewAllAppointments,
  canViewAllPatients,
  canViewAllPrescriptions,
  canAccessMedications,
  canEditClinicSettings,
  getDoctorPatients,
  doctorHasAccessToPatient,
};
