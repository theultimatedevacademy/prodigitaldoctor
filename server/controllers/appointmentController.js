/**
 * Appointment Controller
 * Handles appointment booking, conflict detection, and calendar views
 */

import Appointment from "../models/appointment.js";
import Patient from "../models/patient.js";
import User from "../models/user.js";
import Clinic from "../models/clinic.js";
import { findOrCreatePatient } from "../services/patientMatchingService.js";
import { getUserClinicRole } from "../utils/rbacHelpers.js";
import logger from "../utils/logger.js";
import mongoose from "mongoose";

/**
 * Create new appointment with conflict detection
 * POST /api/appointments
 */
export const createAppointment = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { clinic, doctor, patient, startAt, endAt, notes } = req.body;

    if (!clinic || !doctor || !patient || !startAt) {
      return res.status(400).json({
        error: "Clinic, doctor, patient, and start time are required",
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
        error: "Clinic, doctor, or patient not found",
      });
    }

    // Time conflict check disabled - allowing overlapping appointments
    const startTime = new Date(startAt);
    const endTime = endAt
      ? new Date(endAt)
      : new Date(startTime.getTime() + 30 * 60000); // Default 30 min

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

    logger.info(`Logging user for patient appointment creation: ${user}`);

    // Create appointment
    const appointment = await Appointment.create({
      clinic,
      doctor,
      patient,
      startAt: startTime,
      endAt: endTime,
      status: "scheduled",
      notes,
      createdBy: user._id,
    });

    logger.info(
      `Logging appointment for patient appointment creation: ${appointment}`
    );

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("clinic")
      .populate("doctor")
      .populate("patient")
      .populate("createdBy")
      .populate("prescriptions");

    logger.info(
      `Logging populated appointment for patient appointment creation: ${populatedAppointment}`
    );

    logger.info(
      {
        appointmentId: appointment._id,
        clinicId: clinic,
        doctorId: doctor,
        patientId: patient,
      },
      "Appointment created"
    );

    res.status(201).json(populatedAppointment);
  } catch (error) {
    logger.error({ error }, "Error creating appointment");
    res.status(500).json({ error: "Internal server error1" });
  }
};

/**
 * Get appointments list with filters
 * GET /api/appointments?clinic=xxx&doctor=xxx&date=2024-01-01&status=scheduled
 * Doctors only see their own appointments
 * Clinic owners and staff see all clinic appointments
 */
