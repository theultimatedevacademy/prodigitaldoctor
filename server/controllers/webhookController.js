/**
 * Webhook Controller
 * Handles Clerk webhook events for user synchronization
 */

import { Webhook } from 'svix';
import User from '../models/user.js';

/**
 * Handle Clerk webhook events
 * Syncs user data between Clerk and MongoDB
 */
export const handleClerkWebhook = async (req, res) => {
  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET is not set in environment variables');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Get Svix headers for verification
    const svix_id = req.headers['svix-id'];
    const svix_timestamp = req.headers['svix-timestamp'];
    const svix_signature = req.headers['svix-signature'];

    // If missing headers, return error
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: 'Missing Svix headers' });
    }

    // Get the raw body as string (it's a Buffer from express.raw())
    const payload = req.body.toString();

    // Create Svix webhook instance
    const wh = new Webhook(webhookSecret);

    let evt;
    
    // Verify the webhook signature
    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      console.error('Headers:', { svix_id, svix_timestamp, svix_signature });
      console.error('Webhook secret (first 10 chars):', webhookSecret.substring(0, 10));
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Handle different event types
    const { type, data } = evt;

    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
      
      default:
        console.log(`Unhandled webhook event type: ${type}`);
    }

    // Return success response
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Handle user.created event
 * Creates new user in MongoDB when user signs up in Clerk
 * Initializes with free subscription plan
 */
async function handleUserCreated(data) {
  try {
    console.log('👤 User created event received:', data.id);

    // Check if user already exists by clerkId
    const existingUser = await User.findOne({ clerkId: data.id });
    if (existingUser) {
      console.log('User already exists in database');
      return;
    }

    // Check if email already exists (if email is provided)
    const email = data.email_addresses?.[0]?.email_address;
    if (email) {
      const userWithEmail = await User.findOne({ email: email.toLowerCase() });
      if (userWithEmail) {
        console.log(`⚠️  User with email ${email} already exists. Skipping creation.`);
        console.log(`   Existing user: ${userWithEmail.clerkId}`);
        return;
      }
    }

    // Create new user with free subscription (NO ROLES - roles are clinic-specific now)
    const newUser = await User.create({
      clerkId: data.id,
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username,
      email: email,
      phone: data.phone_numbers?.[0]?.phone_number,
      profilePhotoUrl: data.image_url,
      subscription: {
        plan: 'free',
        status: 'active',
        maxClinics: 0,
      },
      clinics: [],
    });

    console.log('✅ User created in MongoDB with free subscription:', newUser._id);
  } catch (error) {
    // Handle duplicate email error (MongoDB error code 11000)
    if (error.code === 11000 && error.keyPattern?.email) {
      console.error('⚠️  Duplicate email error - User with this email already exists');
      console.error('   Email:', data.email_addresses?.[0]?.email_address);
      // Don't throw error - just log it and continue
      return;
    }
    
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Handle user.updated event
 * Updates user data in MongoDB when user updates profile in Clerk
 * Does NOT sync roles (roles are clinic-specific now)
 */
async function handleUserUpdated(data) {
  try {
    console.log('🔄 User updated event received:', data.id);

    const user = await User.findOne({ clerkId: data.id });
    
    if (!user) {
      console.log('User not found, creating new user');
      await handleUserCreated(data);
      return;
    }

    // Update user data (profile info only, NOT roles)
    const updates = {
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username,
      email: data.email_addresses?.[0]?.email_address,
      phone: data.phone_numbers?.[0]?.phone_number,
      profilePhotoUrl: data.image_url,
    };

    // NOTE: Do NOT sync roles from Clerk metadata
    // Roles are now determined by clinic relationships (owner vs staff)

    await User.findOneAndUpdate(
      { clerkId: data.id },
      updates,
      { new: true }
    );

    console.log('✅ User updated in MongoDB');
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Handle user.deleted event
 * Deletes user from MongoDB when user is deleted in Clerk
 */
async function handleUserDeleted(data) {
  try {
    console.log('🗑️ User deleted event received:', data.id);

    const result = await User.findOneAndDelete({ clerkId: data.id });
    
    if (result) {
      console.log('✅ User deleted from MongoDB');
    } else {
      console.log('User not found in database');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
