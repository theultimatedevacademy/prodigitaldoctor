/**
 * Fetch waitlist count from Google Sheets
 */
export const fetchWaitlistCount = async () => {
  try {
    const apiUrl = import.meta.env.VITE_WAITLIST_API_URL;

    if (!apiUrl || apiUrl.includes("YOUR_SCRIPT_ID")) {
      console.warn("Waitlist API not configured");
      return { count: 0, goal: 500 };
    }

    // Add timeout to fail faster if script is slow
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(apiUrl, {
      method: "GET",
      cache: "no-cache",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (data.success) {
      return {
        count: data.count || 0,
        goal: data.goal || 500,
      };
    }

    return { count: 0, goal: 500 };
  } catch (error) {
    console.error("Failed to fetch waitlist count:", error);
    return { count: 0, goal: 500 };
  }
};
