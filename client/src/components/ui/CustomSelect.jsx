/**
 * CustomSelect Component
 * A styled select dropdown that matches the design system
 * Removes browser default styling and adds custom arrow
 */

import { forwardRef } from 'react';

export const CustomSelect = forwardRef(({
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder,
  className = '',
  ariaLabel,
  ...props
}, ref) => {
  return (
    <div className={`relative w-full sm:w-auto ${className}`}>
      {/* Hidden label for accessibility */}
      {ariaLabel && (
        <label htmlFor={id} className="sr-only">
          {ariaLabel}
        </label>
      )}
      
      {/* Custom styled select */}
      <select
        ref={ref}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
        className="w-full sm:w-auto px-3 sm:px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 cursor-pointer transition-colors sm:min-w-[180px]"
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          msAppearance: 'none',
          backgroundImage: 'none',
          paddingRight: '2.5rem',
        }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown arrow */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
});

CustomSelect.displayName = 'CustomSelect';
