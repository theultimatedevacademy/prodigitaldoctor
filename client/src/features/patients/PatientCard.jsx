/**
 * PatientCard Component
 * Displays patient information in a card format
 */

import { User, Phone, Calendar, Activity } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatPhone } from '../../utils/formatters';

/**
 * PatientCard component for displaying patient summary
 * @param {object} props - Component props
 * @param {object} props.patient - Patient data
 * @param {Function} props.onClick - Click handler
 * @returns {JSX.Element} PatientCard component
 */
export function PatientCard({ patient, onClick }) {
  const age = patient.age;
  
  return (
    <Card onClick={onClick} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{patient.name}</h3>
              <p className="text-sm text-gray-600">
                {patient.patientCodes?.[0]?.code || 'No code'}
              </p>
            </div>
          </div>
          {patient.abhaId && (
            <Badge variant="success" size="sm">ABHA</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{age ? `${age} years` : 'Age unknown'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Activity className="w-4 h-4" />
            <span className="capitalize">{patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}</span>
          </div>
          {patient.phone && (
            <div className="flex items-center gap-2 text-gray-600 col-span-2">
              <Phone className="w-4 h-4" />
              <span>{formatPhone(patient.phone)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

