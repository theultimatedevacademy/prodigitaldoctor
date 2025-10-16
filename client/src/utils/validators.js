/**
 * Utility functions for validation
 * Used with react-hook-form and Zod schemas
 */

import { z } from 'zod';

/**
 * Validate Indian phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export function isValidPhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || (cleaned.length === 12 && cleaned.startsWith('91'));
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate ABHA (Ayushman Bharat Health Account) ID format
 * ABHA ID is 14 digits
 * @param {string} abhaId - ABHA ID to validate
 * @returns {boolean} True if valid
 */
export function isValidAbhaId(abhaId) {
  if (!abhaId) return false;
  const cleaned = abhaId.replace(/\D/g, '');
  return cleaned.length === 14;
}

/**
 * Validate date is not in the future
 * @param {Date|string} date - Date to validate
 * @returns {boolean} True if valid
 */
export function isNotFutureDate(date) {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj <= new Date();
}

/**
 * Validate age is within range
 * @param {Date|string} dob - Date of birth
 * @param {number} minAge - Minimum age (default: 0)
 * @param {number} maxAge - Maximum age (default: 150)
 * @returns {boolean} True if valid
 */
export function isValidAge(dob, minAge = 0, maxAge = 150) {
  if (!dob) return false;
  const today = new Date();
  const birthDate = typeof dob === 'string' ? new Date(dob) : dob;
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= minAge && age <= maxAge;
}

// ===========================
// Zod Schemas for Forms
// ===========================

/**
 * Patient form schema
 */
export const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  dob: z.string().or(z.date()).refine(isNotFutureDate, 'Date of birth cannot be in the future'),
  gender: z.enum(['M', 'F', 'O', 'U'], { required_error: 'Please select a gender' }),
  phone: z.string().refine(isValidPhone, 'Please enter a valid 10-digit phone number'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  address: z.string().max(500, 'Address is too long').optional(),
  emergencyContact: z.string().refine(isValidPhone, 'Please enter a valid emergency contact number').optional().or(z.literal('')),
  bloodGroup: z.string().optional(),
  allergies: z.string().max(500, 'Allergies description is too long').optional(),
  abhaId: z.string().refine(val => !val || isValidAbhaId(val), 'ABHA ID must be 14 digits').optional().or(z.literal('')),
});

/**
 * Clinic form schema
 */
export const clinicSchema = z.object({
  name: z.string().min(3, 'Clinic name must be at least 3 characters').max(200, 'Name is too long'),
  address: z.string().min(5, 'Address must be at least 5 characters').max(500, 'Address is too long'),
  phone: z.string().refine(isValidPhone, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  registrationNumber: z.string().max(100, 'Registration number is too long').optional(),
  specialization: z.array(z.string()).optional(),
});

/**
 * Appointment form schema
 */
export const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient'),
  clinicId: z.string().min(1, 'Please select a clinic'),
  doctorId: z.string().min(1, 'Please select a doctor'),
  date: z.string().or(z.date()),
  time: z.string().min(1, 'Please select a time'),
  duration: z.number().min(5, 'Duration must be at least 5 minutes').max(480, 'Duration cannot exceed 8 hours').default(30),
  reason: z.string().max(500, 'Reason is too long').optional(),
  notes: z.string().max(1000, 'Notes are too long').optional(),
});

/**
 * Prescription medication item schema
 */
export const medicationItemSchema = z.object({
  medicationId: z.string().min(1, 'Please select a medication'),
  dosage: z.string().min(1, 'Please enter dosage'),
  frequency: z.string().min(1, 'Please select frequency'),
  duration: z.string().min(1, 'Please enter duration'),
  instructions: z.string().max(500, 'Instructions are too long').optional(),
});

/**
 * Prescription form schema
 */
export const prescriptionSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient'),
  clinicId: z.string().min(1, 'Please select a clinic'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  appointmentId: z.string().optional(),
  medications: z.array(medicationItemSchema).min(1, 'Please add at least one medication'),
  notes: z.string().max(1000, 'Notes are too long').optional(),
  followUpDate: z.string().or(z.date()).optional(),
});

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * File upload validation
 */
export const validateFile = (file, maxSizeMB = 10, allowedTypes = []) => {
  const errors = [];
  
  // Check file size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};
