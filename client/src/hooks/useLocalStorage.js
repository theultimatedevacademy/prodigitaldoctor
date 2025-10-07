/**
 * useLocalStorage hook - Sync state with localStorage
 */

import { useState } from 'react';

/**
 * Hook to sync state with localStorage
 * @param {string} key - localStorage key
 * @param {any} initialValue - Initial value
 * @returns {Array} [value, setValue]
 */
export function useLocalStorage(key, initialValue) {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  // Update localStorage when value changes
  const setValue = (value) => {
    try {
      // Allow value to be a function for lazy initialization
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };
  
  return [storedValue, setValue];
}