export const getAppointments = async (req, res) => {
  try {
    const { userId } = req.auth;
    const {
      clinic,
      doctor,
      patient,
      date,
      startDate,
      endDate,
      status,
      visitType,
      search,
      limit = 50,
      page = 1,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // If search is provided, use aggregation pipeline to search across patient data
    if (search && search.trim().length >= 2) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      // Build match stage for aggregation
      const matchStage = {};

      // Filter out 'null' string values and null/undefined
      if (clinic && clinic !== "null" && clinic !== "undefined") {
        matchStage.clinic = new mongoose.Types.ObjectId(clinic);
      }
      if (doctor && doctor !== "null" && doctor !== "undefined") {
        matchStage.doctor = new mongoose.Types.ObjectId(doctor);
      }
      if (patient && patient !== "null" && patient !== "undefined") {
        matchStage.patient = new mongoose.Types.ObjectId(patient);
      }
      if (status && status !== "null" && status !== "undefined") {
        matchStage.status = status;
      }
      if (visitType && visitType !== "null" && visitType !== "undefined") {
        matchStage.visitType = visitType;
      }

      // Role-based filtering
      if (clinic) {
        const user = await User.findOne({ clerkId: userId });
        const userRole = await getUserClinicRole(user._id, clinic);

        if (userRole === "doctor") {
          matchStage.doctor = user._id;
          logger.info(
            { userId: user._id, role: userRole },
            "Doctor viewing only their appointments"
          );
        }
      }

      // Date filtering
      if (date) {
        const dateStr = date.includes("T") ? date.split("T")[0] : date;
        const [year, month, day] = dateStr.split("-").map(Number);

        const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const endOfDay = new Date(
          Date.UTC(year, month - 1, day, 23, 59, 59, 999)
        );

        matchStage.startAt = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      } else if (startDate && endDate) {
        const startStr = startDate.includes("T")
          ? startDate.split("T")[0]
          : startDate;
        const endStr = endDate.includes("T") ? endDate.split("T")[0] : endDate;

        const [startYear, startMonth, startDay] = startStr
          .split("-")
          .map(Number);
        const [endYear, endMonth, endDay] = endStr.split("-").map(Number);

        const rangeStart = new Date(
          Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0, 0)
        );
        const rangeEnd = new Date(
          Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999)
        );

        matchStage.startAt = {
          $gte: rangeStart,
          $lte: rangeEnd,
        };
      }

      // Aggregation pipeline with search
      const pipeline = [
        { $match: matchStage },
        {
          $lookup: {
            from: "patients",
            localField: "patient",
            foreignField: "_id",
            as: "patientData",
          },
        },
        { $unwind: { path: "$patientData", preserveNullAndEmptyArrays: true } },
        {
          $match: {
            $or: [
              { "patientData.name": searchRegex },
              { "patientData.phone": searchRegex },
              { "patientData.patientCodes.code": searchRegex },
            ],
          },
        },
        { $sort: { startAt: 1 } },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [{ $skip: skip }, { $limit: parseInt(limit) }],
          },
        },
      ];

      const result = await Appointment.aggregate(pipeline);
      const total = result[0]?.metadata[0]?.total || 0;
      const appointmentIds = result[0]?.data.map((a) => a._id) || [];

      // Populate the appointments
      const appointments = await Appointment.find({
        _id: { $in: appointmentIds },
      })
        .populate("clinic")
        .populate("doctor")
        .populate("patient")
        .populate("createdBy")
        .populate("prescriptions")
        .sort({ startAt: 1 });

      logger.info(
        {
          search,
          appointmentsFound: appointments.length,
          total,
          page,
          limit,
        },
        "Appointments fetched with search"
      );

      return res.json({
        appointments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    }

    // Original logic without search
    const filter = {};

    // Filter out 'null' string values and null/undefined
    if (clinic && clinic !== "null" && clinic !== "undefined")
      filter.clinic = clinic;
    if (doctor && doctor !== "null" && doctor !== "undefined")
      filter.doctor = doctor;
    if (patient && patient !== "null" && patient !== "undefined")
      filter.patient = patient;
    if (status && status !== "null" && status !== "undefined")
      filter.status = status;
    if (visitType && visitType !== "null" && visitType !== "undefined")
      filter.visitType = visitType;

    // Role-based filtering
    if (clinic) {
      const user = await User.findOne({ clerkId: userId });
      const userRole = await getUserClinicRole(user._id, clinic);

      // If user is a doctor (not owner, not staff), only show their appointments
      if (userRole === "doctor") {
        filter.doctor = user._id;
        logger.info(
          { userId: user._id, role: userRole },
          "Doctor viewing only their appointments"
        );
      }
      // Clinic owner and staff can see all appointments - no additional filter
    }

    // Date filtering
    if (date) {
      // Single day - parse date string as UTC to avoid timezone issues
      // Date string format: YYYY-MM-DD
      const dateStr = date.includes("T") ? date.split("T")[0] : date;
      const [year, month, day] = dateStr.split("-").map(Number);

      const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      const endOfDay = new Date(
        Date.UTC(year, month - 1, day, 23, 59, 59, 999)
      );

      logger.info(
        {
          receivedDate: date,
          parsedStartOfDay: startOfDay.toISOString(),
          parsedEndOfDay: endOfDay.toISOString(),
        },
        "Filtering appointments by single date"
      );

      filter.startAt = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    } else if (startDate && endDate) {
      // Date range - parse date strings as UTC to avoid timezone issues
      const startStr = startDate.includes("T")
        ? startDate.split("T")[0]
        : startDate;
      const endStr = endDate.includes("T") ? endDate.split("T")[0] : endDate;

      const [startYear, startMonth, startDay] = startStr.split("-").map(Number);
      const [endYear, endMonth, endDay] = endStr.split("-").map(Number);

      const rangeStart = new Date(
        Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0, 0)
      );
      const rangeEnd = new Date(
        Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999)
      );

      logger.info(
        {
          receivedStartDate: startDate,
          receivedEndDate: endDate,
          parsedRangeStart: rangeStart.toISOString(),
          parsedRangeEnd: rangeEnd.toISOString(),
        },
        "Filtering appointments by date range"
      );

      filter.startAt = {
        $gte: rangeStart,
        $lte: rangeEnd,
      };
    }

    logger.info(
      {
        filter,
        patientParam: patient,
        clinicParam: clinic,
        doctorParam: doctor,
        statusParam: status,
        hasPatientFilter: !!filter.patient,
        page,
        limit,
      },
      "Fetching appointments with filter"
    );

    const appointments = await Appointment.find(filter)
      .populate("clinic")
      .populate("doctor")
      .populate("patient")
      .populate("createdBy")
      .populate("prescriptions")
      .sort({ startAt: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Appointment.countDocuments(filter);

    logger.info(
      {
        appointmentsFound: appointments.length,
        total,
        patientFilter: filter.patient,
        sampleAppointments: appointments.slice(0, 2).map((a) => ({
          id: a._id,
          patient: a.patient?._id,
          status: a.status,
          hasClinicalNotes: !!a.clinicalNotes,
          diagnosis: a.clinicalNotes?.diagnosis,
          prescriptionIds: a.prescriptions,
        })),
      },
      "Appointments fetched"
    );

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
    logger.error({ error }, "Error fetching appointments");
    res.status(500).json({ error: "Internal server error" });
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
      .populate("clinic")
      .populate("doctor")
      .populate("patient")
      .populate("createdBy")
      .populate("prescriptions");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    logger.error({ error }, "Error fetching appointment");
    res.status(500).json({ error: "Internal server error" });
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
      .populate("clinic")
      .populate("doctor")
      .populate("patient")
      .populate("createdBy");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    logger.info({ appointmentId }, "Appointment updated");
    res.json(appointment);
  } catch (error) {
    logger.error({ error }, "Error updating appointment");
    res.status(500).json({ error: "Internal server error" });
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
        status: "cancelled",
        notes: reason ? `Cancelled: ${reason}` : "Cancelled",
      },
      { new: true }
    )
      .populate("clinic")
      .populate("doctor")
      .populate("patient");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    logger.info({ appointmentId }, "Appointment cancelled");
    res.json(appointment);
  } catch (error) {
    logger.error({ error }, "Error cancelling appointment");
    res.status(500).json({ error: "Internal server error" });
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
      { status: "completed" },
      { new: true }
    )
      .populate("clinic")
      .populate("doctor")
      .populate("patient");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    logger.info({ appointmentId }, "Appointment marked as completed");
    res.json(appointment);
  } catch (error) {
    logger.error({ error }, "Error completing appointment");
    res.status(500).json({ error: "Internal server error" });
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
        error: "Doctor, start date, and end date are required",
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
      .populate("patient", "name phone")
      .populate("clinic", "name")
      .sort({ startAt: 1 });

    // Group by date
    const calendar = {};
    appointments.forEach((apt) => {
      const date = apt.startAt.toISOString().split("T")[0];
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
        scheduled: appointments.filter((a) => a.status === "scheduled").length,
        completed: appointments.filter((a) => a.status === "completed").length,
        cancelled: appointments.filter((a) => a.status === "cancelled").length,
      },
    });
  } catch (error) {
    logger.error({ error }, "Error fetching calendar view");
    res.status(500).json({ error: "Internal server error" });
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
        error: "Clinic, doctor, name, phone, and start time are required",
      });
    }

    // Verify clinic and doctor exist
    const [clinicDoc, doctorDoc] = await Promise.all([
      Clinic.findById(clinic),
      User.findById(doctor),
    ]);

    if (!clinicDoc || !doctorDoc) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Clinic or doctor not found" });
    }

    // Parse datetime - treat input as local clinic time
    const startTime = new Date(startAt);
    const endTime = endAt
      ? new Date(endAt)
      : new Date(startTime.getTime() + 30 * 60000);

    logger.info(
      {
        receivedStartAt: startAt,
        receivedEndAt: endAt,
        parsedStartTime: startTime.toISOString(),
        parsedEndTime: endTime.toISOString(),
      },
      "Creating first visit appointment with datetime"
    );

    // Time conflict check disabled - allowing overlapping appointments
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

    // Use smart patient matching service to find or create patient
    const patientData = {
      name,
      phone,
      age: req.body.age,
      gender: req.body.gender,
      email: req.body.email,
      addresses: req.body.addresses || [],
      bloodGroup: req.body.bloodGroup,
      allergies: req.body.allergies,
      emergencyContact: req.body.emergencyContact,
      abhaId: req.body.abhaId,
      notes: req.body.notes,
    };

    const patientResult = await findOrCreatePatient(
      patientData,
      clinic,
      doctor,
      clinicDoc.name,
      doctorDoc.name
    );

    const patient = patientResult.patient;
    const patientCode = patientResult.patientCode;
    const patientReused = patientResult.reused;

    // Get current user
    const user = await User.findOne({ clerkId: userId });

    // Create appointment
    const appointment = await Appointment.create(
      [
        {
          clinic,
          doctor,
          patient: patient._id,
          visitType: "first_visit",
          tempPatientData: { name, phone },
          startAt: startTime,
          endAt: endTime,
          status: "scheduled",
          notes,
          createdBy: user._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    const populatedAppointment = await Appointment.findById(appointment[0]._id)
      .populate("clinic")
      .populate("doctor")
      .populate("patient")
      .populate("createdBy")
      .populate("prescriptions");

    logger.info(
      {
        appointmentId: appointment[0]._id,
        patientId: patient._id,
        patientCode,
        clinicId: clinic,
        doctorId: doctor,
        patientReused: patientReused,
      },
      patientReused
        ? "First visit appointment created - patient reused"
        : "First visit appointment created - new patient"
    );

    res.status(201).json({
      appointment: populatedAppointment,
      patientCode,
      reused: patientReused,
      message: patientReused
        ? "Appointment created. Existing patient record reused and updated."
        : "Appointment created successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    logger.error({ error }, "Error creating first visit appointment");

    if (error.code === 11000) {
      return res.status(409).json({
        error: "Patient code already exists. Please try again.",
      });
    }

    res.status(500).json({ error: "Internal server error" });
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
        error: "Clinic, doctor, patient, and start time are required",
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
        error: "Clinic, doctor, or patient not found",
      });
    }

    // Parse datetime - treat input as local clinic time
    const startTime = new Date(startAt);
    const endTime = endAt
      ? new Date(endAt)
      : new Date(startTime.getTime() + 30 * 60000);

    logger.info(
      {
        receivedStartAt: startAt,
        receivedEndAt: endAt,
        parsedStartTime: startTime.toISOString(),
        parsedEndTime: endTime.toISOString(),
      },
      "Creating follow-up appointment with datetime"
    );

    // Time conflict check disabled - allowing overlapping appointments
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
      visitType: "follow_up",
      startAt: startTime,
      endAt: endTime,
      status: "scheduled",
      notes,
      createdBy: user._id,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("clinic")
      .populate("doctor")
      .populate("patient")
      .populate("createdBy")
      .populate("prescriptions");

    logger.info(
      {
        appointmentId: appointment._id,
        clinicId: clinic,
        doctorId: doctor,
        patientId: patient,
      },
      "Follow-up appointment created"
    );

    res.status(201).json(populatedAppointment);
  } catch (error) {
    logger.error({ error }, "Error creating follow-up appointment");
    res.status(500).json({ error: "Internal server error" });
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
        error: "Search query must be at least 2 characters",
      });
    }

    if (!clinicId || clinicId === "null" || clinicId === "undefined") {
      return res.status(400).json({ error: "Clinic ID is required" });
    }

    // Convert clinicId to ObjectId for proper matching
    let clinicObjectId;
    try {
      clinicObjectId = new mongoose.Types.ObjectId(clinicId);
    } catch (err) {
      logger.error(
        { clinicId, error: err.message },
        "Invalid clinic ID format"
      );
      return res.status(400).json({ error: "Invalid clinic ID format" });
    }

    // First, check if there are ANY patients for this clinic
    const totalPatientsInClinic = await Patient.countDocuments({
      "patientCodes.clinic": clinicObjectId,
    });

    logger.info(
      {
        searchQuery: q,
        clinicId: clinicId.toString(),
        totalPatientsInClinic,
      },
      "Starting patient search"
    );

    // Search by patient code or phone number
    // Create regex pattern - escape special characters but keep the search flexible
    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedQuery, "i");

    // Search either by:
    // 1. Patient code within this clinic (using $elemMatch to ensure clinic and code match in same array element)
    // 2. Phone number (if patient has visited this clinic)
    const filter = {
      $and: [
        { "patientCodes.clinic": clinicObjectId }, // Must have visited this clinic
        {
          $or: [
            {
              patientCodes: {
                $elemMatch: {
                  clinic: clinicObjectId,
                  code: regex,
                },
              },
            },
            { phone: regex },
          ],
        },
      ],
    };

    const patients = await Patient.find(filter)
      .populate("patientCodes.clinic")
      .populate("patientCodes.doctor")
      .limit(10)
      .sort({ createdAt: -1 });

    logger.info(
      {
        count: patients.length,
        sampleCodes: patients.slice(0, 3).map((p) => {
          const code = p.patientCodes.find(
            (pc) => pc.clinic._id.toString() === clinicId
          );
          return code?.code;
        }),
      },
      "Found patients"
    );

    // Get last completed visit dates for all patients
    const patientIds = patients.map((p) => p._id);
    const lastCompletedVisits = await Appointment.aggregate([
      {
        $match: {
          patient: { $in: patientIds },
          clinic: new mongoose.Types.ObjectId(clinicId),
          status: "completed",
        },
      },
      {
        $sort: { startAt: -1 },
      },
      {
        $group: {
          _id: "$patient",
          lastCompletedVisit: { $first: "$startAt" },
        },
      },
    ]);

    // Create a map for quick lookup
    const lastVisitMap = {};
    lastCompletedVisits.forEach((lv) => {
      lastVisitMap[lv._id.toString()] = lv.lastCompletedVisit;
    });

    // Format response for dropdown - ONLY include patients with at least one completed visit
    const formattedPatients = patients
      .filter((patient) => {
        // Only include patients who have had at least one completed visit
        return lastVisitMap[patient._id.toString()] !== undefined;
      })
      .map((patient) => {
        const clinicCode = patient.patientCodes.find(
          (pc) => pc.clinic._id.toString() === clinicId
        );
        const lastCompletedVisitDate = lastVisitMap[patient._id.toString()];

        return {
          _id: patient._id,
          name: patient.name,
          phone: patient.phone,
          patientCode: clinicCode?.code || "No code",
          lastCompletedVisit: lastCompletedVisitDate,
          displayText: `${patient.name} - ${clinicCode?.code || "No code"}`,
        };
      });

    logger.info(
      {
        totalFound: patients.length,
        withCompletedVisits: formattedPatients.length,
      },
      "Filtered patients with completed visits"
    );

    res.json({ patients: formattedPatients });
  } catch (error) {
    logger.error({ error }, "Error searching patients for appointment");
    res.status(500).json({ error: "Internal server error" });
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
      return res.status(404).json({ error: "Appointment not found" });
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
    if (appointment.status === "scheduled") {
      appointment.status = "in-progress";
      logger.info(
        { appointmentId },
        "Status auto-changed to in-progress after vitals recorded"
      );
    }

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointmentId)
      .populate("clinic")
      .populate("doctor")
      .populate("patient")
      .populate("vitals.recordedBy")
      .populate("clinicalNotes.recordedBy")
      .populate("prescriptions");

    logger.info({ appointmentId }, "Appointment vitals updated");
    res.json(populatedAppointment);
  } catch (error) {
    logger.error({ error }, "Error updating appointment vitals");
    res.status(500).json({ error: "Internal server error" });
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
      return res.status(404).json({ error: "Appointment not found" });
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
      .populate("clinic")
      .populate("doctor")
      .populate("patient")
      .populate("vitals.recordedBy")
      .populate("clinicalNotes.recordedBy")
      .populate("prescriptions");

    logger.info({ appointmentId }, "Clinical notes updated");
    res.json(populatedAppointment);
  } catch (error) {
    logger.error({ error }, "Error updating clinical notes");
    res.status(500).json({ error: "Internal server error" });
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

    if (
      !status ||
      !["scheduled", "in-progress", "completed", "cancelled"].includes(status)
    ) {
      return res.status(400).json({
        error:
          "Valid status required (scheduled, in-progress, completed, cancelled)",
      });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const oldStatus = appointment.status;
    appointment.status = status;
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointmentId)
      .populate("clinic")
      .populate("doctor")
      .populate("patient")
      .populate("vitals.recordedBy")
      .populate("clinicalNotes.recordedBy")
      .populate("prescriptions");

    logger.info(
      { appointmentId, oldStatus, newStatus: status },
      "Appointment status updated manually"
    );
    res.json(populatedAppointment);
  } catch (error) {
    logger.error({ error }, "Error updating appointment status");
    res.status(500).json({ error: "Internal server error" });
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
      return res.status(400).json({ error: "Doctor ID is required" });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Update doctor
    appointment.doctor = doctorId;
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointmentId)
      .populate("clinic")
      .populate("doctor")
      .populate("patient")
      .populate("createdBy")
      .populate("prescriptions");

    logger.info({ appointmentId, doctorId }, "Doctor assigned to appointment");
    res.json(populatedAppointment);
  } catch (error) {
    logger.error({ error }, "Error assigning doctor to appointment");
    res.status(500).json({ error: "Internal server error" });
  }
};
