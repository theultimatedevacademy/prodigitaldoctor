/**
 * Appointment Routes
 */

import express from 'express';
import { body } from 'express-validator';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  completeAppointment,
  getCalendarView,
  createFirstVisitAppointment,
  createFollowUpAppointment,
  searchPatientsForAppointment,
  updateAppointmentVitals,
  updateClinicalNotes,
  updateAppointmentStatus,
  assignDoctorToAppointment,
} from '../controllers/appointmentController.js';
import { requireAuth } from '../middlewares/clerkAuth.js';
import { validate } from '../middlewares/validator.js';

const router = express.Router();

/**
 * @route   POST /api/appointments
 * @desc    Create new appointment
 * @access  Private
 */
router.post(
  '/',
  requireAuth,
  [
    body('clinic').notEmpty().withMessage('Clinic is required'),
    body('doctor').notEmpty().withMessage('Doctor is required'),
    body('patient').notEmpty().withMessage('Patient is required'),
    body('startAt').isISO8601().withMessage('Valid start time is required'),
  ],
  validate,
  createAppointment
);

/**
 * @route   GET /api/appointments
 * @desc    Get appointments with filters
 * @access  Private
 */
router.get('/', requireAuth, getAppointments);

/**
 * @route   GET /api/appointments/calendar
 * @desc    Get calendar view
 * @access  Private
 */
router.get('/calendar', requireAuth, getCalendarView);

/**
 * @route   GET /api/appointments/search-patients
 * @desc    Search patients by code or phone for appointment booking
 * @access  Private
 */
router.get('/search-patients', requireAuth, searchPatientsForAppointment);

/**
 * @route   POST /api/appointments/first-visit
 * @desc    Create first visit appointment with temp patient data
 * @access  Private
 */
router.post(
  '/first-visit',
  requireAuth,
  [
    body('clinic').notEmpty().withMessage('Clinic is required'),
    body('doctor').notEmpty().withMessage('Doctor is required'),
    body('name').notEmpty().withMessage('Patient name is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('startAt').isISO8601().withMessage('Valid start time is required'),
  ],
  validate,
  createFirstVisitAppointment
);

/**
 * @route   POST /api/appointments/follow-up
 * @desc    Create follow-up appointment with existing patient
 * @access  Private
 */
router.post(
  '/follow-up',
  requireAuth,
  [
    body('clinic').notEmpty().withMessage('Clinic is required'),
    body('doctor').notEmpty().withMessage('Doctor is required'),
    body('patient').notEmpty().withMessage('Patient is required'),
    body('startAt').isISO8601().withMessage('Valid start time is required'),
  ],
  validate,
  createFollowUpAppointment
);

/**
 * @route   GET /api/appointments/:appointmentId
 * @desc    Get appointment by ID
 * @access  Private
 */
router.get('/:appointmentId', requireAuth, getAppointmentById);

/**
 * @route   PATCH /api/appointments/:appointmentId
 * @desc    Update appointment
 * @access  Private
 */
router.patch('/:appointmentId', requireAuth, updateAppointment);

/**
 * @route   POST /api/appointments/:appointmentId/cancel
 * @desc    Cancel appointment
 * @access  Private
 */
router.post('/:appointmentId/cancel', requireAuth, cancelAppointment);

/**
 * @route   POST /api/appointments/:appointmentId/complete
 * @desc    Mark appointment as completed
 * @access  Private
 */
router.post('/:appointmentId/complete', requireAuth, completeAppointment);

/**
 * @route   PATCH /api/appointments/:appointmentId/vitals
 * @desc    Update appointment vitals (auto-changes status to in-progress)
 * @access  Private
 */
router.patch('/:appointmentId/vitals', requireAuth, updateAppointmentVitals);

/**
 * @route   PATCH /api/appointments/:appointmentId/clinical-notes
 * @desc    Update appointment clinical notes
 * @access  Private
 */
router.patch('/:appointmentId/clinical-notes', requireAuth, updateClinicalNotes);

/**
 * @route   PATCH /api/appointments/:appointmentId/status
 * @desc    Update appointment status manually
 * @access  Private
 */
router.patch('/:appointmentId/status', requireAuth, updateAppointmentStatus);

/**
 * @route   PATCH /api/appointments/:appointmentId/assign-doctor
 * @desc    Assign doctor to appointment
 * @access  Private
 */
router.patch('/:appointmentId/assign-doctor', requireAuth, assignDoctorToAppointment);

export default router;
