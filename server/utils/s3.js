/**
 * AWS S3 Utility
 * Handles file uploads and presigned URL generation
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import logger from './logger.js';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || process.env.S3_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Generate presigned PUT URL for file upload
 * @param {string} key - S3 object key
 * @param {string} contentType - File content type
 * @param {number} expiresIn - URL expiration in seconds (default: 5 minutes)
 * @returns {Promise<string>} Presigned URL
 */
export async function getPresignedPutUrl(key, contentType, expiresIn = 300) {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    logger.info({ key, contentType }, 'Generated presigned PUT URL');
    return url;
  } catch (error) {
    logger.error({ error, key }, 'Error generating presigned PUT URL');
    throw error;
  }
}

/**
 * Generate presigned GET URL for file download
 * @param {string} key - S3 object key
 * @param {number} expiresIn - URL expiration in seconds (default: 1 hour)
 * @returns {Promise<string>} Presigned URL
 */
export async function getPresignedGetUrl(key, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    logger.info({ key }, 'Generated presigned GET URL');
    return url;
  } catch (error) {
    logger.error({ error, key }, 'Error generating presigned GET URL');
    throw error;
  }
}

/**
 * Generate S3 key for a file
 * @param {string} folder - Folder name (e.g., 'prescriptions', 'lab-reports')
 * @param {string} filename - File name
 * @returns {string} S3 key
 */
export function generateS3Key(folder, filename) {
  const timestamp = Date.now();
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${folder}/${timestamp}_${sanitized}`;
}

/**
 * Get public URL for S3 object
 * @param {string} key - S3 object key
 * @returns {string} Public URL
 */
export function getS3PublicUrl(key) {
  const bucket = process.env.S3_BUCKET;
  const region = process.env.AWS_REGION || process.env.S3_REGION || 'ap-south-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export default {
  getPresignedPutUrl,
  getPresignedGetUrl,
  generateS3Key,
  getS3PublicUrl,
};
