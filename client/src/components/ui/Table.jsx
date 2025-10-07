/**
 * Table Component
 * Responsive table with sorting and pagination support
 */

/**
 * Table component
 */
export function Table({ children, className = '', ...props }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full text-sm text-left ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

/**
 * TableHeader component
 */
export function TableHeader({ children, className = '', ...props }) {
  return (
    <thead className={`text-xs uppercase bg-gray-50 border-b border-gray-200 ${className}`} {...props}>
      {children}
    </thead>
  );
}

/**
 * TableBody component
 */
export function TableBody({ children, className = '', ...props }) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

/**
 * TableRow component
 */
export function TableRow({ children, className = '', onClick, ...props }) {
  const interactiveClass = onClick ? 'cursor-pointer hover:bg-gray-50' : '';
  return (
    <tr
      className={`border-b border-gray-200 ${interactiveClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  );
}

/**
 * TableHead component
 */
export function TableHead({ children, className = '', sortable = false, onSort, sortDirection, ...props }) {
  return (
    <th
      className={`px-6 py-3 font-medium text-gray-700 ${sortable ? 'cursor-pointer select-none' : ''} ${className}`}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && sortDirection && (
          <span className="text-blue-600">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );
}

/**
 * TableCell component
 */
export function TableCell({ children, className = '', ...props }) {
  return (
    <td className={`px-6 py-4 text-gray-900 ${className}`} {...props}>
      {children}
    </td>
  );
}
