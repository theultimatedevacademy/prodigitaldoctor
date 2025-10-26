/**
 * Subscription Controller
 * Handles user subscription management, trial activation, and plan upgrades
 */

import User from '../models/user.js';
import logger from '../utils/logger.js';

/**
 * Get subscription info for current user
 * GET /api/subscription/info
 */
export const getSubscriptionInfo = async (req, res) => {
  try {
    const { userId } = req.auth;
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const ownedClinics = await user.getOwnedClinics();

    res.json({
      subscription: user.subscription,
      ownedClinics: ownedClinics.length,
      canCreateClinic: await user.canCreateClinic(),
      availableSlots: Math.max(0, user.subscription.maxClinics - ownedClinics.length),
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching subscription info');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Start free trial
 * POST /api/subscription/start-trial
 * Gives user 30-day trial with 1 clinic slot
 */
export const startFreeTrial = async (req, res) => {
  try {
    const { userId } = req.auth;
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already has trial or paid plan
    if (user.subscription.status === 'trial') {
      return res.status(400).json({ 
        error: 'Trial already active',
        trialEndsAt: user.subscription.trialEndsAt 
      });
    }

    if (user.subscription.plan !== 'free') {
      return res.status(400).json({ 
        error: 'User already has a paid plan',
        currentPlan: user.subscription.plan 
      });
    }

    // Check if trial was already used (trialEndsAt exists and is in past)
    if (user.subscription.trialEndsAt && new Date() > user.subscription.trialEndsAt) {
      return res.status(400).json({ 
        error: 'Trial period already expired',
        message: 'Please upgrade to a paid plan to create clinics' 
      });
    }

    // Start 30-day trial
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);

    user.subscription = {
      plan: 'basic',
      status: 'trial',
      maxClinics: 1,
      trialEndsAt,
      startedAt: new Date(),
    };

    await user.save();

    logger.info({ userId: user._id }, 'Free trial started');

    res.json({
      message: 'Trial started successfully',
      subscription: user.subscription,
      canCreateClinic: true,
    });
  } catch (error) {
    logger.error({ error }, 'Error starting trial');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Upgrade subscription
 * POST /api/subscription/upgrade
 * Integrates with payment provider (Stripe/Razorpay)
 */
export const upgradeSubscription = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { plan, paymentToken } = req.body;

    if (!plan || !['basic', 'pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({ 
        error: 'Invalid plan. Choose: basic, pro, or enterprise' 
      });
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Define plan limits
    const planLimits = {
      basic: { maxClinics: 1, price: 999 },
      pro: { maxClinics: 3, price: 2499 },
      enterprise: { maxClinics: 999, price: null }, // Custom pricing
    };

    const selectedPlan = planLimits[plan];

    // TODO: Integrate with Stripe/Razorpay for payment processing
    // For now, we'll just update the subscription
    // In production, validate payment first before updating

    user.subscription = {
      plan,
      status: 'active',
      maxClinics: selectedPlan.maxClinics,
      stripeCustomerId: paymentToken, // TODO: Replace with actual Stripe customer ID
      stripeSubscriptionId: paymentToken, // TODO: Replace with actual subscription ID
      startedAt: new Date(),
      trialEndsAt: undefined, // Clear trial end date
    };

    await user.save();

    logger.info({ 
      userId: user._id, 
      plan,
      maxClinics: selectedPlan.maxClinics 
    }, 'Subscription upgraded');

    res.json({
      message: 'Subscription upgraded successfully',
      subscription: user.subscription,
      canCreateClinic: await user.canCreateClinic(),
    });
  } catch (error) {
    logger.error({ error }, 'Error upgrading subscription');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Cancel subscription
 * POST /api/subscription/cancel
 * Cancels subscription but keeps access until period ends
 */
export const cancelSubscription = async (req, res) => {
  try {
    const { userId } = req.auth;
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.subscription.plan === 'free') {
      return res.status(400).json({ 
        error: 'No active subscription to cancel' 
      });
    }

    // TODO: Cancel subscription in Stripe/Razorpay
    // For now, just update status

    user.subscription.status = 'cancelled';
    await user.save();

    logger.info({ userId: user._id }, 'Subscription cancelled');

    res.json({
      message: 'Subscription cancelled successfully',
      subscription: user.subscription,
    });
  } catch (error) {
    logger.error({ error }, 'Error cancelling subscription');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get subscription plans
 * GET /api/subscription/plans
 * Returns available plans and pricing
 */
export const getPlans = async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'INR',
        period: 'forever',
        maxClinics: 0,
        features: [
          'Join existing clinics',
          'Basic features',
          'Email support',
        ],
      },
      {
        id: 'basic',
        name: 'Basic',
        price: 999,
        currency: 'INR',
        period: 'month',
        maxClinics: 1,
        features: [
          '1 Clinic',
          'Unlimited patients',
          'Unlimited appointments',
          'Prescription management',
          'DDI checking',
          'Priority support',
          '30-day free trial',
        ],
        popular: true,
      },
      {
        id: 'pro',
        name: 'Professional',
        price: 2499,
        currency: 'INR',
        period: 'month',
        maxClinics: 3,
        features: [
          '3 Clinics',
          'Everything in Basic',
          'Advanced analytics',
          'Custom branding',
          'API access',
          'Dedicated support',
        ],
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: null,
        currency: 'INR',
        period: 'custom',
        maxClinics: 999,
        features: [
          'Unlimited clinics',
          'Everything in Pro',
          'Multi-location support',
          'Custom integrations',
          'Dedicated account manager',
          'SLA guarantee',
          'Training & onboarding',
        ],
        contactSales: true,
      },
    ];

    res.json({ plans });
  } catch (error) {
    logger.error({ error }, 'Error fetching plans');
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  getSubscriptionInfo,
  startFreeTrial,
  upgradeSubscription,
  cancelSubscription,
  getPlans,
};
