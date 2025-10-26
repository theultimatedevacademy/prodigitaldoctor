/**
 * Subscription Routes
 * Handles subscription management endpoints
 */

import express from 'express';
import { 
  getSubscriptionInfo,
  startFreeTrial,
  upgradeSubscription,
  cancelSubscription,
  getPlans,
} from '../controllers/subscriptionController.js';
import { requireAuth } from '../middlewares/clerkAuth.js';

const router = express.Router();

/**
 * @route   GET /api/subscription/plans
 * @desc    Get available subscription plans
 * @access  Public
 */
router.get('/plans', getPlans);

/**
 * @route   GET /api/subscription/info
 * @desc    Get current user's subscription info
 * @access  Private
 */
router.get('/info', requireAuth, getSubscriptionInfo);

/**
 * @route   POST /api/subscription/start-trial
 * @desc    Start 30-day free trial
 * @access  Private
 */
router.post('/start-trial', requireAuth, startFreeTrial);

/**
 * @route   POST /api/subscription/upgrade
 * @desc    Upgrade to paid plan
 * @access  Private
 */
router.post('/upgrade', requireAuth, upgradeSubscription);

/**
 * @route   POST /api/subscription/cancel
 * @desc    Cancel subscription
 * @access  Private
 */
router.post('/cancel', requireAuth, cancelSubscription);

export default router;
