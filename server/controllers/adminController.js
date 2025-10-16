/**
 * Admin Controller
 * Handles admin-level operations: user management, system settings, fraud mitigation
 */

import User from '../models/user.js';
import Clinic from '../models/clinic.js';
import Patient from '../models/patient.js';
import Prescription from '../models/prescription.js';
import Appointment from '../models/appointment.js';
import AuditLog from '../models/auditLog.js';
import logger from '../utils/logger.js';
import { logAdminAction } from '../utils/auditLogger.js';

/**
 * Get all users with pagination and filters
 * GET /api/admin/users?page=1&limit=50&role=doctor&search=john
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, role, search } = req.query;

    const filter = {};
    
    if (role) {
      filter.roles = role;
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .populate('clinics')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching users');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Enable/disable user account
 * PATCH /api/admin/users/:userId/status
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const { userId: adminUserId } = req.auth;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled (boolean) is required' });
    }

    const user = await User.findById(targetUserId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user status (can add 'enabled' field to User model if needed)
    // For now, we'll add it dynamically
    user.set('enabled', enabled);
    await user.save();

    const admin = await User.findOne({ clerkId: adminUserId });
    await logAdminAction(
      admin._id,
      enabled ? 'ENABLE_USER' : 'DISABLE_USER',
      'user',
      user._id,
      req.ip,
      { userEmail: user.email }
    );

    logger.info({ userId: targetUserId, enabled }, 'User status updated');

    res.json({
      message: `User ${enabled ? 'enabled' : 'disabled'} successfully`,
      user,
    });
  } catch (error) {
    logger.error({ error }, 'Error updating user status');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get system statistics
 * GET /api/admin/stats
 */
export const getSystemStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalClinics,
      totalPatients,
      totalPrescriptions,
      totalAppointments,
      recentAuditLogs,
    ] = await Promise.all([
      User.countDocuments(),
      Clinic.countDocuments(),
      Patient.countDocuments(),
      Prescription.countDocuments(),
      Appointment.countDocuments(),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('actor'),
    ]);

    // User role breakdown
    const roleStats = await User.aggregate([
      { $unwind: '$roles' },
      {
        $group: {
          _id: '$roles',
          count: { $sum: 1 },
        },
      },
    ]);

    // Appointment status breakdown
    const appointmentStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      users: {
        total: totalUsers,
        byRole: roleStats.reduce((acc, r) => {
          acc[r._id] = r.count;
          return acc;
        }, {}),
      },
      clinics: {
        total: totalClinics,
      },
      patients: {
        total: totalPatients,
      },
      prescriptions: {
        total: totalPrescriptions,
      },
      appointments: {
        total: totalAppointments,
        byStatus: appointmentStats.reduce((acc, a) => {
          acc[a._id] = a.count;
          return acc;
        }, {}),
      },
      recentAuditLogs,
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching system stats');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get audit logs with filters
 * GET /api/admin/audit-logs?actor=xxx&action=xxx&resource=xxx&page=1&limit=50
 */
export const getAuditLogs = async (req, res) => {
  try {
    const { 
      actor, 
      action, 
      resource, 
      startDate, 
      endDate,
      page = 1, 
      limit = 50 
    } = req.query;

    const filter = {};
    
    if (actor) filter.actor = actor;
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AuditLog.find(filter)
      .populate('actor')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await AuditLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching audit logs');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Fraud detection: Find suspicious activities
 * GET /api/admin/fraud-detection
 */
export const detectFraud = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Find doctors with unusually high prescription counts
    const highVolumeDoctors = await Prescription.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$doctor',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const User = (await import('../models/user.js')).default;
    const doctorDocs = await User.find({
      _id: { $in: highVolumeDoctors.map(d => d._id) }
    });

    const suspiciousDoctors = highVolumeDoctors.map(hvd => {
      const doctor = doctorDocs.find(d => d._id.toString() === hvd._id.toString());
      return {
        doctor: {
          _id: doctor._id,
          name: doctor.name,
          email: doctor.email,
        },
        prescriptionCount: hvd.count,
        avgPerDay: (hvd.count / parseInt(days)).toFixed(2),
      };
    });

    // Find patients with multiple visits in short time
    const frequentPatients = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$patient',
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gte: 5 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const patients = await Patient.find({
      _id: { $in: frequentPatients.map(p => p._id) }
    });

    const suspiciousPatients = frequentPatients.map(fp => {
      const patient = patients.find(p => p._id.toString() === fp._id.toString());
      return {
        patient: {
          _id: patient._id,
          name: patient.name,
          phone: patient.phone,
        },
        visitCount: fp.count,
      };
    });

    res.json({
      period: `Last ${days} days`,
      suspiciousDoctors,
      suspiciousPatients,
    });
  } catch (error) {
    logger.error({ error }, 'Error detecting fraud');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete user (soft delete)
 * DELETE /api/admin/users/:userId
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const { userId: adminUserId } = req.auth;

    // TODO: Implement soft delete instead of hard delete
    // For now, just mark as deleted
    const user = await User.findById(targetUserId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.set('deleted', true);
    user.set('deletedAt', new Date());
    await user.save();

    const admin = await User.findOne({ clerkId: adminUserId });
    await logAdminAction(
      admin._id,
      'DELETE_USER',
      'user',
      user._id,
      req.ip,
      { userEmail: user.email }
    );

    logger.info({ userId: targetUserId }, 'User soft deleted');

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error({ error }, 'Error deleting user');
    res.status(500).json({ error: 'Internal server error' });
  }
};
