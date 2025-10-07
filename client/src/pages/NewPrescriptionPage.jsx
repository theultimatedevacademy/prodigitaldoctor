/**
 * NewPrescriptionPage Component
 * Create a new prescription with DDI checking
 */

import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
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
  
  const handleSuccess = (prescription) => {
    navigate(`/prescriptions/${prescription._id}`);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-clinical-900">Create Prescription</h1>
        <p className="text-clinical-600 mt-1">
          Add medications, check interactions, and generate prescription
        </p>
      </div>
      
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Prescription Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PrescriptionBuilder
            patientId={patientId}
            clinicId={selectedClinicId}
            doctorId={user?._id}
            appointmentId={appointmentId}
            onSuccess={handleSuccess}
          />
        </CardContent>
      </Card>
    </div>
  );
}
