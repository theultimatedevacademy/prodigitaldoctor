/**
 * Clinic Controller
 * Handles clinic management, staff invitations, and clinic switching
 */

import Clinic from '../models/clinic.js';
import User from '../models/user.js';
import { nanoid } from 'nanoid';
import logger from '../utils/logger.js';
import { sendStaffInviteEmail } from '../utils/emailService.js';
import { logStaffInvite } from '../utils/auditLogger.js';

/**
 * Create a new clinic
 * POST /api/clinics
 */
export const createClinic = async (req, res) => {
  try {
    const { userId } = req.auth;
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has clinic_owner or doctor role
    const canCreateClinic = user.roles.includes('clinic_owner') || user.roles.includes('doctor');
    if (!canCreateClinic) {
      return res.status(403).json({ 
        error: 'Only doctors and clinic owners can create clinics' 
      });
    }

    // Auto-add clinic_owner role when they create their first clinic
    if (!user.roles.includes('clinic_owner')) {
      user.roles.push('clinic_owner');
      logger.info({ userId: user._id }, 'User promoted to clinic_owner role');
    }

    const {
      name,
      address,
      contact,
      logoUrl,
      workingHours,
      hfrId,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Clinic name is required' });
    }

    // Create clinic
    const clinic = await Clinic.create({
      name,
      address,
      contact,
      logoUrl,
      workingHours,
      owner: user._id,
      hfrId,
      staff: [],
    });

    // Add clinic to user's clinics array
    user.clinics.push(clinic._id);
    await user.save();

    const populatedClinic = await Clinic.findById(clinic._id).populate('owner');

    logger.info({ clinicId: clinic._id, userId: user._id }, 'Clinic created');

    res.status(201).json(populatedClinic);
  } catch (error) {
    logger.error({ error }, 'Error creating clinic');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all clinics for current user
 * GET /api/clinics
 */
export const getClinics = async (req, res) => {
  try {
    const { userId } = req.auth;
    const user = await User.findOne({ clerkId: userId }).populate({
      path: 'clinics',
      populate: { path: 'owner' }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return in expected format { clinics: [...] }
    res.json({ 
      clinics: user.clinics || [],
      total: user.clinics?.length || 0 
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching clinics');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get single clinic by ID
 * GET /api/clinics/:clinicId
 */
export const getClinicById = async (req, res) => {
  try {
    const { clinicId } = req.params;

    const clinic = await Clinic.findById(clinicId)
      .populate('owner')
      .populate('staff.user');

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    res.json(clinic);
  } catch (error) {
    logger.error({ error }, 'Error fetching clinic');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update clinic details
 * PATCH /api/clinics/:clinicId
 */
export const updateClinic = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const updates = req.body;

    // Prevent updating owner or staff through this endpoint
    delete updates.owner;
    delete updates.staff;

    const clinic = await Clinic.findByIdAndUpdate(
      clinicId,
      updates,
      { new: true, runValidators: true }
    ).populate('owner');

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    logger.info({ clinicId }, 'Clinic updated');
    res.json(clinic);
  } catch (error) {
    logger.error({ error }, 'Error updating clinic');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Invite staff to clinic
 * POST /api/clinics/:clinicId/invite
 */
export const inviteStaff = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { email, role } = req.body;
    const { userId } = req.auth;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    if (!['doctor', 'assistant', 'receptionist'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    // Find or create user by email
    let invitedUser = await User.findOne({ email: email.toLowerCase() });

    if (!invitedUser) {
      // Create placeholder user (will be updated when they sign up)
      invitedUser = await User.create({
        email: email.toLowerCase(),
        clerkId: `pending_${nanoid(16)}`, // Temporary clerkId
        roles: [role === 'doctor' ? 'doctor' : 'assistant'],
        name: email.split('@')[0], // Temporary name
      });
    }

    // Check if already invited or staff
    const alreadyStaff = clinic.staff.some(
      s => s.user.toString() === invitedUser._id.toString()
    );

    if (alreadyStaff) {
      return res.status(400).json({ error: 'User already invited or is staff' });
    }

    // Add to staff with pending status
    clinic.staff.push({
      user: invitedUser._id,
      role,
      invitedAt: new Date(),
      accepted: false,
    });

    await clinic.save();

    // Generate invite token
    const inviteToken = nanoid(32);
    
    // TODO: Store invite token in database for verification
    // For now, we'll just send the email

    // Send invitation email (dummy)
    await sendStaffInviteEmail({
      to: email,
      clinicName: clinic.name,
      role,
      inviteToken,
    });

    // Log the invitation
    const inviter = await User.findOne({ clerkId: userId });
    await logStaffInvite(inviter._id, clinic._id, req.ip, email);

    logger.info({ clinicId, email, role }, 'Staff invitation sent');

    res.status(200).json({
      message: 'Invitation sent successfully',
      invitedUser: {
        email: invitedUser.email,
        role,
        status: 'pending',
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error inviting staff');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Accept staff invitation
 * POST /api/clinics/:clinicId/accept-invite
 */
export const acceptInvite = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { userId } = req.auth;

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    // Find staff entry
    const staffEntry = clinic.staff.find(
      s => s.user.toString() === user._id.toString()
    );

    if (!staffEntry) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (staffEntry.accepted) {
      return res.status(400).json({ error: 'Invitation already accepted' });
    }

    // Accept invitation
    staffEntry.accepted = true;
    await clinic.save();

    // Add clinic to user's clinics if not already there
    if (!user.clinics.includes(clinic._id)) {
      user.clinics.push(clinic._id);
      await user.save();
    }

    logger.info({ clinicId, userId: user._id }, 'Staff invitation accepted');

    res.json({
      message: 'Invitation accepted successfully',
      clinic: await Clinic.findById(clinicId).populate('owner'),
    });
  } catch (error) {
    logger.error({ error }, 'Error accepting invitation');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get pending invitations for current user
 * GET /api/clinics/invitations/pending
 */
export const getPendingInvitations = async (req, res) => {
  try {
    const { userId } = req.auth;
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find all clinics where user has pending invitation
    const clinics = await Clinic.find({
      'staff.user': user._id,
      'staff.accepted': false,
    }).populate('owner');

    const pendingInvites = clinics.map(clinic => {
      const staffEntry = clinic.staff.find(
        s => s.user.toString() === user._id.toString() && !s.accepted
      );

      return {
        clinic: {
          _id: clinic._id,
          name: clinic.name,
          owner: clinic.owner,
          address: clinic.address,
        },
        role: staffEntry.role,
        invitedAt: staffEntry.invitedAt,
      };
    });

    res.json(pendingInvites);
  } catch (error) {
    logger.error({ error }, 'Error fetching pending invitations');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Remove staff member
 * DELETE /api/clinics/:clinicId/staff/:staffUserId
 */
export const removeStaff = async (req, res) => {
  try {
    const { clinicId, staffUserId } = req.params;

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    // Remove staff entry
    clinic.staff = clinic.staff.filter(
      s => s.user.toString() !== staffUserId
    );

    await clinic.save();

    // Remove clinic from user's clinics
    const staffUser = await User.findById(staffUserId);
    if (staffUser) {
      staffUser.clinics = staffUser.clinics.filter(
        c => c.toString() !== clinicId
      );
      await staffUser.save();
    }

    logger.info({ clinicId, staffUserId }, 'Staff member removed');

    res.json({ message: 'Staff member removed successfully' });
  } catch (error) {
    logger.error({ error }, 'Error removing staff');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Search clinics by location (public endpoint)
 * GET /api/clinics/search?city=Mumbai&pin=400001
 */
export const searchClinics = async (req, res) => {
  try {
    const { city, pin, limit = 20, page = 1 } = req.query;

    const filter = {};
    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (pin) filter['address.pin'] = pin;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const clinics = await Clinic.find(filter)
      .select('name address contact logoUrl')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Clinic.countDocuments(filter);

    res.json({
      clinics,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error searching clinics');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get doctors for a clinic
 * GET /api/clinics/:clinicId/doctors
 */
export const getClinicDoctors = async (req, res) => {
  try {
    const { clinicId } = req.params;

    const clinic = await Clinic.findById(clinicId).populate({
      path: 'staff.user',
      select: 'name email roles',
    });

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    // Filter staff to only include doctors and owner if they are a doctor
    const doctors = [];

    // Add owner if they are a doctor
    const owner = await User.findById(clinic.owner);
    if (owner && owner.roles.includes('doctor')) {
      doctors.push({
        _id: owner._id,
        name: owner.name,
        email: owner.email,
        roles: owner.roles,
        isOwner: true,
      });
    }

    // Add staff doctors
    clinic.staff.forEach(staffEntry => {
      if (
        staffEntry.role === 'doctor' &&
        staffEntry.accepted &&
        staffEntry.user
      ) {
        // Avoid duplicates if owner is also in staff
        if (!doctors.find(d => d._id.toString() === staffEntry.user._id.toString())) {
          doctors.push({
            _id: staffEntry.user._id,
            name: staffEntry.user.name,
            email: staffEntry.user.email,
            roles: staffEntry.user.roles,
            isOwner: false,
          });
        }
      }
    });

    res.json({ doctors });
  } catch (error) {
    logger.error({ error }, 'Error fetching clinic doctors');
    res.status(500).json({ error: 'Internal server error' });
  }
};
