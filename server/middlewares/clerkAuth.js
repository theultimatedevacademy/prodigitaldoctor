/**
 * Clerk Authentication Middleware
 * Verifies Clerk JWT tokens and attaches user info to request
 */

import { verifyToken } from "@clerk/backend";

/**
 * Middleware to require authentication
 * Verifies Clerk session token and attaches userId to req.auth
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify the token with Clerk
    try {
      const decoded = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      req.auth = { userId: decoded.sub };
      next();
    } catch (verifyError) {
      console.error("Token verification error:", verifyError);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Optional auth middleware - doesn't require authentication but extracts user if present
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");

      try {
        const decoded = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY,
        });
        req.auth = { userId: decoded.sub };
      } catch (verifyError) {
        // Silently fail for optional auth
        req.auth = null;
      }
    }

    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    next();
  }
};

/**
 * Middleware to check if user has required role
 * Must be used after requireAuth middleware
 * Currently supports 'admin' role via isAdmin field
 */
export const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const User = (await import("../models/user.js")).default;
      const user = await User.findOne({ clerkId: req.auth.userId });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user has any of the allowed roles
      // For 'admin' role, check isAdmin field
      const hasRole = allowedRoles.some((role) => {
        if (role === "admin") {
          return user.isAdmin === true;
        }
        // For other roles, they are clinic-specific and should not use this middleware
        return false;
      });

      if (!hasRole) {
        return res.status(403).json({
          error: "Forbidden: Insufficient permissions",
        });
      }

      // Attach user to request for later use
      req.user = user;
      next();
    } catch (error) {
      console.error("Role check error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
};
