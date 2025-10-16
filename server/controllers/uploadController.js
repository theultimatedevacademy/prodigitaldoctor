/**
 * Upload Controller
 * Handles file upload presigned URLs for S3
 */

import { getPresignedPutUrl, getPresignedGetUrl, generateS3Key } from '../utils/s3.js';
import logger from '../utils/logger.js';

/**
 * Generate presigned URL for file upload
 * POST /api/uploads/presign
 * Body: { folder: 'prescriptions', filename: 'prescription.pdf', contentType: 'application/pdf' }
 */
export const generatePresignedPutURL = async (req, res) => {
  try {
    const { folder, filename, contentType } = req.body;

    if (!folder || !filename || !contentType) {
      return res.status(400).json({ 
        error: 'Folder, filename, and content type are required' 
      });
    }

    // Validate folder
    const allowedFolders = [
      'prescriptions',
      'lab-reports',
      'patient-documents',
      'clinic-logos',
      'doctor-signatures',
    ];

    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({ 
        error: `Invalid folder. Allowed: ${allowedFolders.join(', ')}` 
      });
    }

    // Validate content type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
    ];

    if (!allowedTypes.includes(contentType)) {
      return res.status(400).json({ 
        error: `Invalid content type. Allowed: ${allowedTypes.join(', ')}` 
      });
    }

    // Generate S3 key
    const s3Key = generateS3Key(folder, filename);

    // Generate presigned URL (valid for 5 minutes)
    const presignedUrl = await getPresignedPutUrl(s3Key, contentType, 300);

    logger.info({ folder, filename, s3Key }, 'Generated presigned PUT URL');

    res.json({
      presignedUrl,
      s3Key,
      expiresIn: 300, // seconds
    });
  } catch (error) {
    logger.error({ error }, 'Error generating presigned PUT URL');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Generate presigned URL for file download
 * GET /api/uploads/signed-url?key=prescriptions/123456_prescription.pdf
 */
export const generatePresignedGetURL = async (req, res) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ error: 'S3 key is required' });
    }

    // Generate presigned URL (valid for 1 hour)
    const presignedUrl = await getPresignedGetUrl(key, 3600);

    logger.info({ key }, 'Generated presigned GET URL');

    res.json({
      presignedUrl,
      expiresIn: 3600, // seconds
    });
  } catch (error) {
    logger.error({ error }, 'Error generating presigned GET URL');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete file from S3
 * DELETE /api/uploads?key=prescriptions/123456_prescription.pdf
 * TODO: Implement S3 delete operation
 */
export const deleteFile = async (req, res) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ error: 'S3 key is required' });
    }

    // TODO: Implement S3 DeleteObjectCommand
    logger.warn({ key }, 'File deletion not implemented yet');

    res.json({ message: 'File deletion not implemented yet' });
  } catch (error) {
    logger.error({ error }, 'Error deleting file');
    res.status(500).json({ error: 'Internal server error' });
  }
};
