/**
 * Utility functions for formatting data
 */

import { format, formatDistance, parseISO } from 'date-fns';

/**
 * Format a date to a readable string
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date
 */
export function formatDate(date, formatStr = 'MMM dd, yyyy') {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Format a date to a time string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted time (e.g., "2:30 PM")
 */
export function formatTime(date) {
  return formatDate(date, 'h:mm a');
}

/**
 * Format a date to datetime string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted datetime (e.g., "Jan 15, 2025 at 2:30 PM")
 */
export function formatDateTime(date) {
  return formatDate(date, 'MMM dd, yyyy \'at\' h:mm a');
}

/**
 * Format a date to a relative time string (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
}

/**
 * Format a phone number to a readable format
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  
  // Indian phone number format (10 digits)
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  // With country code (+91)
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
}

/**
 * Format a name to title case
 * @param {string} name - Name to format
 * @returns {string} Title-cased name
 */
export function formatName(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format a patient code for display
 * @param {string} code - Patient code
 * @returns {string} Formatted patient code
 */
export function formatPatientCode(code) {
  if (!code) return '';
  return code.toUpperCase();
}

/**
 * Format file size to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "1.5 MB")
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default: 50)
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Format severity level for display
 * @param {string} severity - Severity level
 * @returns {string} Formatted severity
 */
export function formatSeverity(severity) {
  if (!severity) return '';
  return severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();
}

/**
 * Get color class for DDI severity
 * @param {string} severity - Severity level
 * @returns {string} Tailwind color class
 */
export function getSeverityColor(severity) {
  const colors = {
    minor: 'text-green-700 bg-green-50 border-green-200',
    moderate: 'text-amber-700 bg-amber-50 border-amber-200',
    major: 'text-red-700 bg-red-50 border-red-200',
    contraindicated: 'text-red-800 bg-red-100 border-red-300',
  };
  
  return colors[severity?.toLowerCase()] || 'text-gray-600 bg-gray-50 border-gray-200';
}

/**
 * Get badge color for appointment status
 * @param {string} status - Appointment status
 * @returns {string} Tailwind color class
 */
export function getStatusColor(status) {
  const colors = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-cyan-100 text-cyan-800',
    'in-progress': 'bg-amber-100 text-amber-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    'no-show': 'bg-orange-100 text-orange-800',
  };
  
  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

/**
 * Format currency (INR)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}
