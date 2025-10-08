/**
 * Auth Controller
 * Handles user authentication and profile management
 */

import User from '../models/user.js';
import { clerkClient } from '@clerk/clerk-sdk-node';

/**
 * Get or create user profile based on Clerk authentication
 * Maps Clerk user to application user in MongoDB
 */
export const getMe = async (req, res) => {
  try {
    const { userId } = req.auth; // From Clerk middleware
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Find user by clerkId
    let user = await User.findOne({ clerkId: userId })
      .populate('clinics')
      .lean();
    
    // If user doesn't exist, create one from Clerk data
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);
      
      // Determine role from Clerk public metadata
      // If no roles in Clerk metadata, create user with empty roles array
      // User will be prompted to select role on first login
      const roles = clerkUser.publicMetadata?.roles || [];
      
      try {
        user = await User.create({
          clerkId: userId,
          roles: roles,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          email: clerkUser.emailAddresses[0]?.emailAddress,
          phone: clerkUser.phoneNumbers[0]?.phoneNumber,
          profilePhotoUrl: clerkUser.imageUrl,
        });
        
        // Populate clinics (empty array initially)
        user = await User.findById(user._id).populate('clinics').lean();
      } catch (createError) {
        // Handle duplicate email error
        if (createError.code === 11000 && createError.keyPattern?.email) {
          console.error('⚠️  Duplicate email detected during user creation');
          console.error('   ClerkId:', userId);
          console.error('   Email:', clerkUser.emailAddresses[0]?.emailAddress);
          
          // Try to find and return the existing user with this email
          const existingUserWithEmail = await User.findOne({ 
            email: clerkUser.emailAddresses[0]?.emailAddress 
          }).populate('clinics').lean();
          
          if (existingUserWithEmail) {
            console.log('   ℹ️  Returning existing user with matching email');
            return res.json(existingUserWithEmail);
          }
        }
        throw createError;
      }
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roles } = req.body;
    
    // Validate roles
    const validRoles = ['patient', 'doctor', 'assistant', 'clinic_owner', 'admin'];
    const invalidRoles = roles.filter(role => !validRoles.includes(role));
    
    if (invalidRoles.length > 0) {
      return res.status(400).json({ 
        error: `Invalid roles: ${invalidRoles.join(', ')}` 
      });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { roles },
      { new: true, runValidators: true }
    ).populate('clinics');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      updates,
      { new: true, runValidators: true }
    ).populate('clinics');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update current user's role
 * Updates both MongoDB and Clerk public metadata
 */
export const updateMyRole = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { roles } = req.body;
    
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ 
        error: 'Roles array is required and must not be empty' 
      });
    }
    
    // Validate roles
    const validRoles = ['patient', 'doctor', 'assistant', 'clinic_owner', 'admin'];
    const invalidRoles = roles.filter(role => !validRoles.includes(role));
    
    if (invalidRoles.length > 0) {
      return res.status(400).json({ 
        error: `Invalid roles: ${invalidRoles.join(', ')}` 
      });
    }
    
    // Update user in MongoDB
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { roles },
      { new: true, runValidators: true }
    ).populate('clinics');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update Clerk public metadata
    try {
      await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          roles: roles,
        },
      });
    } catch (clerkError) {
      console.error('Error updating Clerk metadata:', clerkError);
      // Don't fail the request if Clerk update fails
      // MongoDB is already updated
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
