/**
 * Launch Configuration
 * Centralized configuration for pre-launch vs post-launch behavior
 * All environment variables accessed through this file
 */

import { fetchWaitlistCount } from "../utils/waitlistApi";

export const launchConfig = {
  // Core launch settings
  mode: import.meta.env.VITE_LAUNCH_MODE || "prelaunch",
  isLaunched: import.meta.env.VITE_LAUNCH_MODE === "launched",
  isPreLaunch: import.meta.env.VITE_LAUNCH_MODE === "prelaunch",

  // Launch date
  launchDate: import.meta.env.VITE_LAUNCH_DATE || "2025-01-15",

  // Waitlist settings
  waitlist: {
    goal: parseInt(import.meta.env.VITE_WAITLIST_GOAL) || 500,
    current: parseInt(import.meta.env.VITE_WAITLIST_CURRENT) || 0, // Fallback
    apiUrl: import.meta.env.VITE_WAITLIST_API_URL || "",
  },

  // Feature flags
  features: {
    showPricing: import.meta.env.VITE_SHOW_PRICING === "true",
    showFeatureComparison:
      import.meta.env.VITE_SHOW_FEATURE_COMPARISON === "true",
    showTestimonials: import.meta.env.VITE_SHOW_TESTIMONIALS === "true",
  },

  // CTA Configuration
  cta: {
    primaryText:
      import.meta.env.VITE_LAUNCH_MODE === "launched"
        ? import.meta.env.VITE_CTA_TEXT_LAUNCHED || "Start Free Trial"
        : import.meta.env.VITE_CTA_TEXT_PRELAUNCH || "Join Waitlist",
    primaryAction:
      import.meta.env.VITE_LAUNCH_MODE === "launched"
        ? "/sign-up"
        : "#waitlist",
  },

  // Early adopter offer
  earlyAdopter: {
    discount: import.meta.env.VITE_EARLY_DISCOUNT
      ? parseInt(import.meta.env.VITE_EARLY_DISCOUNT, 10)
      : 50,
    label: import.meta.env.VITE_EARLY_DISCOUNT_LABEL || "50% OFF First Year",
  },

  // Analytics
  analytics: {
    gaId: import.meta.env.VITE_GA_MEASUREMENT_ID || "",
    fbPixelId: import.meta.env.VITE_FB_PIXEL_ID || "",
    clarityId: import.meta.env.VITE_MS_CLARITY_ID || "",
  },

  // Contact information
  contact: {
    email: import.meta.env.VITE_SUPPORT_EMAIL || "support@ocura360.com",
    phone: import.meta.env.VITE_SUPPORT_PHONE || "",
    whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || "",
    whatsappLink: function () {
      return this.whatsapp ? `https://wa.me/${this.whatsapp}` : "";
    },
  },
};

// Helper functions
export const getDaysUntilLaunch = () => {
  const launch = new Date(launchConfig.launchDate);
  const now = new Date();
  const diff = launch.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const getTimeUntilLaunch = () => {
  const launch = new Date(launchConfig.launchDate);
  const now = new Date();
  const diff = launch.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

export default launchConfig;

// Function to update waitlist count dynamically
export const updateWaitlistCount = async () => {
  const data = await fetchWaitlistCount();
  launchConfig.waitlist.current = data.count;
  launchConfig.waitlist.goal = data.goal;
  return data;
};
