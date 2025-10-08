/**
 * Webhook Routes
 * Handles incoming webhooks from Clerk
 */

import express from 'express';
import { handleClerkWebhook } from '../controllers/webhookController.js';

const router = express.Router();

/**
 * @route   POST /api/webhooks/clerk
 * @desc    Handle Clerk webhook events
 * @access  Public (verified via Svix signature)
 */
router.post('/clerk', handleClerkWebhook);

export default router;
