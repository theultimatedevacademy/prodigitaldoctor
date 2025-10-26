/**
 * Auth Routes
 * Handles authentication and user profile endpoints
 */

import express from 'express';
import { 
  getMe, 
  getMyClinics, 
  updateProfile, 
  getPendingInvitations 
} from '../controllers/authController.js';
import { requireAuth } from '../middlewares/clerkAuth.js';

const router = express.Router();

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile with clinics and roles
 * @access  Private
 */
router.get('/me', requireAuth, getMe);

/**
 * @route   GET /api/auth/my-clinics
 * @desc    Get all clinics user has access to with roles
 * @access  Private
 */
router.get('/my-clinics', requireAuth, getMyClinics);

/**
 * @route   GET /api/auth/invitations/pending
 * @desc    Get pending clinic invitations for current user
 * @access  Private
 */
router.get('/invitations/pending', requireAuth, getPendingInvitations);

/**
 * @route   PATCH /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.patch('/profile', requireAuth, updateProfile);

export default router;
