/**
 * NewPrescriptionPage Component
 * Create a new prescription with DDI checking
 */

import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { PrescriptionBuilder } from '../features/prescriptions/PrescriptionBuilder';
import { useClinicContext } from '../hooks/useClinicContext';
import { useAuth } from '../hooks/useAuth';

export default function NewPrescriptionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedClinicId } = useClinicContext();
  const { user } = useAuth();
  
  const patientId = searchParams.get('patientId');
  const appointmentId = searchParams.get('appointmentId');
  const editId = searchParams.get('editId'); // If editing existing prescription
  
  const isEditMode = !!editId;
  
  const handleSuccess = (prescription) => {
    // Don't navigate - stay on page to show success state
    // navigate(`/prescriptions/${prescription._id}`);
  };
  
  if (!selectedClinicId) {
    return (
      <Alert variant="warning">
        Please select a clinic before creating a prescription
      </Alert>
    );
  }
  
  if (!patientId) {
    return (
      <Alert variant="warning">
        Please select a patient first
      </Alert>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="no-print mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Prescription' : 'Create Prescription'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditMode 
            ? 'Update medications and prescription details'
            : 'Add medications, check interactions, and generate prescription'
          }
        </p>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="no-print">
          <CardTitle>Prescription Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PrescriptionBuilder
            patientId={patientId}
            clinicId={selectedClinicId}
            doctorId={user?._id}
            appointmentId={appointmentId}
            prescriptionId={editId}
            isEditMode={isEditMode}
            onSuccess={handleSuccess}
          />
        </CardContent>
      </Card>
    </div>
  );
}
