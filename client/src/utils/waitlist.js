/**
 * Waitlist Utilities
 * Handles waitlist form submission to Google Sheets
 */

import { launchConfig } from '../config/launchConfig';
import { trackWaitlistSignup } from './analytics';

/**
 * Submit waitlist form to Google Sheets
 * @param {Object} formData - { email, name, phone, clinicName }
 * @returns {Promise<Object>} - { success: boolean, message: string }
 */
export const submitToWaitlist = async (formData) => {
  const { email, name, phone = '', clinicName = '' } = formData;
  
  // Validation
  if (!email || !name) {
    return {
      success: false,
      message: 'Email and name are required',
    };
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: 'Please enter a valid email address',
    };
  }
  
  try {
    const apiUrl = launchConfig.waitlist.apiUrl;
    
    // Check if API URL is configured
    if (!apiUrl || apiUrl.includes('YOUR_SCRIPT_ID')) {
      console.warn('Waitlist API not configured');
      // Return success for development/testing
      if (import.meta.env.MODE === 'development') {
        console.log('Development mode: Waitlist submission', formData);
        trackWaitlistSignup(email);
        return {
          success: true,
          message: 'Thanks for joining! (Development mode)',
        };
      }
      return {
        success: false,
        message: 'Waitlist is not yet configured. Please try again later.',
      };
    }
    
    // Prepare payload
    const payload = {
      email,
      name,
      phone,
      clinicName,
      timestamp: new Date().toISOString(),
      source: window.location.href,
    };
    
    // Submit to Google Sheets
    const response = await fetch(apiUrl, {
      method: 'POST',
      mode: 'no-cors', // Google Apps Script requires no-cors
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    // Note: no-cors means we can't read the response
    // Assume success if no error thrown
    
    // Track conversion
    trackWaitlistSignup(email);
    
    return {
      success: true,
      message: 'Successfully joined the waitlist! Check your email for confirmation.',
    };
    
  } catch (error) {
    console.error('Waitlist submission error:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again.',
    };
  }
};

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone format (Indian)
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  // Optional field
  if (!phone) return true;
  
  // Indian phone number: 10 digits
  const phoneRegex = /^[6-9]\d{9}$/;
  const cleanPhone = phone.replace(/\D/g, '');
  return phoneRegex.test(cleanPhone);
};

export default {
  submitToWaitlist,
  isValidEmail,
  isValidPhone,
};
