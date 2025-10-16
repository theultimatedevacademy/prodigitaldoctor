/**
 * Auto-Cancel Appointments Cron Job
 * Automatically cancels appointments that are 6 hours past their start time
 * and haven't been completed
 */

import cron from 'node-cron';
import Appointment from '../models/appointment.js';
import logger from '../utils/logger.js';

/**
 * Auto-cancel appointments that are 6 hours past start time
 * Runs every hour
 */
export const startAutoCancelJob = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Running auto-cancel appointments job');

      // Calculate timestamp 6 hours ago
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

      // Find appointments that should be auto-cancelled
      const appointmentsToCancel = await Appointment.find({
        startAt: { $lt: sixHoursAgo },
        status: { $in: ['scheduled', 'in-progress'] },
      });

      if (appointmentsToCancel.length === 0) {
        logger.info('No appointments to auto-cancel');
        return;
      }

      // Update all to cancelled
      const result = await Appointment.updateMany(
        {
          _id: { $in: appointmentsToCancel.map(a => a._id) },
        },
        {
          status: 'cancelled',
          notes: 'Auto-cancelled: No show (6 hours past appointment time)',
        }
      );

      logger.info(
        { 
          cancelledCount: result.modifiedCount,
          appointmentIds: appointmentsToCancel.map(a => a._id) 
        },
        `Auto-cancelled ${result.modifiedCount} appointments`
      );
    } catch (error) {
      logger.error({ error }, 'Error in auto-cancel appointments job');
    }
  });

  logger.info('Auto-cancel appointments cron job started (runs hourly)');
};
