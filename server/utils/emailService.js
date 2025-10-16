/**
 * Email Service (Dummy Implementation)
 * TODO: Implement actual email sending with SendGrid/AWS SES/Nodemailer SMTP
 */

import nodemailer from 'nodemailer';
import logger from './logger.js';

// Dummy transporter for testing (logs emails instead of sending)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER || 'dummy',
    pass: process.env.SMTP_PASS || 'dummy',
  },
});

/**
 * Send staff invitation email
 * TODO: Implement with actual email template and sending logic
 * 
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.clinicName - Clinic name
 * @param {string} options.role - Staff role
 * @param {string} options.inviteToken - Invitation token
 * @returns {Promise<Object>} Email send result
 */
export async function sendStaffInviteEmail({ to, clinicName, role, inviteToken }) {
  try {
    const acceptUrl = `${process.env.CLIENT_URL}/invite/accept?token=${inviteToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@prodigitaldoctor.com',
      to,
      subject: `You're invited to join ${clinicName}`,
      html: `
        <h2>Clinic Staff Invitation</h2>
        <p>You have been invited to join <strong>${clinicName}</strong> as a <strong>${role}</strong>.</p>
        <p>Click the link below to accept the invitation:</p>
        <a href="${acceptUrl}">${acceptUrl}</a>
        <p>This invitation will expire in 7 days.</p>
      `,
      text: `You have been invited to join ${clinicName} as a ${role}. Accept invitation: ${acceptUrl}`,
    };

    // TODO: Replace with actual email sending
    logger.info({ to, clinicName, role }, '[DUMMY] Staff invite email would be sent');
    console.log('='.repeat(60));
    console.log('📧 DUMMY EMAIL (Not actually sent)');
    console.log('='.repeat(60));
    console.log(`To: ${to}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log(`Accept URL: ${acceptUrl}`);
    console.log('='.repeat(60));

    // Uncomment when ready to send actual emails:
    // const info = await transporter.sendMail(mailOptions);
    // return info;

    return { messageId: 'dummy-message-id', accepted: [to] };
  } catch (error) {
    logger.error({ error, to }, 'Error sending staff invite email');
    throw error;
  }
}

/**
 * Send appointment reminder email
 * TODO: Implement with actual email template
 */
export async function sendAppointmentReminder({ to, patientName, doctorName, appointmentTime }) {
  logger.info({ to, patientName, doctorName, appointmentTime }, '[DUMMY] Appointment reminder email');
  console.log(`📧 [DUMMY] Appointment reminder to ${to}`);
  return { messageId: 'dummy-message-id', accepted: [to] };
}

/**
 * Send password reset email
 * TODO: Implement with actual email template
 */
export async function sendPasswordResetEmail({ to, resetToken }) {
  logger.info({ to }, '[DUMMY] Password reset email');
  console.log(`📧 [DUMMY] Password reset email to ${to}`);
  return { messageId: 'dummy-message-id', accepted: [to] };
}

export default {
  sendStaffInviteEmail,
  sendAppointmentReminder,
  sendPasswordResetEmail,
};
