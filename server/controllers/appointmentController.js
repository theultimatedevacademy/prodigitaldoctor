/**
 * Appointment Controller
 * Handles appointment booking, conflict detection, and calendar views
 */

import Appointment from '../models/appointment.js';
import Patient from '../models/patient.js';
import User from '../models/user.js';
import Clinic from '../models/clinic.js';
import { generatePatientCode } from '../utils/patientCodeGenerator.js';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';

/**
 * Create new appointment with conflict detection
 * POST /api/appointments
 */
export const createAppointment = async (req, res) => {
  try {
    const { userId } = req.auth;
    const {
      clinic,
      doctor,
      patient,
      startAt,
      endAt,
      notes,
    } = req.body;

    if (!clinic || !doctor || !patient || !startAt) {
      return res.status(400).json({ 
        error: 'Clinic, doctor, patient, and start time are required' 
      });
    }

    // Verify entities exist
    const [clinicDoc, doctorDoc, patientDoc] = await Promise.all([
      Clinic.findById(clinic),
      User.findById(doctor),
      Patient.findById(patient),
    ]);

    if (!clinicDoc || !doctorDoc || !patientDoc) {
      return res.status(404).json({ 
        error: 'Clinic, doctor, or patient not found' 
      });
    }

    // Time conflict check disabled - allowing overlapping appointments
    const startTime = new Date(startAt);
    const endTime = endAt ? new Date(endAt) : new Date(startTime.getTime() + 30 * 60000); // Default 30 min

    // const conflicts = await Appointment.find({
    //   doctor,
    //   status: { $in: ['scheduled'] },
    //   $or: [
    //     // New appointment starts during existing appointment
    //     {
    //       startAt: { $lte: startTime },
    //       endAt: { $gt: startTime },
    //     },
    //     // New appointment ends during existing appointment
    //     {
    //       startAt: { $lt: endTime },
    //       endAt: { $gte: endTime },
    //     },
    //     // New appointment completely contains existing appointment
    //     {
    //       startAt: { $gte: startTime },
    //       endAt: { $lte: endTime },
    //     },
    //   ],
    // });

    // if (conflicts.length > 0) {
    //   return res.status(409).json({ 
    //     error: 'Time slot conflicts with existing appointment',
    //     conflicts: conflicts.map(c => ({
    //       id: c._id,
    //       startAt: c.startAt,
    //       endAt: c.endAt,
    //     })),
    //   });
    // }

    // Get current user
    const user = await User.findOne({ clerkId: userId });

    // Create appointment
    const appointment = await Appointment.create({
      clinic,
      doctor,
      patient,
      startAt: startTime,
      endAt: endTime,
      status: 'scheduled',
      notes,
      createdBy: user._id,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('clinic')
      .populate('doctor')
      .populate('patient')
      .populate('createdBy')
      .populate('prescriptions');

    logger.info({ 
      appointmentId: appointment._id, 
      clinicId: clinic,
      doctorId: doctor,
      patientId: patient 
    }, 'Appointment created');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    logger.error({ error }, 'Error creating appointment');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get appointments list with filters
 * GET /api/appointments?clinic=xxx&doctor=xxx&date=2024-01-01&status=scheduled
 */
export const getAppointments = async (req, res) => {
  try {
    const { 
      clinic, 
      doctor, 
      patient,
      date, 
      startDate,
      endDate,
      status,
      limit = 50,
      page = 1 
    } = req.query;

    const filter = {};

    // Filter out 'null' string values and null/undefined
    if (clinic && clinic !== 'null' && clinic !== 'undefined') filter.clinic = clinic;
    if (doctor && doctor !== 'null' && doctor !== 'undefined') filter.doctor = doctor;
    if (patient && patient !== 'null' && patient !== 'undefined') filter.patient = patient;
    if (status && status !== 'null' && status !== 'undefined') filter.status = status;

    // Date filtering
    if (date) {
      // Single day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      filter.startAt = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    } else if (startDate && endDate) {
      // Date range
      filter.startAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const appointments = await Appointment.find(filter)
      .populate('clinic')
      .populate('doctor')
      .populate('patient')
      .populate('createdBy')
      .populate('prescriptions')
      .sort({ startAt: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Appointment.countDocuments(filter);

    res.json({
      appointments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching appointments');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get appointment by ID
 * GET /api/appointments/:appointmentId
 */
export const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate('clinic')
      .populate('doctor')
      .populate('patient')
      .populate('createdBy')
      .populate('prescriptions');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    logger.error({ error }, 'Error fetching appointment');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update appointment
 * PATCH /api/appointments/:appointmentId
 */
export const updateAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const updates = req.body;

    // Prevent changing certain fields
    delete updates.clinic;
    delete updates.doctor;
    delete updates.patient;
    delete updates.createdBy;

    // Time conflict check disabled - allowing overlapping appointments
    // if (updates.startAt || updates.endAt) {
    //   const existingAppointment = await Appointment.findById(appointmentId);
    //   
    //   if (!existingAppointment) {
    //     return res.status(404).json({ error: 'Appointment not found' });
    //   }

    //   const startTime = updates.startAt ? new Date(updates.startAt) : existingAppointment.startAt;
    //   const endTime = updates.endAt ? new Date(updates.endAt) : existingAppointment.endAt;

    //   const conflicts = await Appointment.find({
    //     _id: { $ne: appointmentId }, // Exclude current appointment
    //     doctor: existingAppointment.doctor,
    //     status: { $in: ['scheduled'] },
    //     $or: [
    //       {
    //         startAt: { $lte: startTime },
    //         endAt: { $gt: startTime },
    //       },
    //       {
    //         startAt: { $lt: endTime },
    //         endAt: { $gte: endTime },
    //       },
    //       {
    //         startAt: { $gte: startTime },
    //         endAt: { $lte: endTime },
    //       },
    //     ],
    //   });

    //   if (conflicts.length > 0) {
    //     return res.status(409).json({ 
    //       error: 'Updated time conflicts with existing appointment',
    //       conflicts: conflicts.map(c => ({
    //         id: c._id,
    //         startAt: c.startAt,
    //         endAt: c.endAt,
    //       })),
    //     });
    //   }
    // }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updates,
      { new: true, runValidators: true }
    )
    .populate('clinic')
    .populate('doctor')
    .populate('patient')
    .populate('createdBy');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    logger.info({ appointmentId }, 'Appointment updated');
    res.json(appointment);
  } catch (error) {
    logger.error({ error }, 'Error updating appointment');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Cancel appointment
 * POST /api/appointments/:appointmentId/cancel
 */
export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { 
        status: 'cancelled',
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
      },
      { new: true }
    )
    .populate('clinic')
    .populate('doctor')
    .populate('patient');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    logger.info({ appointmentId }, 'Appointment cancelled');
    res.json(appointment);
  } catch (error) {
    logger.error({ error }, 'Error cancelling appointment');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Mark appointment as completed
 * POST /api/appointments/:appointmentId/complete
 */
export const completeAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: 'completed' },
      { new: true }
    )
    .populate('clinic')
    .populate('doctor')
    .populate('patient');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    logger.info({ appointmentId }, 'Appointment marked as completed');
    res.json(appointment);
  } catch (error) {
    logger.error({ error }, 'Error completing appointment');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get calendar view for doctor
 * GET /api/appointments/calendar?doctor=xxx&startDate=xxx&endDate=xxx
 */
export const getCalendarView = async (req, res) => {
  try {
    const { doctor, clinic, startDate, endDate } = req.query;

    if (!doctor || !startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Doctor, start date, and end date are required' 
      });
    }

    const filter = {
      doctor,
      startAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    if (clinic) {
      filter.clinic = clinic;
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name phone')
      .populate('clinic', 'name')
      .sort({ startAt: 1 });

    // Group by date
    const calendar = {};
    appointments.forEach(apt => {
      const date = apt.startAt.toISOString().split('T')[0];
      if (!calendar[date]) {
        calendar[date] = [];
      }
      calendar[date].push(apt);
    });

    res.json({
      calendar,
      appointments,
      summary: {
        total: appointments.length,
        scheduled: appointments.filter(a => a.status === 'scheduled').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching calendar view');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create first visit appointment with temp patient data
 * POST /api/appointments/first-visit
 */
export const createFirstVisitAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId } = req.auth;
    const { clinic, doctor, name, phone, startAt, endAt, notes } = req.body;

    if (!clinic || !doctor || !name || !phone || !startAt) {
      await session.abortTransaction();
      return res.status(400).json({
        error: 'Clinic, doctor, name, phone, and start time are required',
      });
    }

    // Verify clinic and doctor exist
    const [clinicDoc, doctorDoc] = await Promise.all([
      Clinic.findById(clinic),
      User.findById(doctor),
    ]);

    if (!clinicDoc || !doctorDoc) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Clinic or doctor not found' });
    }

    // Time conflict check disabled - allowing overlapping appointments
    const startTime = new Date(startAt);
    const endTime = endAt ? new Date(endAt) : new Date(startTime.getTime() + 30 * 60000);

    // const conflicts = await Appointment.find({
    //   doctor,
    //   status: { $in: ['scheduled'] },
    //   $or: [
    //     { startAt: { $lte: startTime }, endAt: { $gt: startTime } },
    //     { startAt: { $lt: endTime }, endAt: { $gte: endTime } },
    //     { startAt: { $gte: startTime }, endAt: { $lte: endTime } },
    //   ],
    // });

    // if (conflicts.length > 0) {
    //   await session.abortTransaction();
    //   return res.status(409).json({
    //     error: 'Time slot conflicts with existing appointment',
    //     conflicts: conflicts.map(c => ({
    //       id: c._id,
    //       startAt: c.startAt,
    //       endAt: c.endAt,
    //     })),
    //   });
    // }

    // Generate patient code
    const patientCode = await generatePatientCode(
      clinic,
      doctor,
      clinicDoc.name,
      doctorDoc.name
    );

    // Create patient record
    const patient = await Patient.create(
      [
        {
          name,
          phone,
          patientCodes: [
            {
              clinic,
              doctor,
              code: patientCode,
              active: true,
            },
          ],
        },
      ],
      { session }
    );

    // Get current user
    const user = await User.findOne({ clerkId: userId });

    // Create appointment
    const appointment = await Appointment.create(
      [
        {
          clinic,
          doctor,
          patient: patient[0]._id,
          visitType: 'first_visit',
          tempPatientData: { name, phone },
          startAt: startTime,
          endAt: endTime,
          status: 'scheduled',
          notes,
          createdBy: user._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    const populatedAppointment = await Appointment.findById(appointment[0]._id)
      .populate('clinic')
      .populate('doctor')
      .populate('patient')
      .populate('createdBy')
      .populate('prescriptions');

    logger.info(
      {
        appointmentId: appointment[0]._id,
        patientId: patient[0]._id,
        patientCode,
        clinicId: clinic,
        doctorId: doctor,
      },
      'First visit appointment created'
    );

    res.status(201).json({
      appointment: populatedAppointment,
      patientCode,
    });
  } catch (error) {
    await session.abortTransaction();
    logger.error({ error }, 'Error creating first visit appointment');

    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Patient code already exists. Please try again.',
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  } finally {
    session.endSession();
  }
};

/**
 * Create follow-up appointment with existing patient
 * POST /api/appointments/follow-up
 */
export const createFollowUpAppointment = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { clinic, doctor, patient, startAt, endAt, notes } = req.body;

    if (!clinic || !doctor || !patient || !startAt) {
      return res.status(400).json({
        error: 'Clinic, doctor, patient, and start time are required',
      });
    }

    // Verify entities exist
    const [clinicDoc, doctorDoc, patientDoc] = await Promise.all([
      Clinic.findById(clinic),
      User.findById(doctor),
      Patient.findById(patient),
    ]);

    if (!clinicDoc || !doctorDoc || !patientDoc) {
      return res.status(404).json({
        error: 'Clinic, doctor, or patient not found',
      });
    }

    // Time conflict check disabled - allowing overlapping appointments
    const startTime = new Date(startAt);
    const endTime = endAt ? new Date(endAt) : new Date(startTime.getTime() + 30 * 60000);

    // const conflicts = await Appointment.find({
    //   doctor,
    //   status: { $in: ['scheduled'] },
    //   $or: [
    //     { startAt: { $lte: startTime }, endAt: { $gt: startTime } },
    //     { startAt: { $lt: endTime }, endAt: { $gte: endTime } },
    //     { startAt: { $gte: startTime }, endAt: { $lte: endTime } },
    //   ],
    // });

    // if (conflicts.length > 0) {
    //   return res.status(409).json({
    //     error: 'Time slot conflicts with existing appointment',
    //     conflicts: conflicts.map(c => ({
    //       id: c._id,
    //       startAt: c.startAt,
    //       endAt: c.endAt,
    //     })),
    //   });
    // }

    // Get current user
    const user = await User.findOne({ clerkId: userId });

    // Create appointment
    const appointment = await Appointment.create({
      clinic,
      doctor,
      patient,
      visitType: 'follow_up',
      startAt: startTime,
      endAt: endTime,
      status: 'scheduled',
      notes,
      createdBy: user._id,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('clinic')
      .populate('doctor')
      .populate('patient')
      .populate('createdBy')
      .populate('prescriptions');

    logger.info(
      {
        appointmentId: appointment._id,
        clinicId: clinic,
        doctorId: doctor,
        patientId: patient,
      },
      'Follow-up appointment created'
    );

    res.status(201).json(populatedAppointment);
  } catch (error) {
    logger.error({ error }, 'Error creating follow-up appointment');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Search patients by code or phone for appointment booking
 * GET /api/appointments/search-patients?q=xxx&clinicId=xxx
 */
export const searchPatientsForAppointment = async (req, res) => {
  try {
    const { q, clinicId } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters',
      });
    }

    if (!clinicId || clinicId === 'null' || clinicId === 'undefined') {
      return res.status(400).json({ error: 'Clinic ID is required' });
    }

    // Search by patient code or phone number
    const filter = {
      'patientCodes.clinic': clinicId,
      $or: [
        { 'patientCodes.code': new RegExp(q, 'i') },
        { phone: new RegExp(q, 'i') },
      ],
    };

    const patients = await Patient.find(filter)
      .populate('patientCodes.clinic')
      .populate('patientCodes.doctor')
      .limit(10)
      .sort({ createdAt: -1 });

    // Format response for dropdown
    const formattedPatients = patients.map(patient => {
      const clinicCode = patient.patientCodes.find(
        pc => pc.clinic._id.toString() === clinicId
      );
      return {
        _id: patient._id,
        name: patient.name,
        phone: patient.phone,
        patientCode: clinicCode?.code || 'No code',
        displayText: `${patient.name} - ${clinicCode?.code || 'No code'}`,
      };
    });

    res.json({ patients: formattedPatients });
  } catch (error) {
    logger.error({ error }, 'Error searching patients for appointment');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update appointment vitals
 * PATCH /api/appointments/:appointmentId/vitals
 * Auto-changes status to 'in-progress'
 */
export const updateAppointmentVitals = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { userId } = req.auth;
    const vitalsData = req.body;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Get current user
    const user = await User.findOne({ clerkId: userId });

    // Update vitals
    appointment.vitals = {
      ...vitalsData,
      recordedAt: new Date(),
      recordedBy: user._id,
    };

    // Auto-change status to 'in-progress' when vitals are saved
    if (appointment.status === 'scheduled') {
      appointment.status = 'in-progress';
      logger.info({ appointmentId }, 'Status auto-changed to in-progress after vitals recorded');
    }

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointmentId)
      .populate('clinic')
      .populate('doctor')
      .populate('patient')
      .populate('vitals.recordedBy')
      .populate('clinicalNotes.recordedBy')
      .populate('prescriptions');

    logger.info({ appointmentId }, 'Appointment vitals updated');
    res.json(populatedAppointment);
  } catch (error) {
    logger.error({ error }, 'Error updating appointment vitals');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update appointment clinical notes
 * PATCH /api/appointments/:appointmentId/clinical-notes
 */
export const updateClinicalNotes = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { userId } = req.auth;
    const clinicalData = req.body;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Get current user
    const user = await User.findOne({ clerkId: userId });

    // Update clinical notes
    appointment.clinicalNotes = {
      ...appointment.clinicalNotes,
      ...clinicalData,
      recordedAt: new Date(),
      recordedBy: user._id,
    };

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointmentId)
      .populate('clinic')
      .populate('doctor')
      .populate('patient')
      .populate('vitals.recordedBy')
      .populate('clinicalNotes.recordedBy')
      .populate('prescriptions');

    logger.info({ appointmentId }, 'Clinical notes updated');
    res.json(populatedAppointment);
  } catch (error) {
    logger.error({ error }, 'Error updating clinical notes');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update appointment status manually
 * PATCH /api/appointments/:appointmentId/status
 */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    if (!status || !['scheduled', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        error: 'Valid status required (scheduled, in-progress, completed, cancelled)' 
      });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const oldStatus = appointment.status;
    appointment.status = status;
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointmentId)
      .populate('clinic')
      .populate('doctor')
      .populate('patient')
      .populate('vitals.recordedBy')
      .populate('clinicalNotes.recordedBy')
      .populate('prescriptions');

    logger.info({ appointmentId, oldStatus, newStatus: status }, 'Appointment status updated manually');
    res.json(populatedAppointment);
  } catch (error) {
    logger.error({ error }, 'Error updating appointment status');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Assign doctor to appointment
 * PATCH /api/appointments/:appointmentId/assign-doctor
 */
export const assignDoctorToAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({ error: 'Doctor ID is required' });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Update doctor
    appointment.doctor = doctorId;
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointmentId)
      .populate('clinic')
      .populate('doctor')
      .populate('patient')
      .populate('createdBy')
      .populate('prescriptions');

    logger.info({ appointmentId, doctorId }, 'Doctor assigned to appointment');
    res.json(populatedAppointment);
  } catch (error) {
    logger.error({ error }, 'Error assigning doctor to appointment');
    res.status(500).json({ error: 'Internal server error' });
  }
};
