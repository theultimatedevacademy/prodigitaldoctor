/**
 * Auth Routes
 * Handles authentication and user profile endpoints
 */

import express from 'express';
import { getMe, updateUserRole, updateProfile, updateMyRole } from '../controllers/authController.js';
import { requireAuth, requireRole } from '../middlewares/clerkAuth.js';

const router = express.Router();

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile (creates if doesn't exist)
 * @access  Private
 */
router.get('/me', requireAuth, getMe);

/**
 * @route   PATCH /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.patch('/profile', requireAuth, updateProfile);

/**
 * @route   POST /api/auth/my-role
 * @desc    Update current user's role (first-time setup)
 * @access  Private
 */
router.post('/my-role', requireAuth, updateMyRole);

/**
 * @route   PATCH /api/auth/users/:userId/role
 * @desc    Update user role (admin only)
 * @access  Private (Admin only)
 */
router.patch('/users/:userId/role', requireAuth, requireRole(['admin']), updateUserRole);

export default router;
