import { z } from "zod";

/**
 * Email validation schema
 */
export const emailSchema = z.string().email("Invalid email address");

/**
 * Phone validation schema (Indian format)
 */
export const phoneSchema = z
  .string()
  .regex(/^(\+91)?[6-9]\d{9}$/, "Invalid phone number");

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate phone
 */
export const isValidPhone = (phone) => {
  try {
    phoneSchema.parse(phone);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate password
 */
export const isValidPassword = (password) => {
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
};
