/**
 * Spinner Component
 * Loading spinner indicator
 */

/**
 * Spinner component for loading states
 * @param {object} props - Component props
 * @param {string} props.size - Spinner size (sm, md, lg, xl)
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Spinner component
 */
export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };
  
  return (
    <svg
      className={`animate-spin text-blue-600 ${sizes[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
      role="status"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * LoadingOverlay component for full-page loading
 */
export function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90">
      <Spinner size="xl" />
      <p className="mt-4 text-lg text-gray-700">{message}</p>
    </div>
  );
}

/**
 * Skeleton component for loading placeholders
 */
export function Skeleton({ className = '', width, height }) {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;
  
  return (
    <div
      className={`skeleton rounded ${className}`}
      style={style}
      aria-label="Loading content"
    />
  );
}
