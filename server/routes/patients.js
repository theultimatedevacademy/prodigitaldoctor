/**
 * Patient Routes
 */

import express from 'express';
import { body } from 'express-validator';
import {
  createPatient,
  searchPatients,
  getPatientById,
  getPatientHistory,
  linkPatientCode,
  getLinkedPatients,
  updatePatient,
  getClinicPatients,
} from '../controllers/patientController.js';
import { requireAuth } from '../middlewares/clerkAuth.js';
import { requireClinicAccess } from '../middlewares/rbac.js';
import { validate } from '../middlewares/validator.js';
import { searchLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

/**
 * @route   GET /api/patients
 * @desc    Get patients for a clinic
 * @access  Private
 */
router.get('/', requireAuth, getClinicPatients);

/**
 * @route   POST /api/patients
 * @desc    Create new patient
 * @access  Private (doctor, assistant)
 */
router.post(
  '/',
  requireAuth,
  requireClinicAccess(['doctor', 'assistant']),
  [
    body('name').notEmpty().withMessage('Patient name is required'),
    body('clinic').notEmpty().withMessage('Clinic is required'),
    body('doctor').notEmpty().withMessage('Doctor is required'),
  ],
  validate,
  createPatient
);

/**
 * @route   GET /api/patients/search
 * @desc    Search patients
 * @access  Private
 */
router.get('/search', requireAuth, searchLimiter, searchPatients);

/**
 * @route   GET /api/patients/linked
 * @desc    Get linked patients for current user
 * @access  Private
 */
router.get('/linked', requireAuth, getLinkedPatients);

/**
 * @route   POST /api/patients/link-code
 * @desc    Link patient code to user account
 * @access  Private
 */
router.post(
  '/link-code',
  requireAuth,
  [
    body('patientCode').notEmpty().withMessage('Patient code is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
  ],
  validate,
  linkPatientCode
);

/**
 * @route   GET /api/patients/:patientId
 * @desc    Get patient by ID
 * @access  Private
 */
router.get('/:patientId', requireAuth, getPatientById);

/**
 * @route   GET /api/patients/:patientId/history
 * @desc    Get patient history
 * @access  Private
 */
router.get('/:patientId/history', requireAuth, getPatientHistory);

/**
 * @route   PATCH /api/patients/:patientId
 * @desc    Update patient details
 * @access  Private (doctor, assistant)
 */
router.patch('/:patientId', requireAuth, updatePatient);

export default router;
