/**
 * Card Component
 * Container component with border and shadow
 */

/**
 * Card component for content grouping
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler (makes card interactive)
 * @returns {JSX.Element} Card component
 */
export function Card({ children, className = '', onClick, ...props }) {
  const baseClasses = 'bg-white rounded-lg border border-gray-200 shadow-sm';
  const interactiveClasses = onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : '';
  const classes = `${baseClasses} ${interactiveClasses} ${className}`;
  
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component className={classes} onClick={onClick} {...props}>
      {children}
    </Component>
  );
}

/**
 * CardHeader component for card title and description
 */
export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

/**
 * CardTitle component
 */
export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </h3>
  );
}

/**
 * CardDescription component
 */
export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-sm text-gray-600 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

/**
 * CardContent component for main card content
 */
export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

/**
 * CardFooter component for card actions
 */
export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pt-4 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
}
