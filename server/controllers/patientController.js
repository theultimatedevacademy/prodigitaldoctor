/**
 * Patient Controller
 * Handles patient management, code generation, and linking
 */

import Patient from '../models/patient.js';
import User from '../models/user.js';
import Clinic from '../models/clinic.js';
import Prescription from '../models/prescription.js';
import Appointment from '../models/appointment.js';
import { generatePatientCode } from '../utils/patientCodeGenerator.js';
import logger from '../utils/logger.js';
import { logPatientAccess } from '../utils/auditLogger.js';
import mongoose from 'mongoose';

/**
 * Create new patient with automatic code generation
 * POST /api/patients
 */
export const createPatient = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId } = req.auth;
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'User not found' });
    }

    const {
      name,
      dob,
      gender,
      phone,
      email,
      addresses,
      clinic,
      doctor,
      notes,
    } = req.body;

    if (!name || !clinic || !doctor) {
      await session.abortTransaction();
      return res.status(400).json({ 
        error: 'Name, clinic, and doctor are required' 
      });
    }

    // Verify clinic and doctor exist
    const clinicDoc = await Clinic.findById(clinic);
    const doctorDoc = await User.findById(doctor);

    if (!clinicDoc || !doctorDoc) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Clinic or doctor not found' });
    }

    // Generate patient code
    const patientCode = await generatePatientCode(
      clinic,
      doctor,
      clinicDoc.name,
      doctorDoc.name
    );

    // Create patient
    const patient = await Patient.create([{
      name,
      dob,
      gender,
      phone,
      email,
      addresses: addresses || [],
      patientCodes: [{
        clinic,
        doctor,
        code: patientCode,
        active: true,
      }],
      notes,
    }], { session });

    await session.commitTransaction();

    const populatedPatient = await Patient.findById(patient[0]._id)
      .populate('patientCodes.clinic')
      .populate('patientCodes.doctor');

    logger.info({ 
      patientId: patient[0]._id, 
      patientCode,
      clinicId: clinic,
      doctorId: doctor 
    }, 'Patient created');

    res.status(201).json(populatedPatient);
  } catch (error) {
    await session.abortTransaction();
    logger.error({ error }, 'Error creating patient');
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'Patient code already exists. Please try again.' 
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    session.endSession();
  }
};

/**
 * Search patients by name or patient code
 * GET /api/patients/search?q=John&clinic=xxx
 */
