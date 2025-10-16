/**
 * Medication Routes
 */

import express from 'express';
import { body } from 'express-validator';
import {
  searchMedications,
  getMedicationById,
  searchCompositions,
  checkMedicationDDI,
  checkCompositionDDI,
} from '../controllers/medicationController.js';
import { requireAuth } from '../middlewares/clerkAuth.js';
import { validate } from '../middlewares/validator.js';
import { searchLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

/**
 * @route   GET /api/medications/search
 * @desc    Search medications
 * @access  Private
 */
router.get('/search', requireAuth, searchLimiter, searchMedications);

/**
 * @route   POST /api/medications/check-ddi
 * @desc    Check DDI for medications
 * @access  Private
 */
router.post(
  '/check-ddi',
  requireAuth,
  [
    body('medicationIds').isArray({ min: 2 }).withMessage('At least 2 medication IDs required'),
  ],
  validate,
  checkMedicationDDI
);

/**
 * @route   GET /api/medications/:medicationId
 * @desc    Get medication by ID
 * @access  Private
 */
router.get('/:medicationId', requireAuth, getMedicationById);

export default router;
