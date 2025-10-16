/**
 * Audit Logger Utility
 * Creates audit log entries for sensitive actions
 */

import AuditLog from '../models/auditLog.js';
import logger from './logger.js';

/**
 * Create audit log entry
 * @param {Object} options - Audit log options
 * @param {string} options.actor - User ID who performed the action
 * @param {string} options.action - Action performed (e.g., 'CREATE_PRESCRIPTION', 'DELETE_PATIENT')
 * @param {string} options.resource - Resource type (e.g., 'prescription', 'patient')
 * @param {string} options.resourceId - Resource ID
 * @param {string} options.ip - IP address
 * @param {Object} options.meta - Additional metadata
 * @returns {Promise<Object>} Created audit log
 */
export async function createAuditLog({ actor, action, resource, resourceId, ip, meta }) {
  try {
    const auditLog = await AuditLog.create({
      actor,
      action,
      resource,
      resourceId,
      ip,
      meta,
    });

    logger.info(
      { actor, action, resource, resourceId },
      'Audit log created'
    );

    return auditLog;
  } catch (error) {
    logger.error({ error, action, resource }, 'Error creating audit log');
    // Don't throw - audit logging should not break the main flow
    return null;
  }
}

/**
 * Log prescription creation
 */
export async function logPrescriptionCreate(userId, prescriptionId, ip, meta = {}) {
  return createAuditLog({
    actor: userId,
    action: 'CREATE_PRESCRIPTION',
    resource: 'prescription',
    resourceId: prescriptionId,
    ip,
    meta,
  });
}

/**
 * Log DDI override (when doctor proceeds despite warnings)
 */
export async function logDDIOverride(userId, prescriptionId, ip, ddiWarnings) {
  return createAuditLog({
    actor: userId,
    action: 'DDI_OVERRIDE',
    resource: 'prescription',
    resourceId: prescriptionId,
    ip,
    meta: { ddiWarnings },
  });
}

/**
 * Log patient data access
 */
export async function logPatientAccess(userId, patientId, ip, action = 'VIEW_PATIENT') {
  return createAuditLog({
    actor: userId,
    action,
    resource: 'patient',
    resourceId: patientId,
    ip,
    meta: {},
  });
}

/**
 * Log clinic staff invite
 */
export async function logStaffInvite(userId, clinicId, ip, invitedUserEmail) {
  return createAuditLog({
    actor: userId,
    action: 'INVITE_STAFF',
    resource: 'clinic',
    resourceId: clinicId,
    ip,
    meta: { invitedUserEmail },
  });
}

/**
 * Log admin action
 */
export async function logAdminAction(userId, action, resourceType, resourceId, ip, meta = {}) {
  return createAuditLog({
    actor: userId,
    action: `ADMIN_${action}`,
    resource: resourceType,
    resourceId,
    ip,
    meta,
  });
}

export default {
  createAuditLog,
  logPrescriptionCreate,
  logDDIOverride,
  logPatientAccess,
  logStaffInvite,
  logAdminAction,
};
