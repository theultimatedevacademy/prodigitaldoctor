import React from 'react';
import { Badge } from './Badge';

/**
 * StatusBadge Component
 * Badge for appointment/prescription status
 */
export function StatusBadge({ status, className = '', ...props }) {
  const statusConfig = {
    scheduled: { variant: 'info', label: 'Scheduled' },
    confirmed: { variant: 'primary', label: 'Confirmed' },
    completed: { variant: 'success', label: 'Completed' },
    cancelled: { variant: 'danger', label: 'Cancelled' },
    pending: { variant: 'warning', label: 'Pending' },
    active: { variant: 'success', label: 'Active' },
    expired: { variant: 'default', label: 'Expired' },
  };

  const config = statusConfig[status] || { variant: 'default', label: status };

  return (
    <Badge variant={config.variant} className={className} {...props}>
      {config.label}
    </Badge>
  );
}
