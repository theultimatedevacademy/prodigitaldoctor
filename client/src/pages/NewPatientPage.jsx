/**
 * NewPatientPage Component
 * Form to create a new patient
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Alert } from '../components/ui/Alert';
import { patientSchema } from '../utils/validators';
import { GENDER_OPTIONS } from '../utils/constants';
import { useCreatePatient } from '../api/hooks/usePatients';
import { useClinicContext } from '../hooks/useClinicContext';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

export default function NewPatientPage() {
  const navigate = useNavigate();
  const { selectedClinicId } = useClinicContext();
  const { user } = useAuth();
  const createPatientMutation = useCreatePatient();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(patientSchema),
  });
  
  const onSubmit = async (data) => {
    try {
      const patientData = {
        ...data,
        clinicId: selectedClinicId,
        doctorId: user?._id,
      };
      
      const result = await createPatientMutation.mutateAsync(patientData);
      toast.success(`Patient created! Code: ${result.patient.patientCodes?.[0]?.code}`);
      navigate(`/patients/${result.patient._id}`);
    } catch (error) {
      toast.error(error.message || 'Failed to create patient');
    }
  };
  
  if (!selectedClinicId) {
    return (
      <Alert variant="warning">
        Please select a clinic before creating a patient
      </Alert>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/patients')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Patients
        </Button>
        <h1 className="text-3xl font-bold text-clinical-900">Add New Patient</h1>
        <p className="text-clinical-600 mt-1">
          Create a new patient record
        </p>
      </div>
      
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-clinical-900">Personal Information</h3>
              
              <Input
                label="Full Name"
                placeholder="Enter patient's full name"
                {...register('name')}
                error={errors.name?.message}
                required
              />
              
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Date of Birth"
                  type="date"
                  {...register('dob')}
                  error={errors.dob?.message}
                  required
                />
                
                <Select
                  label="Gender"
                  options={GENDER_OPTIONS}
                  placeholder="Select gender"
                  {...register('gender')}
                  error={errors.gender?.message}
                  required
                />
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-clinical-900">Contact Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="10-digit mobile number"
                  {...register('phone')}
                  error={errors.phone?.message}
                  required
                />
                
                <Input
                  label="Email"
                  type="email"
                  placeholder="patient@example.com"
                  {...register('email')}
                  error={errors.email?.message}
                />
              </div>
              
              <Textarea
                label="Address"
                placeholder="Complete address"
                rows={3}
                {...register('address')}
                error={errors.address?.message}
              />
            </div>
            
            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-clinical-900">Medical Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Blood Group"
                  placeholder="e.g., A+, B-, O+"
                  {...register('bloodGroup')}
                  error={errors.bloodGroup?.message}
                />
                
                <Input
                  label="Emergency Contact"
                  type="tel"
                  placeholder="Emergency contact number"
                  {...register('emergencyContact')}
                  error={errors.emergencyContact?.message}
                />
              </div>
              
              <Textarea
                label="Known Allergies"
                placeholder="List any known allergies (medications, food, etc.)"
                rows={3}
                {...register('allergies')}
                error={errors.allergies?.message}
              />
              
              <Input
                label="ABHA ID (Optional)"
                placeholder="14-digit ABHA ID"
                {...register('abhaId')}
                error={errors.abhaId?.message}
              />
            </div>
            
            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-clinical-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/patients')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createPatientMutation.isPending}
              >
                Create Patient
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
