import { format, parseISO } from "date-fns";

/**
 * Format date to readable string
 */
export const formatDate = (date, formatStr = "MMM dd, yyyy") => {
  if (!date) return "";
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

/**
 * Format time to readable string
 */
export const formatTime = (date, formatStr = "hh:mm a") => {
  if (!date) return "";
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

/**
 * Format phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return "";
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");
  // Format as +91-XXXXX-XXXXX
  if (cleaned.length === 10) {
    return `+91-${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return phone;
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Truncate text
 */
export const truncate = (text, length = 50) => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + "...";
};
