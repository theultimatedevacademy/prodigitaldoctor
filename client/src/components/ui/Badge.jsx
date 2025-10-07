/**
 * Badge Component
 * Small label for status, tags, or counts
 */

/**
 * Badge component for status indicators
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} props.variant - Badge variant (default, primary, success, warning, danger, info)
 * @param {string} props.size - Badge size (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Badge component
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-blue-100 text-blue-800 border-blue-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };
  
  const baseClasses = 'inline-flex items-center font-medium rounded-full border';
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
