/**
 * EditPatientPage Component
 * Form to edit existing patient information
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Alert } from '../components/ui/Alert';
import { Spinner } from '../components/ui/Spinner';
import { patientSchema } from '../utils/validators';
import { GENDER_OPTIONS } from '../utils/constants';
import { usePatient, useUpdatePatient } from '../api/hooks/usePatients';
import { toast } from 'react-toastify';

export default function EditPatientPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: patient, isLoading } = usePatient(id);
  const updatePatientMutation = useUpdatePatient();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(patientSchema),
  });
  
  const [age, setAge] = useState('');
  const watchGender = watch('gender');
  
  
  // Populate form when patient data loads
  useEffect(() => {
    if (patient) {
      const address = patient.addresses?.[0] || {};
      setAge(patient.age || '');
      
      reset({
        name: patient.name || '',
        gender: patient.gender || '',
        phone: patient.phone || '',
        email: patient.email || '',
        addressLine1: address.line1 || '',
        addressLine2: address.line2 || '',
        city: address.city || '',
        state: address.state || '',
        pin: address.pin || '',
        bloodGroup: patient.bloodGroup || '',
        emergencyContact: patient.emergencyContact || '',
        allergies: patient.allergies || '',
        abhaId: patient.abhaId || patient.abhaNumber || '',
      });
    }
  }, [patient, reset]);
  
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
      
      const updateData = {
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
      };
      
      await updatePatientMutation.mutateAsync({
        patientId: id,
        data: updateData,
      });
      
      toast.success('Patient updated successfully!');
      navigate(`/patients/${id}`);
    } catch (error) {
      toast.error(error.message || 'Failed to update patient');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" />
        <p className="ml-4 text-gray-600">Loading patient...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="warning">
          Patient not found
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/patients/${id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patient
        </button>

        <h1 className="text-3xl font-bold text-gray-900">Edit Patient</h1>
        <p className="text-gray-600 mt-2">Update patient information</p>
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
            onClick={() => navigate(`/patients/${id}`)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={updatePatientMutation.isPending}
            className="flex-1"
          >
            Update Patient
          </Button>
        </div>
      </form>
    </div>
  );
}
