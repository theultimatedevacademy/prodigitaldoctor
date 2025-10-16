/**
 * Admin Routes
 */

import express from 'express';
import { body } from 'express-validator';
import {
  getAllUsers,
  updateUserStatus,
  getSystemStats,
  getAuditLogs,
  detectFraud,
  deleteUser,
} from '../controllers/adminController.js';
import {
  createMedication,
  createComposition,
  createDDI,
  getAllDDI,
  updateDDI,
  deleteDDI,
} from '../controllers/medicationController.js';
import { requireAuth, requireRole } from '../middlewares/clerkAuth.js';
import { validate } from '../middlewares/validator.js';

const router = express.Router();

// All admin routes require admin role
router.use(requireAuth, requireRole(['admin']));

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (admin)
 */
router.get('/users', getAllUsers);

/**
 * @route   PATCH /api/admin/users/:userId/status
 * @desc    Enable/disable user
 * @access  Private (admin)
 */
router.patch(
  '/users/:userId/status',
  [
    body('enabled').isBoolean().withMessage('enabled must be boolean'),
  ],
  validate,
  updateUserStatus
);

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Delete user
 * @access  Private (admin)
 */
router.delete('/users/:userId', deleteUser);

/**
 * @route   GET /api/admin/stats
 * @desc    Get system statistics
 * @access  Private (admin)
 */
router.get('/stats', getSystemStats);

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get audit logs
 * @access  Private (admin)
 */
router.get('/audit-logs', getAuditLogs);

/**
 * @route   GET /api/admin/fraud-detection
 * @desc    Detect fraudulent activities
 * @access  Private (admin)
 */
router.get('/fraud-detection', detectFraud);

// Medication management

/**
 * @route   POST /api/admin/medications
 * @desc    Create medication
 * @access  Private (admin)
 */
router.post(
  '/medications',
  [
    body('brandName').optional().notEmpty(),
    body('genericName').optional().notEmpty(),
  ],
  validate,
  createMedication
);

/**
 * @route   POST /api/admin/compositions
 * @desc    Create composition
 * @access  Private (admin)
 */
router.post(
  '/compositions',
  [
    body('name').notEmpty().withMessage('Composition name is required'),
  ],
  validate,
  createComposition
);

/**
 * @route   POST /api/admin/ddi
 * @desc    Create DDI rule
 * @access  Private (admin)
 */
router.post(
  '/ddi',
  [
    body('compA').notEmpty().withMessage('Composition A is required'),
    body('compB').notEmpty().withMessage('Composition B is required'),
    body('severity').isIn(['minor', 'moderate', 'major', 'contraindicated'])
      .withMessage('Invalid severity'),
  ],
  validate,
  createDDI
);

/**
 * @route   GET /api/admin/ddi
 * @desc    Get all DDI rules
 * @access  Private (admin)
 */
router.get('/ddi', getAllDDI);

/**
 * @route   PATCH /api/admin/ddi/:ddiId
 * @desc    Update DDI rule
 * @access  Private (admin)
 */
router.patch('/ddi/:ddiId', updateDDI);

/**
 * @route   DELETE /api/admin/ddi/:ddiId
 * @desc    Delete DDI rule
 * @access  Private (admin)
 */
router.delete('/ddi/:ddiId', deleteDDI);

export default router;
