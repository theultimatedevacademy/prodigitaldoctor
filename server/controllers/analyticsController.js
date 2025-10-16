/**
 * Analytics Controller
 * Provides analytics and statistics for clinics and doctors
 */

import Patient from '../models/patient.js';
import Appointment from '../models/appointment.js';
import Prescription from '../models/prescription.js';
import logger from '../utils/logger.js';

/**
 * Get clinic analytics summary
 * GET /api/analytics/clinic/:clinicId/summary
 */
export const getClinicSummary = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Patient counts
    const totalPatients = await Patient.countDocuments({
      'patientCodes.clinic': clinicId,
    });

    const newPatients = await Patient.countDocuments({
      'patientCodes.clinic': clinicId,
      ...dateFilter,
    });

    // Appointment stats
    const appointmentStats = await Appointment.aggregate([
      { 
        $match: { 
          clinic: clinicId,
          ...(startDate && endDate ? {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            }
          } : {})
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const appointments = {
      total: appointmentStats.reduce((sum, s) => sum + s.count, 0),
      scheduled: appointmentStats.find(s => s._id === 'scheduled')?.count || 0,
      completed: appointmentStats.find(s => s._id === 'completed')?.count || 0,
      cancelled: appointmentStats.find(s => s._id === 'cancelled')?.count || 0,
      noShow: appointmentStats.find(s => s._id === 'no-show')?.count || 0,
    };

    // Prescription count
    const totalPrescriptions = await Prescription.countDocuments({
      clinic: clinicId,
      ...(startDate && endDate ? dateFilter : {}),
    });

    // Doctor-wise breakdown
    const doctorStats = await Prescription.aggregate([
      { 
        $match: { 
          clinic: clinicId,
          ...(startDate && endDate ? dateFilter : {}),
        }
      },
      {
        $group: {
          _id: '$doctor',
          prescriptionCount: { $sum: 1 },
        },
      },
      { $sort: { prescriptionCount: -1 } },
    ]);

    // Populate doctor details
    const User = (await import('../models/user.js')).default;
    const doctors = await User.find({
      _id: { $in: doctorStats.map(d => d._id) }
    });

    const doctorPerformance = doctorStats.map(ds => {
      const doctor = doctors.find(d => d._id.toString() === ds._id.toString());
      return {
        doctor: {
          _id: doctor._id,
          name: doctor.name,
          specializations: doctor.specializations,
        },
        prescriptionCount: ds.prescriptionCount,
      };
    });

    res.json({
      patients: {
        total: totalPatients,
        new: newPatients,
      },
      appointments,
      prescriptions: {
        total: totalPrescriptions,
      },
      doctorPerformance,
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching clinic analytics');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get doctor analytics summary
 * GET /api/analytics/doctor/:doctorId/summary
 */
export const getDoctorSummary = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { clinicId, startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const prescriptionFilter = {
      doctor: doctorId,
      ...(clinicId ? { clinic: clinicId } : {}),
      ...(startDate && endDate ? dateFilter : {}),
    };

    // Total patients treated
    const uniquePatients = await Prescription.distinct('patient', prescriptionFilter);
    const totalPatients = uniquePatients.length;

    // Prescription count
    const totalPrescriptions = await Prescription.countDocuments(prescriptionFilter);

    // Appointment stats
    const appointmentFilter = {
      doctor: doctorId,
      ...(clinicId ? { clinic: clinicId } : {}),
      ...(startDate && endDate ? dateFilter : {}),
    };

    const appointmentStats = await Appointment.aggregate([
      { $match: appointmentFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const appointments = {
      total: appointmentStats.reduce((sum, s) => sum + s.count, 0),
      completed: appointmentStats.find(s => s._id === 'completed')?.count || 0,
    };

    // Top prescribed medications
    const topMeds = await Prescription.aggregate([
      { $match: prescriptionFilter },
      { $unwind: '$meds' },
      {
        $group: {
          _id: '$meds.medication',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const Medication = (await import('../models/medication.js')).default;
    const medications = await Medication.find({
      _id: { $in: topMeds.map(m => m._id) }
    });

    const topMedications = topMeds.map(tm => {
      const med = medications.find(m => m._id.toString() === tm._id.toString());
      return {
        medication: med ? med.brandName || med.genericName : 'Unknown',
        count: tm.count,
      };
    });

    // Common diagnoses
    const topDiagnoses = await Prescription.aggregate([
      { $match: prescriptionFilter },
      { $unwind: '$diagnosis' },
      {
        $group: {
          _id: '$diagnosis.text',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      patients: {
        total: totalPatients,
      },
      prescriptions: {
        total: totalPrescriptions,
      },
      appointments,
      topMedications,
      topDiagnoses: topDiagnoses.map(d => ({
        diagnosis: d._id,
        count: d.count,
      })),
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching doctor analytics');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get daily/weekly patient count trends
 * GET /api/analytics/clinic/:clinicId/patient-trends?period=daily&days=30
 */
export const getPatientTrends = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { period = 'daily', days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const groupBy = period === 'daily' 
      ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
      : { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };

    const trends = await Patient.aggregate([
      {
        $match: {
          'patientCodes.clinic': clinicId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      period,
      days: parseInt(days),
      trends,
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching patient trends');
    res.status(500).json({ error: 'Internal server error' });
  }
};
