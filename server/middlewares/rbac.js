/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces clinic-scoped permissions
 */

import User from '../models/user.js';
import Clinic from '../models/clinic.js';
import logger from '../utils/logger.js';

/**
 * Check if user has access to a specific clinic
 * Verifies user is owner or staff member of the clinic
 */
export const requireClinicAccess = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const { userId } = req.auth;
      const clinicId = req.params.clinicId || req.body.clinic || req.query.clinic;

      if (!clinicId) {
        return res.status(400).json({ error: 'Clinic ID is required' });
      }

      // Get user with populated clinics
      const user = await User.findOne({ clerkId: userId }).populate('clinics');
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get clinic and check ownership/staff membership
      const clinic = await Clinic.findById(clinicId);
      
      if (!clinic) {
        return res.status(404).json({ error: 'Clinic not found' });
      }

      // Check if user is owner
      const isOwner = clinic.owner.toString() === user._id.toString();

      // Check if user is staff member
      const isStaff = clinic.staff.some(
        s => s.user.toString() === user._id.toString() && s.accepted
      );

      if (!isOwner && !isStaff) {
        return res.status(403).json({ 
          error: 'Access denied: You are not a member of this clinic' 
        });
      }

      // If specific roles are required, check them
      if (allowedRoles.length > 0) {
        const hasAllowedRole = allowedRoles.some(role => user.roles.includes(role));
        
        if (!hasAllowedRole) {
          return res.status(403).json({ 
            error: `Access denied: Requires one of: ${allowedRoles.join(', ')}` 
          });
        }
      }

      // Attach clinic and user to request for later use
      req.clinic = clinic;
      req.user = user;
      
      next();
    } catch (error) {
      logger.error({ error }, 'RBAC middleware error');
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Check if user is clinic owner
 */
export const requireClinicOwner = async (req, res, next) => {
  try {
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

export default {
  requireClinicAccess,
  requireClinicOwner,
  attachUser,
};
