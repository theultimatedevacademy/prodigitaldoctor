/**
 * useDebounce hook - Debounces a value
 */

import { useState, useEffect } from 'react';
import { DEBOUNCE_DELAYS } from '../utils/constants';

/**
 * Debounce hook to delay value updates
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = DEBOUNCE_DELAYS.SEARCH) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    // Set timeout to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Cleanup timeout if value changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}
