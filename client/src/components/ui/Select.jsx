/**
 * Select Component
 * Dropdown select with label and error handling
 */

import { forwardRef } from 'react';

/**
 * Select component with label and error display
 * @param {object} props - Component props
 * @param {string} props.label - Select label
 * @param {string} props.error - Error message
 * @param {Array} props.options - Select options [{value, label}]
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Required field
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Select component
 */
export const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder,
  required = false,
  className = '',
  ...props
}, ref) => {
  const selectClasses = `
    block w-full px-3 py-2 border rounded-md shadow-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? 'border-red-500' : 'border-gray-300'}
    ${className}
  `;
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={selectClasses}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.name}-error` : undefined}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${props.name}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