export const searchPatients = async (req, res) => {
  try {
    const { q, clinic, limit = 20, page = 1 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ 
        error: 'Search query must be at least 2 characters' 
      });
    }

    const filter = {};

    // Search by patient code or name
    if (q.includes('-')) {
      // Looks like a patient code
      filter['patientCodes.code'] = new RegExp(q, 'i');
    } else {
      // Search by name
      filter.$text = { $search: q };
    }

    // Filter by clinic if provided (exclude 'null' string)
    if (clinic && clinic !== 'null' && clinic !== 'undefined') {
      filter['patientCodes.clinic'] = clinic;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const patients = await Patient.find(filter)
      .populate('patientCodes.clinic')
      .populate('patientCodes.doctor')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Patient.countDocuments(filter);

    res.json({
      patients,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error searching patients');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get patient by ID
 * GET /api/patients/:patientId
 */
export const getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { userId } = req.auth;

    const patient = await Patient.findById(patientId)
      .populate('patientCodes.clinic')
      .populate('patientCodes.doctor');

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Log patient access
    const user = await User.findOne({ clerkId: userId });
    await logPatientAccess(user._id, patient._id, req.ip);

    res.json(patient);
  } catch (error) {
    logger.error({ error }, 'Error fetching patient');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get patient history (prescriptions, appointments)
 * GET /api/patients/:patientId/history
 */
export const getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get prescriptions
    const prescriptions = await Prescription.find({ patient: patientId })
      .populate('doctor clinic')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get appointments
    const appointments = await Appointment.find({ patient: patientId })
      .populate('doctor clinic')
      .sort({ startAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalPrescriptions = await Prescription.countDocuments({ patient: patientId });
    const totalAppointments = await Appointment.countDocuments({ patient: patientId });

    res.json({
      patient,
      prescriptions: {
        data: prescriptions,
        total: totalPrescriptions,
      },
      appointments: {
        data: appointments,
        total: totalAppointments,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching patient history');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Link patient to code (for patients to access their records)
 * POST /api/patients/link-code
 */
export const linkPatientCode = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { patientCode, phone, otp } = req.body;

    if (!patientCode || !phone) {
      return res.status(400).json({ 
        error: 'Patient code and phone number are required' 
      });
    }

    // TODO: Verify OTP (implement OTP service)
    // For now, skip OTP verification in development
    if (process.env.NODE_ENV === 'production' && !otp) {
      return res.status(400).json({ error: 'OTP is required' });
    }

    // Find patient by code and phone
    const patient = await Patient.findOne({
      'patientCodes.code': patientCode,
      phone: phone,
    });

    if (!patient) {
      return res.status(404).json({ 
        error: 'Patient not found with given code and phone number' 
      });
    }

    // Link to user account
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the specific patient code entry
    const codeEntry = patient.patientCodes.find(pc => pc.code === patientCode);
    
    if (!codeEntry) {
      return res.status(404).json({ error: 'Patient code not found' });
    }

    // Add to user's linked patient codes if not already there
    const alreadyLinked = user.linkedPatientCodes.some(
      lpc => lpc.code === patientCode
    );

    if (!alreadyLinked) {
      user.linkedPatientCodes.push({
        clinic: codeEntry.clinic,
        doctor: codeEntry.doctor,
        code: patientCode,
      });
      await user.save();
    }

    logger.info({ userId: user._id, patientCode }, 'Patient code linked to user');

    res.json({
      message: 'Patient code linked successfully',
      patient: await Patient.findById(patient._id)
        .populate('patientCodes.clinic')
        .populate('patientCodes.doctor'),
    });
  } catch (error) {
    logger.error({ error }, 'Error linking patient code');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get linked patients for current user
 * GET /api/patients/linked
 */
export const getLinkedPatients = async (req, res) => {
  try {
    const { userId } = req.auth;
    const user = await User.findOne({ clerkId: userId })
      .populate('linkedPatientCodes.clinic')
      .populate('linkedPatientCodes.doctor');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get full patient details for each linked code
    const patientCodes = user.linkedPatientCodes.map(lpc => lpc.code);
    
    const patients = await Patient.find({
      'patientCodes.code': { $in: patientCodes }
    })
    .populate('patientCodes.clinic')
    .populate('patientCodes.doctor');

    res.json(patients);
  } catch (error) {
    logger.error({ error }, 'Error fetching linked patients');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update patient details
 * PATCH /api/patients/:patientId
 */
export const updatePatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const updates = req.body;

    // Prevent updating certain fields
    delete updates.patientCodes;
    delete updates._id;

    const patient = await Patient.findByIdAndUpdate(
      patientId,
      updates,
      { new: true, runValidators: true }
    )
    .populate('patientCodes.clinic')
    .populate('patientCodes.doctor');

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    logger.info({ patientId }, 'Patient updated');
    res.json(patient);
  } catch (error) {
    logger.error({ error }, 'Error updating patient');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get patients list for a clinic
 * GET /api/patients?clinicId=xxx
 */
export const getClinicPatients = async (req, res) => {
  try {
    const { clinicId, limit = 20, page = 1 } = req.query;
    
    if (!clinicId || clinicId === 'null' || clinicId === 'undefined') {
      return res.json({
        patients: [],
        pagination: { total: 0, page: 1, limit: parseInt(limit), pages: 0 },
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const patients = await Patient.find({
      'patientCodes.clinic': clinicId
    })
    .populate('patientCodes.clinic')
    .populate('patientCodes.doctor')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

    const total = await Patient.countDocuments({
      'patientCodes.clinic': clinicId
    });

    res.json({
      patients,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching clinic patients');
    res.status(500).json({ error: 'Internal server error' });
  }
};
