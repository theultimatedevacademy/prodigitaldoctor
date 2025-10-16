/**
 * Validation Middleware using express-validator
 */

import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

/**
 * Validate request and return errors if any
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));
    
    logger.error({
      method: req.method,
      path: req.path,
      validationErrors: errorDetails,
      requestBody: req.body,
    }, 'Validation failed');
    
    return res.status(400).json({
      error: 'Validation failed',
      details: errorDetails,
    });
  }
  
  next();
};

export default validate;
