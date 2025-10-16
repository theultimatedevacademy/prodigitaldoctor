/**
 * SearchInput Component
 * Search input with icon and clear button
 */

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * SearchInput component with debouncing
 * @param {object} props - Component props
 * @param {string} props.value - Search value
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onSearch - Search handler (receives debounced value)
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.debounceDelay - Debounce delay in ms (default: 300)
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} SearchInput component
 */
export function SearchInput({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder = 'Search...',
  debounceDelay = 300,
  className = '',
  ...props
}) {
  const [internalValue, setInternalValue] = useState('');
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const debouncedValue = useDebounce(value, debounceDelay);
  
  // Call onSearch when debounced value changes
  useState(() => {
    if (onSearch && debouncedValue !== undefined) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };
  
  const handleClear = () => {
    if (onChange) {
      onChange('');
    } else {
      setInternalValue('');
    }
    if (onSearch) {
      onSearch('');
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
