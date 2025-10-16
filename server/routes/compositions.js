/**
 * Composition Routes
 */

import express from 'express';
import { body } from 'express-validator';
import {
  searchCompositions,
  checkCompositionDDI,
} from '../controllers/medicationController.js';
import { requireAuth } from '../middlewares/clerkAuth.js';
import { validate } from '../middlewares/validator.js';
import { searchLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

/**
 * @route   GET /api/compositions/search
 * @desc    Search compositions
 * @access  Private
 */
router.get('/search', requireAuth, searchLimiter, searchCompositions);

/**
 * @route   POST /api/compositions/check-ddi
 * @desc    Check DDI for compositions
 * @access  Private
 */
router.post(
  '/check-ddi',
  requireAuth,
  [
    body('compositionIds').isArray({ min: 2 }).withMessage('At least 2 composition IDs required'),
  ],
  validate,
  checkCompositionDDI
);

export default router;
