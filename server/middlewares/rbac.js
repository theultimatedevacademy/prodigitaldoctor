/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces clinic-scoped permissions
 * Roles are derived from clinic relationships (owner vs staff)
 */

import User from '../models/user.js';
import Clinic from '../models/clinic.js';
import logger from '../utils/logger.js';
import { getUserClinicRole, hasClinicAccess } from '../utils/rbacHelpers.js';

/**
 * Check if user has access to a specific clinic
 * Verifies user is owner or staff member of the clinic
 * Attaches user's role in clinic to req.userClinicRole
 */
export const requireClinicAccess = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const { userId } = req.auth;
      const clinicId = req.params.clinicId || req.body.clinic || req.query.clinic;

      if (!clinicId) {
        return res.status(400).json({ error: 'Clinic ID is required' });
      }

      // Get user
      const user = await User.findOne({ clerkId: userId });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get clinic
      const clinic = await Clinic.findById(clinicId);
      
      if (!clinic) {
        return res.status(404).json({ error: 'Clinic not found' });
      }

      // Get user's role in this clinic
      const userRole = await getUserClinicRole(user._id, clinicId);

      if (!userRole) {
        return res.status(403).json({ 
          error: 'Access denied: You are not a member of this clinic' 
        });
      }

      // If specific roles are required, check them
      if (allowedRoles.length > 0) {
        if (!allowedRoles.includes(userRole)) {
          return res.status(403).json({ 
            error: `Access denied: Requires one of: ${allowedRoles.join(', ')}. You are: ${userRole}` 
          });
        }
      }

      // Attach to request for later use
      req.clinic = clinic;
      req.user = user;
      req.userClinicRole = userRole; // NEW: User's role in this clinic
      
      next();
    } catch (error) {
      logger.error({ error }, 'RBAC middleware error');
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Check if user is clinic owner
 * Can be used standalone or after requireClinicAccess
 */
export const requireClinicOwner = async (req, res, next) => {
  try {
    // If already checked by requireClinicAccess, use that
    if (req.userClinicRole) {
      if (req.userClinicRole !== 'clinic_owner') {
        return res.status(403).json({ 
          error: 'Access denied: Only clinic owner can perform this action' 
        });
      }
      return next();
    }

    // Otherwise, do the check
    const { userId } = req.auth;
    const clinicId = req.params.clinicId || req.body.clinic;

    if (!clinicId) {
      return res.status(400).json({ error: 'Clinic ID is required' });
    }

    const user = await User.findOne({ clerkId: userId });
    const clinic = await Clinic.findById(clinicId);

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    if (clinic.owner.toString() !== user._id.toString()) {
      return res.status(403).json({ 
        error: 'Access denied: Only clinic owner can perform this action' 
      });
    }

    req.clinic = clinic;
    req.user = user;
    req.userClinicRole = 'clinic_owner';
    next();
  } catch (error) {
    logger.error({ error }, 'Clinic owner check error');
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Attach user document to request
 * Useful for endpoints that need user info but don't require specific clinic access
 */
export const attachUser = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    
    const user = await User.findOne({ clerkId: userId }).populate('clinics');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error({ error }, 'Attach user middleware error');
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Require specific clinic role(s)
 * Must be used after requireClinicAccess
 */
export const requireClinicRole = (roles) => {
  if (!Array.isArray(roles)) {
    roles = [roles];
  }

  return async (req, res, next) => {
    if (!req.userClinicRole) {
      logger.error('requireClinicRole called without requireClinicAccess first');
      return res.status(500).json({ 
        error: 'Internal error: role not determined' 
      });
    }

    if (!roles.includes(req.userClinicRole)) {
      return res.status(403).json({ 
        error: `Access denied: This action requires one of: ${roles.join(', ')}. You are: ${req.userClinicRole}` 
      });
    }

    next();
  };
};

export default {
  requireClinicAccess,
  requireClinicOwner,
  requireClinicRole,
  attachUser,
};
