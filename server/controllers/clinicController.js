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
 * Requires valid subscription with available clinic slots
 */
export const createClinic = async (req, res) => {
  try {
    const { userId } = req.auth;
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check subscription limits
    const canCreate = await user.canCreateClinic();
    if (!canCreate) {
      const ownedClinics = await user.getOwnedClinics();
      return res.status(403).json({ 
        error: 'Subscription limit reached',
        message: 'You have reached the maximum number of clinics for your plan. Please upgrade to create more clinics.',
        currentPlan: user.subscription.plan,
        maxClinics: user.subscription.maxClinics,
        ownedClinics: ownedClinics.length,
      });
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

    logger.info({ 
      clinicId: clinic._id, 
      userId: user._id,
      subscription: user.subscription.plan 
    }, 'Clinic created');

    res.status(201).json(populatedClinic);
  } catch (error) {
    logger.error({ error }, 'Error creating clinic');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all clinics for current user with their roles
 * GET /api/clinics
 */
export const getClinics = async (req, res) => {
  try {
    const { userId } = req.auth;
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all clinics with roles
    const clinicsWithRoles = await user.getAllClinics();

    // Return in expected format { clinics: [...] }
    res.json({ 
      clinics: clinicsWithRoles,
      total: clinicsWithRoles.length 
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
 * Only clinic owner can invite staff
 * User must exist on platform before invitation
 */
export const inviteStaff = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { email, role } = req.body;
    const { userId } = req.auth;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    // Updated valid roles: only 'doctor' or 'staff'
    if (!['doctor', 'staff'].includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role. Must be "doctor" or "staff"' 
      });
    }

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    // Find user by email - must exist
    const invitedUser = await User.findOne({ email: email.toLowerCase() });

    if (!invitedUser) {
      return res.status(404).json({ 
        error: 'User not found on platform',
        message: 'Please ask the user to create an account first at your signup page.',
        suggestedAction: 'Share signup link with the user'
      });
    }

    // Check if trying to invite the owner
    if (clinic.owner.toString() === invitedUser._id.toString()) {
      return res.status(400).json({ 
        error: 'Cannot invite clinic owner as staff' 
      });
    }

    // Check if already invited or staff
    const alreadyStaff = clinic.staff.some(
      s => s.user.toString() === invitedUser._id.toString()
    );

    if (alreadyStaff) {
      return res.status(400).json({ 
        error: 'User already invited or is a staff member' 
      });
    }

    // Add to staff with pending status
    clinic.staff.push({
      user: invitedUser._id,
      role,
      invitedAt: new Date(),
      accepted: false,
    });

    await clinic.save();

    // Generate invite token (for future email links)
    const inviteToken = nanoid(32);

    // Send invitation email
    await sendStaffInviteEmail({
      to: email,
      clinicName: clinic.name,
      role,
      inviteToken,
    });

    // Log the invitation
    const inviter = await User.findOne({ clerkId: userId });
    await logStaffInvite(inviter._id, clinic._id, req.ip, email);

    logger.info({ 
      clinicId, 
      email, 
      role,
      invitedUserId: invitedUser._id 
    }, 'Staff invitation sent');

    res.status(200).json({
      message: 'Invitation sent successfully',
      invitedUser: {
        _id: invitedUser._id,
        name: invitedUser.name,
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
 * Reject staff invitation
 * POST /api/clinics/:clinicId/reject-invite
 */
export const rejectInvite = async (req, res) => {
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
      return res.status(400).json({ error: 'Cannot reject already accepted invitation' });
    }

    // Remove staff entry from clinic
    clinic.staff = clinic.staff.filter(
      s => s.user.toString() !== user._id.toString()
    );
    await clinic.save();

    logger.info({ clinicId, userId: user._id }, 'Staff invitation rejected');

    res.json({
      message: 'Invitation rejected successfully',
    });
  } catch (error) {
    logger.error({ error }, 'Error rejecting invitation');
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

    // Use $elemMatch to ensure both conditions apply to the SAME array element
    const clinics = await Clinic.find({
      staff: {
        $elemMatch: {
          user: user._id,
          accepted: false,
        },
      },
    }).populate('owner');

    const pendingInvites = clinics.map(clinic => {
      const staffEntry = clinic.staff.find(
        s => s.user.toString() === user._id.toString() && !s.accepted
      );

      return {
        _id: clinic._id, // Add _id at root level for accept/reject
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

    res.json({ invitations: pendingInvites, total: pendingInvites.length });
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
    if (pin) filter['address.pincode'] = pin;

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
      select: 'name email qualifications specializations',
    });

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    // Filter staff to only include doctors and always include owner
    const doctors = [];

    // Always add clinic owner as a doctor (clinic owners are doctors by default)
    const owner = await User.findById(clinic.owner);
    if (owner) {
      doctors.push({
        _id: owner._id,
        name: owner.name,
        email: owner.email,
        qualifications: owner.qualifications,
        specializations: owner.specializations,
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
            qualifications: staffEntry.user.qualifications,
            specializations: staffEntry.user.specializations,
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
