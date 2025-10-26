/**
 * Prescription Controller
 * Handles prescription creation with DDI checks, storage, and PDF data
 */

import Prescription from '../models/prescription.js';
import Medication from '../models/medication.js';
import Patient from '../models/patient.js';
import User from '../models/user.js';
import Clinic from '../models/clinic.js';
import Appointment from '../models/appointment.js';
import { checkDDI } from '../utils/ddiEngine.js';
import { mapPrescriptionToFHIR } from '../utils/fhir.js';
import { getUserClinicRole, canCreatePrescription } from '../utils/rbacHelpers.js';
import logger from '../utils/logger.js';
import { logPrescriptionCreate, logDDIOverride } from '../utils/auditLogger.js';

/**
 * Create new prescription with DDI checking
 * POST /api/prescriptions
 * Only doctors and clinic owners can create prescriptions
 * Staff cannot create prescriptions
 */
export const createPrescription = async (req, res) => {
  try {
    const { userId } = req.auth;
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const {
      clinic,
      patient,
      appointment,
      meds,
      diagnosis,
      notes,
      overrideDDI, // Flag if doctor is overriding DDI warnings
    } = req.body;

    // Check if user can create prescriptions (doctor or owner, not staff)
    const canCreate = await canCreatePrescription(user._id, clinic);
    if (!canCreate) {
      return res.status(403).json({ 
        error: 'Permission denied',
        message: 'Only doctors and clinic owners can create prescriptions. Staff members do not have this permission.' 
      });
    }

    logger.info({ 
      clinic, 
      patient, 
      appointment,
      medsCount: meds?.length,
      diagnosisCount: diagnosis?.length 
    }, 'Creating prescription with data');

    if (!clinic || !patient || !meds || meds.length === 0) {
      return res.status(400).json({ 
        error: 'Clinic, patient, and medications are required' 
      });
    }

    // Verify entities exist
    const [clinicDoc, patientDoc] = await Promise.all([
      Clinic.findById(clinic),
      Patient.findById(patient),
    ]);

    if (!clinicDoc || !patientDoc) {
      return res.status(404).json({ error: 'Clinic or patient not found' });
    }

    // Check if prescription already exists for this appointment
    if (appointment) {
      const existingPrescription = await Prescription.findOne({ appointment });
      if (existingPrescription) {
        return res.status(400).json({ 
          error: 'A prescription already exists for this appointment. Please edit the existing prescription instead.',
          existingPrescriptionId: existingPrescription._id
        });
      }
    }

    // Validate and expand medication IDs to get compositions
    const medicationIds = meds.map(m => m.medication);
    const medications = await Medication.find({
      _id: { $in: medicationIds }
    }).populate('unique_composition');

    if (medications.length !== medicationIds.length) {
      return res.status(404).json({ error: 'One or more medications not found' });
    }

    // Prepare medication list with composition references
    const prescriptionMeds = meds.map(medInput => {
      const medication = medications.find(
        m => m._id.toString() === medInput.medication.toString()
      );

      return {
        medication: medication._id,
        compRefs: medication.unique_composition.map(c => c._id),
        dosage: medInput.dosage,
        frequency: medInput.frequency,
        duration: medInput.duration,
        notes: medInput.notes,
      };
    });

    // Run DDI check
    const ddiWarnings = await checkDDI(medicationIds);

    // If there are severe warnings and no override, reject
    const hasSevereWarnings = ddiWarnings.some(
      w => w.severity === 'contraindicated' || w.severity === 'major'
    );

    if (hasSevereWarnings && !overrideDDI) {
      return res.status(400).json({
        error: 'Severe drug interactions detected',
        ddiWarnings,
        requiresOverride: true,
      });
    }

    // Generate FHIR payload (placeholder for now)
    // Note: FHIR payload is a placeholder for future ABDM integration
    const fhirPayload = {
      resourceType: 'Bundle',
      type: 'document',
      timestamp: new Date().toISOString(),
      entry: [],
    };

    // Create prescription
    logger.info('About to create prescription document');
    const prescription = await Prescription.create({
      clinic,
      doctor: user._id,
      patient,
      appointment: appointment || undefined,
      meds: prescriptionMeds,
      diagnosis: diagnosis || [],
      notes,
      ddiWarnings: ddiWarnings.map(w => ({
        severity: w.severity,
        text: w.description,
        compA: w.compA?._id || w.compA,
        compB: w.compB?._id || w.compB,
        recommendation: w.recommendation,
      })),
      fhirPayload,
      abhaShareStatus: 'NOT_SHARED',
    });
    logger.info({ prescriptionId: prescription._id }, 'Prescription document created');

    // If appointment provided, link prescription and mark as completed
    if (appointment) {
      await Appointment.findByIdAndUpdate(appointment, {
        status: 'completed',
        $push: { prescriptions: prescription._id },
      });
      logger.info({ appointmentId: appointment, prescriptionId: prescription._id }, 
        'Appointment auto-completed after prescription creation');
    }

    // Audit logging
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    await logPrescriptionCreate(user._id, prescription._id, ipAddress, {
      patientId: patient,
      clinicId: clinic,
      medicationCount: meds.length,
    });

    if (hasSevereWarnings && overrideDDI) {
      await logDDIOverride(user._id, prescription._id, ipAddress, ddiWarnings);
    }

    logger.info('About to populate prescription');
    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('clinic')
      .populate('doctor')
      .populate('patient')
      .populate('appointment')
      .populate('meds.medication')
      .populate('meds.compRefs')
      .populate('ddiWarnings.compA')
      .populate('ddiWarnings.compB');
    logger.info('Prescription populated successfully');

    logger.info({ 
      prescriptionId: prescription._id, 
      clinicId: clinic,
      patientId: patient,
      ddiWarningCount: ddiWarnings.length 
    }, 'Prescription created');

    res.status(201).json(populatedPrescription);
  } catch (error) {
    logger.error({ 
      error: error.message,
      stack: error.stack,
      name: error.name 
    }, 'Error creating prescription');
    console.error('Full error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * Get prescription by ID
 * GET /api/prescriptions/:prescriptionId
 */
export const getPrescriptionById = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await Prescription.findById(prescriptionId)
      .populate('clinic')
      .populate('doctor')
      .populate('patient')
      .populate('appointment')
      .populate('meds.medication')
      .populate('meds.compRefs')
      .populate('ddiWarnings.compA')
      .populate('ddiWarnings.compB')
      .populate('editHistory.editedBy');

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    logger.error({ error }, 'Error fetching prescription');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update prescription
 * PUT /api/prescriptions/:prescriptionId
 */
export const updatePrescription = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { prescriptionId } = req.params;
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    const {
      meds,
      notes,
      overrideDDI,
    } = req.body;

    logger.info({ 
      prescriptionId,
      meds,
      notes,
      overrideDDI,
      medsCount: meds?.length,
      requestBody: req.body
    }, 'Updating prescription with data');

    if (!meds || meds.length === 0) {
      logger.error({ prescriptionId, meds }, 'Medications validation failed');
      return res.status(400).json({ error: 'Medications are required' });
    }

    // Validate and expand medication IDs to get compositions
    const medicationIds = meds.map(m => m.medication);
    const medications = await Medication.find({
      _id: { $in: medicationIds }
    }).populate('unique_composition');

    if (medications.length !== medicationIds.length) {
      return res.status(404).json({ error: 'One or more medications not found' });
    }

    // Prepare medication list with composition references
    const prescriptionMeds = meds.map(medInput => {
      const medication = medications.find(
        m => m._id.toString() === medInput.medication.toString()
      );

      return {
        medication: medication._id,
        compRefs: medication.unique_composition.map(c => c._id),
        dosage: medInput.dosage,
        frequency: medInput.frequency,
        duration: medInput.duration,
        notes: medInput.notes,
      };
    });

    // Run DDI check
    const ddiWarnings = await checkDDI(medicationIds);

    // If there are severe warnings and no override, reject
    const hasSevereWarnings = ddiWarnings.some(
      w => w.severity === 'contraindicated' || w.severity === 'major'
    );

    if (hasSevereWarnings && !overrideDDI) {
      return res.status(400).json({
        error: 'Severe drug interactions detected',
        ddiWarnings,
        requiresOverride: true,
      });
    }

    // Update prescription
    prescription.meds = prescriptionMeds;
    prescription.notes = notes;
    prescription.ddiWarnings = ddiWarnings.map(w => ({
      severity: w.severity,
      text: w.description,
      compA: w.compA?._id || w.compA,
      compB: w.compB?._id || w.compB,
      recommendation: w.recommendation,
    }));
    prescription.lastEditedAt = new Date();
    prescription.editHistory.push({
      editedAt: new Date(),
      editedBy: user._id,
    });

    await prescription.save();

    // Log edit action
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    await logPrescriptionCreate(user._id, prescription._id, ipAddress, {
      action: 'EDIT',
      editCount: prescription.editHistory.length,
    });

    if (hasSevereWarnings && overrideDDI) {
      await logDDIOverride(user._id, prescription._id, ipAddress, ddiWarnings);
    }

    const updatedPrescription = await Prescription.findById(prescription._id)
      .populate('clinic')
      .populate('doctor')
      .populate('patient')
      .populate('appointment')
      .populate('meds.medication')
      .populate('meds.compRefs')
      .populate('ddiWarnings.compA')
      .populate('ddiWarnings.compB')
      .populate('editHistory.editedBy');

    logger.info({ prescriptionId: prescription._id }, 'Prescription updated');
    res.json(updatedPrescription);
  } catch (error) {
    logger.error({ 
      error: error.message,
      stack: error.stack,
    }, 'Error updating prescription');
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * Delete prescription
 * DELETE /api/prescriptions/:prescriptionId
 */
export const deletePrescription = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { prescriptionId } = req.params;
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Remove prescription reference from appointment
    if (prescription.appointment) {
      await Appointment.findByIdAndUpdate(prescription.appointment, {
        $pull: { prescriptions: prescription._id },
      });
    }

    await Prescription.findByIdAndDelete(prescriptionId);

    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    await logPrescriptionCreate(user._id, prescriptionId, ipAddress, {
      action: 'DELETE',
      patientId: prescription.patient,
    });

    logger.info({ prescriptionId }, 'Prescription deleted');
    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    logger.error({ error: error.message }, 'Error deleting prescription');
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * Get patient's prescriptions
 * GET /api/patients/:patientId/prescriptions
 */
export const getPatientPrescriptions = async (req, res) => {
  try {
    // Accept patientId from both params and query for flexibility
    const patientId = req.params.patientId || req.query.patientId;
    const { limit = 20, page = 1 } = req.query;

    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    logger.info({ patientId, limit, page, source: req.params.patientId ? 'params' : 'query' }, 'Fetching patient prescriptions');

    const prescriptions = await Prescription.find({ patient: patientId })
      .populate('clinic')
      .populate('doctor')
      .populate('appointment') // Populate appointment to get visitType
      .populate('meds.medication')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Prescription.countDocuments({ patient: patientId });

    logger.info({ 
      patientId,
      prescriptionsFound: prescriptions.length,
      total,
      samplePrescriptions: prescriptions.slice(0, 2).map(p => ({
        id: p._id,
        appointmentId: p.appointment?._id,
        appointmentPopulated: typeof p.appointment === 'object' && p.appointment !== null,
        medsCount: p.meds?.length
      }))
    }, 'Patient prescriptions fetched');

    res.json({
      data: prescriptions, // Changed from prescriptions to data
      prescriptions, // Keep for backward compatibility
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching patient prescriptions');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get clinic's prescriptions
 * GET /api/clinics/:clinicId/prescriptions
 * Doctors only see their own prescriptions
 * Clinic owners and staff see all clinic prescriptions
 */
export const getClinicPrescriptions = async (req, res) => {
  try {
    const { userId } = req.auth;
    // Get clinicId from either params (direct route) or query (filter route)
    const clinicId = req.params.clinicId || req.query.clinicId;
    const { limit = 20, page = 1, startDate, endDate } = req.query;

    const filter = { clinic: clinicId };

    // Role-based filtering
    const user = await User.findOne({ clerkId: userId });
    const userRole = await getUserClinicRole(user._id, clinicId);
    
    // If user is a doctor (not owner, not staff), only show their prescriptions
    if (userRole === 'doctor') {
      filter.doctor = user._id;
      logger.info({ userId: user._id, role: userRole }, 'Doctor viewing only their prescriptions');
    }
    // Clinic owner and staff can see all prescriptions - no additional filter

    if (startDate && endDate) {
      // Date range - set times to cover full days
      const rangeStart = new Date(startDate);
      rangeStart.setHours(0, 0, 0, 0);
      
      const rangeEnd = new Date(endDate);
      rangeEnd.setHours(23, 59, 59, 999);
      
      filter.createdAt = {
        $gte: rangeStart,
        $lte: rangeEnd,
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const prescriptions = await Prescription.find(filter)
      .populate('doctor')
      .populate('patient')
      .populate('appointment') // Populate appointment to get visitType
      .populate('meds.medication')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Prescription.countDocuments(filter);

    res.json({
      data: prescriptions, // Changed from prescriptions to data
      prescriptions, // Keep for backward compatibility
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching clinic prescriptions');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Generate PDF data for prescription (for client-side rendering)
 * GET /api/prescriptions/:prescriptionId/pdf-data
 */
export const getPrescriptionPDFData = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await Prescription.findById(prescriptionId)
      .populate('clinic')
      .populate('doctor')
      .populate('patient')
      .populate('appointment') // Populate appointment to get visitType
      .populate('meds.medication')
      .populate('meds.compRefs')
      .lean();

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Prepare structured data for PDF generation
    const pdfData = {
      prescriptionId: prescription._id,
      date: prescription.createdAt,
      
      clinic: {
        name: prescription.clinic.name,
        address: prescription.clinic.address,
        contact: prescription.clinic.contact,
        logoUrl: prescription.clinic.logoUrl,
        hfrId: prescription.clinic.hfrId,
      },
      
      doctor: {
        name: prescription.doctor.name,
        qualifications: prescription.doctor.qualifications,
        specializations: prescription.doctor.specializations,
        hprId: prescription.doctor.hprId,
      },
      
      patient: {
        name: prescription.patient.name,
        age: prescription.patient.dob ? 
          Math.floor((new Date() - new Date(prescription.patient.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : 
          null,
        gender: prescription.patient.gender,
        phone: prescription.patient.phone,
        patientCode: prescription.patient.patientCodes?.find(
          pc => pc.clinic.toString() === prescription.clinic._id.toString()
        )?.code,
      },
      
      medications: prescription.meds.map(med => ({
        name: med.medication.brandName || med.medication.genericName,
        composition: med.compRefs.map(c => c.name).join(', '),
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        notes: med.notes,
      })),
      
      diagnosis: prescription.diagnosis,
      notes: prescription.notes,
      
      ddiWarnings: prescription.ddiWarnings.map(w => ({
        severity: w.severity,
        text: w.text,
        recommendation: w.recommendation,
      })),
    };

    res.json(pdfData);
  } catch (error) {
    logger.error({ error }, 'Error generating PDF data');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update prescription PDF URL (after client generates PDF and uploads to S3)
 * PATCH /api/prescriptions/:prescriptionId/pdf
 */
export const updatePrescriptionPDF = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { pdfUrl, pdfS3Key } = req.body;

    if (!pdfUrl || !pdfS3Key) {
      return res.status(400).json({ 
        error: 'PDF URL and S3 key are required' 
      });
    }

    const prescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      { pdfUrl, pdfS3Key },
      { new: true }
    )
    .populate('clinic')
    .populate('doctor')
    .populate('patient');

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    logger.info({ prescriptionId, pdfUrl }, 'Prescription PDF URL updated');
    res.json(prescription);
  } catch (error) {
    logger.error({ error }, 'Error updating prescription PDF');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get prescription statistics for a doctor
 * GET /api/prescriptions/stats?doctor=xxx&clinic=xxx&startDate=xxx&endDate=xxx
 */
export const getPrescriptionStats = async (req, res) => {
  try {
    const { doctor, clinic, startDate, endDate } = req.query;

    const filter = {};
    if (doctor) filter.doctor = doctor;
    if (clinic) filter.clinic = clinic;
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const total = await Prescription.countDocuments(filter);

    // Top medications prescribed
    const topMeds = await Prescription.aggregate([
      { $match: filter },
      { $unwind: '$meds' },
      { $group: {
        _id: '$meds.medication',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Populate medication details
    const Medication = (await import('../models/medication.js')).default;
    const topMedicationsWithDetails = await Medication.find({
      _id: { $in: topMeds.map(m => m._id) }
    });

    const topMedications = topMeds.map(tm => {
      const med = topMedicationsWithDetails.find(
        m => m._id.toString() === tm._id.toString()
      );
      return {
        medication: med,
        count: tm.count,
      };
    });

    // Common diagnoses
    const topDiagnoses = await Prescription.aggregate([
      { $match: filter },
      { $unwind: '$diagnosis' },
      { $group: {
        _id: '$diagnosis.text',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      total,
      topMedications,
      topDiagnoses: topDiagnoses.map(d => ({
        diagnosis: d._id,
        count: d.count,
      })),
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching prescription stats');
    res.status(500).json({ error: 'Internal server error' });
  }
};
