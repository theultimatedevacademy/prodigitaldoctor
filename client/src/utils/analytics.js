/**
 * Analytics Utilities
 * Centralized tracking for Google Analytics, Facebook Pixel, and Microsoft Clarity
 */

import { launchConfig } from '../config/launchConfig';

// ============================================
// GOOGLE ANALYTICS 4
// ============================================

export const initGA4 = () => {
  const { gaId } = launchConfig.analytics;
  
  if (!gaId || gaId === 'G-XXXXXXXXXX') {
    console.log('GA4 not configured');
    return;
  }
  
  // Load GA4 script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script1);
  
  // Initialize GA4
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  
  gtag('js', new Date());
  gtag('config', gaId);
  
  console.log('GA4 initialized:', gaId);
};

export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams);
  }
};

export const trackPageView = (pagePath) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
    });
  }
};

// ============================================
// FACEBOOK PIXEL
// ============================================

export const initFacebookPixel = () => {
  const { fbPixelId } = launchConfig.analytics;
  
  if (!fbPixelId) {
    console.log('Facebook Pixel not configured');
    return;
  }
  
  // Load Facebook Pixel
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod
        ? n.callMethod.apply(n, arguments)
        : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    'script',
    'https://connect.facebook.net/en_US/fbevents.js'
  );
  
  window.fbq('init', fbPixelId);
  window.fbq('track', 'PageView');
  
  console.log('Facebook Pixel initialized:', fbPixelId);
};

export const trackFBEvent = (eventName, eventParams = {}) => {
  if (typeof window.fbq === 'function') {
    window.fbq('track', eventName, eventParams);
  }
};

// ============================================
// MICROSOFT CLARITY
// ============================================

export const initClarity = () => {
  const { clarityId } = launchConfig.analytics;
  
  if (!clarityId) {
    console.log('Microsoft Clarity not configured');
    return;
  }
  
  // Load Microsoft Clarity
  (function (c, l, a, r, i, t, y) {
    c[a] =
      c[a] ||
      function () {
        (c[a].q = c[a].q || []).push(arguments);
      };
    t = l.createElement(r);
    t.async = 1;
    t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', clarityId);
  
  console.log('Microsoft Clarity initialized:', clarityId);
};

// ============================================
// COMMON TRACKING EVENTS
// ============================================

export const trackWaitlistSignup = (email) => {
  // GA4
  trackEvent('waitlist_signup', {
    method: 'email',
    value: email,
  });
  
  // Facebook Pixel
  trackFBEvent('Lead', {
    content_name: 'Waitlist Signup',
    status: 'completed',
  });
  
  console.log('Tracked: Waitlist Signup');
};

export const trackTrialStart = (plan) => {
  // GA4
  trackEvent('trial_start', {
    plan_name: plan,
    currency: 'INR',
  });
  
  // Facebook Pixel
  trackFBEvent('StartTrial', {
    content_name: plan,
    value: 0,
    currency: 'INR',
  });
  
  console.log('Tracked: Trial Start:', plan);
};

export const trackCTAClick = (ctaName, location) => {
  // GA4
  trackEvent('cta_click', {
    cta_name: ctaName,
    cta_location: location,
  });
  
  console.log('Tracked: CTA Click:', ctaName, 'at', location);
};

export const trackVideoPlay = (videoName) => {
  // GA4
  trackEvent('video_play', {
    video_name: videoName,
  });
  
  // Facebook Pixel
  trackFBEvent('ViewContent', {
    content_type: 'video',
    content_name: videoName,
  });
  
  console.log('Tracked: Video Play:', videoName);
};

export const trackPricingView = (plan) => {
  // GA4
  trackEvent('view_pricing', {
    plan_name: plan,
  });
  
  // Facebook Pixel
  trackFBEvent('ViewContent', {
    content_type: 'pricing',
    content_name: plan,
  });
  
  console.log('Tracked: Pricing View:', plan);
};

// ============================================
// INITIALIZE ALL ANALYTICS
// ============================================

export const initializeAnalytics = () => {
  // Only initialize in production or when explicitly enabled
  if (import.meta.env.MODE === 'production' || import.meta.env.VITE_ANALYTICS_ENABLED === 'true') {
    initGA4();
    initFacebookPixel();
    initClarity();
  } else {
    console.log('Analytics disabled in development mode');
  }
};

export default {
  initializeAnalytics,
  trackEvent,
  trackPageView,
  trackWaitlistSignup,
  trackTrialStart,
  trackCTAClick,
  trackVideoPlay,
  trackPricingView,
};
