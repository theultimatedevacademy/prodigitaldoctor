/**
 * Alert Component
 * Notification and alert messages
 */

import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

/**
 * Alert component for notifications and messages
 * @param {object} props - Component props
 * @param {string} props.variant - Alert variant (info, success, warning, error)
 * @param {string} props.title - Alert title
 * @param {React.ReactNode} props.children - Alert content
 * @param {boolean} props.dismissible - Show close button
 * @param {Function} props.onClose - Close handler
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Alert component
 */
export function Alert({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onClose,
  className = '',
}) {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600" />,
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-900',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-900',
      icon: <XCircle className="w-5 h-5 text-red-600" />,
    },
  };
  
  const config = variants[variant];
  
  return (
    <div
      className={`border rounded-lg p-4 ${config.container} ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {dismissible && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Close alert"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
