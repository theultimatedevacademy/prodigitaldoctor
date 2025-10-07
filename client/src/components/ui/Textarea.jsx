/**
 * Textarea Component
 * Multiline text input with label and error handling
 */

import { forwardRef } from 'react';

/**
 * Textarea component with label and error display
 * @param {object} props - Component props
 * @param {string} props.label - Textarea label
 * @param {string} props.error - Error message
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Required field
 * @param {number} props.rows - Number of rows
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Textarea component
 */
export const Textarea = forwardRef(({
  label,
  error,
  placeholder,
  required = false,
  rows = 4,
  className = '',
  ...props
}, ref) => {
  const textareaClasses = `
    block w-full px-3 py-2 border rounded-md shadow-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    resize-y
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
      <textarea
        ref={ref}
        rows={rows}
        placeholder={placeholder}
        className={textareaClasses}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.name}-error` : undefined}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${props.name}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
