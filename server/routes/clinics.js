/**
 * Clinic Routes
 */

import express from 'express';
import { body } from 'express-validator';
import {
  createClinic,
  getClinics,
  getClinicById,
  updateClinic,
  inviteStaff,
  acceptInvite,
  rejectInvite,
  getPendingInvitations,
  removeStaff,
  searchClinics,
  getClinicDoctors,
} from '../controllers/clinicController.js';
import { requireAuth } from '../middlewares/clerkAuth.js';
import { requireClinicOwner, requireClinicAccess } from '../middlewares/rbac.js';
import { validate } from '../middlewares/validator.js';
import { searchLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

/**
 * @route   POST /api/clinics
 * @desc    Create new clinic
 * @access  Private (clinic_owner)
 */
router.post(
  '/',
  requireAuth,
  [
    body('name').notEmpty().withMessage('Clinic name is required'),
  ],
  validate,
  createClinic
);

/**
 * @route   GET /api/clinics
 * @desc    Get all clinics for current user
 * @access  Private
 */
router.get('/', requireAuth, getClinics);

/**
 * @route   GET /api/clinics/search
 * @desc    Search clinics by location (public)
 * @access  Public
 */
router.get('/search', searchLimiter, searchClinics);

/**
 * @route   GET /api/clinics/invitations/pending
 * @desc    Get pending invitations for current user
 * @access  Private
 */
router.get('/invitations/pending', requireAuth, getPendingInvitations);

/**
 * @route   GET /api/clinics/:clinicId/doctors
 * @desc    Get doctors for a clinic
 * @access  Private
 */
router.get('/:clinicId/doctors', requireAuth, getClinicDoctors);

/**
 * @route   GET /api/clinics/:clinicId
 * @desc    Get clinic by ID
 * @access  Private
 */
router.get('/:clinicId', requireAuth, getClinicById);

/**
 * @route   PATCH /api/clinics/:clinicId
 * @desc    Update clinic details
 * @access  Private (clinic owner)
 */
router.patch(
  '/:clinicId',
  requireAuth,
  requireClinicOwner,
  updateClinic
);

/**
 * @route   POST /api/clinics/:clinicId/invite
 * @desc    Invite staff to clinic
 * @access  Private (clinic owner)
 */
router.post(
  '/:clinicId/invite',
  requireAuth,
  requireClinicOwner,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('role').isIn(['doctor', 'staff']).withMessage('Invalid role. Must be "doctor" or "staff"'),
  ],
  validate,
  inviteStaff
);

/**
 * @route   POST /api/clinics/:clinicId/accept-invite
 * @desc    Accept staff invitation
 * @access  Private
 */
router.post('/:clinicId/accept-invite', requireAuth, acceptInvite);

/**
 * @route   POST /api/clinics/:clinicId/reject-invite
 * @desc    Reject staff invitation
 * @access  Private
 */
router.post('/:clinicId/reject-invite', requireAuth, rejectInvite);

/**
 * @route   DELETE /api/clinics/:clinicId/staff/:staffUserId
 * @desc    Remove staff member
 * @access  Private (clinic owner)
 */
router.delete(
  '/:clinicId/staff/:staffUserId',
  requireAuth,
  requireClinicOwner,
  removeStaff
);

export default router;
