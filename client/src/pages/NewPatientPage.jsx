/**
 * NewPatientPage Component
 * Form to create a new patient
 */

import { useState } from 'react';
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
import { useClinicContext } from '../contexts/ClinicContext';
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
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(patientSchema),
  });
  
  const [age, setAge] = useState('');
  const watchGender = watch('gender');
  
  const onSubmit = async (data) => {
    try {
      // Transform address fields into structured format
      const addresses = [];
      if (data.addressLine1 || data.city || data.state || data.pin) {
        addresses.push({
          line1: data.addressLine1 || '',
          line2: data.addressLine2 || '',
          city: data.city || '',
          state: data.state || '',
          pin: data.pin || '',
        });
      }
      
      const patientData = {
        name: data.name,
        age: age ? parseInt(age) : null,
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        addresses,
        bloodGroup: data.bloodGroup,
        allergies: data.allergies,
        emergencyContact: data.emergencyContact,
        abhaId: data.abhaId,
        clinic: selectedClinicId,
        doctor: user?._id,
        notes: data.notes,
      };
      
      const result = await createPatientMutation.mutateAsync(patientData);
      toast.success(`Patient created! Code: ${result.patientCodes?.[0]?.code}`);
      navigate(`/patients/${result._id}`);
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patients
        </button>

        <h1 className="text-3xl font-bold text-gray-900">Add New Patient</h1>
        <p className="text-gray-600 mt-2">Create a new patient record</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              
                <Input
                  label="Full Name"
                  placeholder="Enter patient's full name"
                  {...register('name')}
                  error={errors.name?.message}
                  required
                />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age (years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="150"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Enter age"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={watchGender || ''}
                      onChange={(e) => setValue('gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select gender</option>
                      {GENDER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                    )}
                  </div>
                </div>
              </div>
            
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              
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
                
                <div className="space-y-4">
                  <Input
                    label="Address Line 1"
                    placeholder="Street address, Building name"
                    {...register('addressLine1')}
                    error={errors.addressLine1?.message}
                  />
                  
                  <Input
                    label="Address Line 2 (Optional)"
                    placeholder="Apartment, Suite, Floor"
                    {...register('addressLine2')}
                    error={errors.addressLine2?.message}
                  />
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <Input
                      label="City"
                      placeholder="City"
                      {...register('city')}
                      error={errors.city?.message}
                    />
                    
                    <Input
                      label="State"
                      placeholder="State"
                      {...register('state')}
                      error={errors.state?.message}
                    />
                    
                    <Input
                      label="PIN Code"
                      placeholder="6-digit PIN"
                      maxLength={6}
                      {...register('pin')}
                      error={errors.pin?.message}
                    />
                  </div>
                </div>
              </div>
            
              {/* Medical Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Medical Information</h3>
                
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
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/patients')}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createPatientMutation.isPending}
            className="flex-1"
          >
            Create Patient
          </Button>
        </div>
      </form>
    </div>
  );
}
