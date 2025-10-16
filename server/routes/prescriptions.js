/**
 * Prescription Routes
 */

import express from 'express';
import { body } from 'express-validator';
import {
  createPrescription,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
  getPatientPrescriptions,
  getClinicPrescriptions,
  getPrescriptionPDFData,
  updatePrescriptionPDF,
  getPrescriptionStats,
} from '../controllers/prescriptionController.js';
import { requireAuth } from '../middlewares/clerkAuth.js';
import { requireClinicAccess } from '../middlewares/rbac.js';
import { validate } from '../middlewares/validator.js';
import { prescriptionLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

/**
 * @route   GET /api/prescriptions
 * @desc    Get prescriptions (by clinic or patient)
 * @access  Private
 */
router.get('/', requireAuth, async (req, res, next) => {
  // Route to appropriate controller based on query params
  const { clinicId, patientId } = req.query;
  
  // Handle null/undefined clinicId - return empty array instead of error
  if (clinicId === 'null' || clinicId === 'undefined' || !clinicId) {
    if (!patientId || patientId === 'null' || patientId === 'undefined') {
      // No valid filters, return empty result
      return res.json({ data: [], total: 0, page: 1, totalPages: 0 });
    }
  }
  
  if (clinicId && clinicId !== 'null' && clinicId !== 'undefined') {
    return getClinicPrescriptions(req, res, next);
  } else if (patientId && patientId !== 'null' && patientId !== 'undefined') {
    return getPatientPrescriptions(req, res, next);
  } else {
    // Return empty result instead of error
    return res.json({ data: [], total: 0, page: 1, totalPages: 0 });
  }
});

/**
 * @route   POST /api/prescriptions
 * @desc    Create new prescription
 * @access  Private (doctor)
 */
router.post(
  '/',
  requireAuth,
  requireClinicAccess(['doctor']),
  prescriptionLimiter,
  [
    body('clinic').notEmpty().withMessage('Clinic is required'),
    body('patient').notEmpty().withMessage('Patient is required'),
    body('meds').isArray({ min: 1 }).withMessage('At least one medication required'),
  ],
  validate,
  createPrescription
);

/**
 * @route   GET /api/prescriptions/stats
 * @desc    Get prescription statistics
 * @access  Private
 */
router.get('/stats', requireAuth, getPrescriptionStats);

/**
 * @route   GET /api/prescriptions/:prescriptionId
 * @desc    Get prescription by ID
 * @access  Private
 */
router.get('/:prescriptionId', requireAuth, getPrescriptionById);

/**
 * @route   PUT /api/prescriptions/:prescriptionId
 * @desc    Update prescription
 * @access  Private (doctor)
 */
router.put(
  '/:prescriptionId',
  requireAuth,
  requireClinicAccess(['doctor']),
  [
    body('meds').isArray({ min: 1 }).withMessage('At least one medication required'),
  ],
  validate,
  updatePrescription
);

/**
 * @route   DELETE /api/prescriptions/:prescriptionId
 * @desc    Delete prescription
 * @access  Private (doctor)
 */
router.delete(
  '/:prescriptionId',
  requireAuth,
  requireClinicAccess(['doctor']),
  deletePrescription
);

/**
 * @route   GET /api/prescriptions/:prescriptionId/pdf-data
 * @desc    Get prescription PDF data
 * @access  Private
 */
router.get('/:prescriptionId/pdf-data', requireAuth, getPrescriptionPDFData);

/**
 * @route   PATCH /api/prescriptions/:prescriptionId/pdf
 * @desc    Update prescription PDF URL
 * @access  Private
 */
router.patch(
  '/:prescriptionId/pdf',
  requireAuth,
  [
    body('pdfUrl').notEmpty().withMessage('PDF URL is required'),
    body('pdfS3Key').notEmpty().withMessage('PDF S3 key is required'),
  ],
  validate,
  updatePrescriptionPDF
);

export default router;
