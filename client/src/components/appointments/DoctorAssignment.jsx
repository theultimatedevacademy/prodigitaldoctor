/**
 * DoctorAssignment Component
 * Component for assigning/changing doctor for an appointment
 */

import { useState } from 'react';
import { Button } from '../ui/Button';
import { UserCheck } from 'lucide-react';

const DoctorAssignment = ({ appointmentId, currentDoctor, doctors, onAssign, onCancel }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(currentDoctor?._id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    setIsSubmitting(true);
    try {
      await onAssign(selectedDoctor);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <UserCheck className="w-4 h-4 inline mr-2" />
          Assign Doctor *
        </label>
        <select
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select a doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor._id} value={doctor._id}>
              {doctor.name} {doctor.isOwner ? '(Owner)' : ''}
            </option>
          ))}
        </select>
      </div>

      {currentDoctor && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <strong>Current Doctor:</strong> {currentDoctor.name}
        </div>
      )}

      <div className="flex gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} disabled={!selectedDoctor} className="flex-1">
          {currentDoctor ? 'Change Doctor' : 'Assign Doctor'}
        </Button>
      </div>
    </form>
  );
};

export default DoctorAssignment;
