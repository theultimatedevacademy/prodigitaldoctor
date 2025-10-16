/**
 * Upload Routes
 */

import express from 'express';
import { body } from 'express-validator';
import {
  generatePresignedPutURL,
  generatePresignedGetURL,
  deleteFile,
} from '../controllers/uploadController.js';
import { requireAuth } from '../middlewares/clerkAuth.js';
import { validate } from '../middlewares/validator.js';

const router = express.Router();

/**
 * @route   POST /api/uploads/presign
 * @desc    Generate presigned PUT URL
 * @access  Private
 */
router.post(
  '/presign',
  requireAuth,
  [
    body('folder').notEmpty().withMessage('Folder is required'),
    body('filename').notEmpty().withMessage('Filename is required'),
    body('contentType').notEmpty().withMessage('Content type is required'),
  ],
  validate,
  generatePresignedPutURL
);

/**
 * @route   GET /api/uploads/signed-url
 * @desc    Generate presigned GET URL
 * @access  Private
 */
router.get('/signed-url', requireAuth, generatePresignedGetURL);

/**
 * @route   DELETE /api/uploads
 * @desc    Delete file from S3
 * @access  Private
 */
router.delete('/', requireAuth, deleteFile);

export default router;
