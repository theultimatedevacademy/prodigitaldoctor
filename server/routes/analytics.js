/**
 * Analytics Routes
 */

import express from 'express';
import {
  getClinicSummary,
  getDoctorSummary,
  getPatientTrends,
} from '../controllers/analyticsController.js';
import { requireAuth } from '../middlewares/clerkAuth.js';
import { requireClinicAccess } from '../middlewares/rbac.js';

const router = express.Router();

/**
 * @route   GET /api/analytics/clinic/:clinicId/summary
 * @desc    Get clinic analytics summary
 * @access  Private (clinic members)
 */
router.get(
  '/clinic/:clinicId/summary',
  requireAuth,
  requireClinicAccess(['doctor', 'clinic_owner', 'assistant']),
  getClinicSummary
);

/**
 * @route   GET /api/analytics/clinic/:clinicId/patient-trends
 * @desc    Get patient trends
 * @access  Private (clinic members)
 */
router.get(
  '/clinic/:clinicId/patient-trends',
  requireAuth,
  requireClinicAccess(['doctor', 'clinic_owner']),
  getPatientTrends
);

/**
 * @route   GET /api/analytics/doctor/:doctorId/summary
 * @desc    Get doctor analytics summary
 * @access  Private
 */
router.get('/doctor/:doctorId/summary', requireAuth, getDoctorSummary);

export default router;
