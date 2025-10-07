/**
 * AppointmentCard Component
 * Displays appointment information in a card format
 */

import { Clock, User, Calendar } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatDate, getStatusColor } from '../../utils/formatters';

/**
 * AppointmentCard component for displaying appointment summary
 * @param {object} props - Component props
 * @param {object} props.appointment - Appointment data
 * @param {Function} props.onClick - Click handler
 * @returns {JSX.Element} AppointmentCard component
 */
export function AppointmentCard({ appointment, onClick }) {
  return (
    <Card onClick={onClick} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h4 className="font-semibold text-clinical-900">
                {appointment.patient?.name || 'Unknown Patient'}
              </h4>
              <p className="text-sm text-clinical-600">
                with {appointment.doctor?.name || 'Dr. Unknown'}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(appointment.status)} size="sm">
            {appointment.status || 'scheduled'}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm text-clinical-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(appointment.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{appointment.time} ({appointment.duration || 30} min)</span>
          </div>
          {appointment.reason && (
            <p className="text-clinical-700 mt-2">
              <span className="font-medium">Reason:</span> {appointment.reason}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
