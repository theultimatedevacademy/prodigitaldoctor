/**
 * Auth Controller
 * Handles user authentication and profile management
 */

import User from "../models/user.js";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * Get or create user profile based on Clerk authentication
 * Maps Clerk user to application user in MongoDB
 * Returns user with clinics and their roles
 */
export const getMe = async (req, res) => {
  try {
    const { userId } = req.auth; // From Clerk middleware

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Find user by clerkId
    let user = await User.findOne({ clerkId: userId });

    // If user doesn't exist, create one from Clerk data
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);

      try {
        user = await User.create({
          clerkId: userId,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
          email: clerkUser.emailAddresses[0]?.emailAddress,
          phone: clerkUser.phoneNumbers[0]?.phoneNumber,
          profilePhotoUrl: clerkUser.imageUrl,
          subscription: {
            plan: "free",
            status: "active",
            maxClinics: 0,
          },
        });
      } catch (createError) {
        // Handle duplicate email error
        if (createError.code === 11000 && createError.keyPattern?.email) {
          console.error("⚠️  Duplicate email detected during user creation");
          console.error("   ClerkId:", userId);
          console.error("   Email:", clerkUser.emailAddresses[0]?.emailAddress);

          // Try to find and return the existing user with this email
          const existingUserWithEmail = await User.findOne({
            email: clerkUser.emailAddresses[0]?.emailAddress,
          });

          if (existingUserWithEmail) {
            console.log("   ℹ️  Returning existing user with matching email");
            user = existingUserWithEmail;
          } else {
            throw createError;
          }
        } else {
          throw createError;
        }
      }
    }

    // Get all clinics with roles
    const clinicsWithRoles = await user.getAllClinics();

    // Return user with clinics and subscription info
    const response = {
      ...user.toObject(),
      clinics: clinicsWithRoles,
      canCreateClinic: await user.canCreateClinic(),
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get user's clinics with roles
 * Returns all clinics user has access to with their role in each
 */
export const getMyClinics = async (req, res) => {
  try {
    const { userId } = req.auth;
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const clinicsWithRoles = await user.getAllClinics();

    res.json({
      clinics: clinicsWithRoles,
      total: clinicsWithRoles.length,
    });
  } catch (error) {
    console.error("Error fetching clinics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.auth;
    const updates = req.body;

    // Prevent updating certain fields
    delete updates.clerkId;
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    const user = await User.findOneAndUpdate({ clerkId: userId }, updates, {
      new: true,
      runValidators: true,
    }).populate("clinics");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get pending invitations for current user
 * Returns clinics where user is invited but hasn't accepted
 */
export const getPendingInvitations = async (req, res) => {
  try {
    const { userId } = req.auth;
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const Clinic = (await import("../models/clinic.js")).default;

    // Find clinics where user is in staff but not accepted
    // Use $elemMatch to ensure both conditions apply to the same array element
    const pendingClinics = await Clinic.find({
      staff: {
        $elemMatch: {
          user: user._id,
          accepted: false,
        },
      },
    }).populate("owner");

    const invitations = pendingClinics.map((clinic) => {
      const staffEntry = clinic.staff.find(
        (s) => s.user.toString() === user._id.toString() && !s.accepted
      );

      return {
        _id: clinic._id,
        clinic: {
          _id: clinic._id,
          name: clinic.name,
          address: clinic.address,
          owner: clinic.owner,
        },
        role: staffEntry.role,
        invitedAt: staffEntry.invitedAt,
      };
    });

    res.json({
      invitations,
      total: invitations.length,
    });
  } catch (error) {
    console.error("Error fetching pending invitations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
