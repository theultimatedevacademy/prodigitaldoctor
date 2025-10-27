import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { usePatient, useUpdatePatient } from '../../api/hooks/usePatients';
import { ActivityIndicator, Text } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { EmptyState } from '../../components/ui/EmptyState';

export default function EditPatientScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const { data: patient, isLoading, error } = usePatient(id);
  const updatePatient = useUpdatePatient();

  // Debug logging
  useEffect(() => {
    if (__DEV__) {
      console.log('🔍 EditPatientScreen - Patient data:', {
        patientId: id,
        hasPatient: !!patient,
        patientData: patient ? {
          _id: patient._id,
          name: patient.name,
          phone: patient.phone,
          age: patient.age,
          gender: patient.gender,
        } : null,
        isLoading,
        error: error?.message,
      });
    }
  }, [patient, isLoading, error, id]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: '',
    bloodGroup: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pin: '',
    emergencyContact: '',
    allergies: '',
    abhaId: '',
  });
  const [errors, setErrors] = useState({});

  // Populate form when patient data loads
  useEffect(() => {
    if (patient && patient._id) {
      const address = patient.addresses?.[0] || {};
      
      if (__DEV__) {
        console.log('📝 Pre-populating form with patient data:', {
          name: patient.name,
          phone: patient.phone,
          age: patient.age,
          gender: patient.gender,
          bloodGroup: patient.bloodGroup,
        });
      }
      
      setFormData({
        name: patient.name || '',
        phone: patient.phone || '',
        email: patient.email || '',
        age: patient.age?.toString() || '',
        gender: patient.gender || '',
        bloodGroup: patient.bloodGroup || '',
        addressLine1: address.line1 || '',
        addressLine2: address.line2 || '',
        city: address.city || '',
        state: address.state || '',
        pin: address.pin || '',
        emergencyContact: patient.emergencyContact || '',
        allergies: patient.allergies || '',
        abhaId: patient.abhaId || patient.abhaNumber || '',
      });
    }
  }, [patient]);

  const validateForm = () => {
    const newErrors = {};

    // Required fields (matching web version)
    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (formData.phone.replace(/\D/g, '').length !== 10) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    // Optional validations
    if (formData.pin && formData.pin.length !== 6) {
      newErrors.pin = 'PIN code must be 6 digits';
    }

    if (formData.emergencyContact && formData.emergencyContact.replace(/\D/g, '').length !== 10) {
      newErrors.emergencyContact = 'Emergency contact must be 10 digits';
    }

    if (formData.abhaId && formData.abhaId.replace(/\D/g, '').length !== 14) {
      newErrors.abhaId = 'ABHA ID must be 14 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    try {
      // Transform address fields into structured format
      const addresses = [];
      if (formData.addressLine1 || formData.city || formData.state || formData.pin) {
        addresses.push({
          line1: formData.addressLine1 || '',
          line2: formData.addressLine2 || '',
          city: formData.city || '',
          state: formData.state || '',
          pin: formData.pin || '',
        });
      }

      const updateData = {
        patientId: id,
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender,
        phone: formData.phone.trim(),
        email: formData.email?.trim() || undefined,
        addresses,
        bloodGroup: formData.bloodGroup || undefined,
        allergies: formData.allergies?.trim() || undefined,
        emergencyContact: formData.emergencyContact?.trim() || undefined,
        abhaId: formData.abhaId?.trim() || undefined,
      };

      await updatePatient.mutateAsync(updateData);

      Alert.alert('Success', 'Patient updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error?.data?.error || error?.message || 'Failed to update patient',
        [{ text: 'OK' }]
      );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <ScreenWrapper>
        <Header title="Edit Patient" showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Loading patient...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Error state
  if (error || !patient) {
    return (
      <ScreenWrapper>
        <Header title="Edit Patient" showBack />
        <EmptyState
          icon={AlertCircle}
          title="Patient not found"
          description={error?.message || "The patient you're looking for doesn't exist"}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper withKeyboardAvoid>
      <Header title="Edit Patient" showBack />

      <ScrollView className="flex-1 p-4" key={patient?._id}>
        {/* Basic Information */}
        <Text className="mb-4 text-lg font-semibold text-gray-900">Basic Information</Text>

        <Input
          label="Full Name *"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Enter patient name"
          error={errors.name}
          autoCapitalize="words"
        />

        <Input
          label="Phone Number *"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          placeholder="Enter 10-digit phone number"
          keyboardType="phone-pad"
          error={errors.phone}
          maxLength={10}
        />

        <Input
          label="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Input
          label="Age"
          value={formData.age}
          onChangeText={(text) => setFormData({ ...formData, age: text })}
          placeholder="Enter age"
          keyboardType="numeric"
          error={errors.age}
        />

        <Select
          label="Gender *"
          value={formData.gender}
          onValueChange={(value) => setFormData({ ...formData, gender: value })}
          options={[
            { label: 'Male', value: 'M' },
            { label: 'Female', value: 'F' },
            { label: 'Other', value: 'O' },
          ]}
          placeholder="Select gender"
          error={errors.gender}
        />

        <Select
          label="Blood Group"
          value={formData.bloodGroup}
          onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
          options={[
            { label: 'Not specified', value: '' },
            { label: 'A+', value: 'A+' },
            { label: 'A-', value: 'A-' },
            { label: 'B+', value: 'B+' },
            { label: 'B-', value: 'B-' },
            { label: 'O+', value: 'O+' },
            { label: 'O-', value: 'O-' },
            { label: 'AB+', value: 'AB+' },
            { label: 'AB-', value: 'AB-' },
          ]}
          placeholder="Select blood group"
        />

        {/* Address Information */}
        <Text className="mb-4 mt-6 text-lg font-semibold text-gray-900">Address</Text>

        <Input
          label="Address Line 1"
          value={formData.addressLine1}
          onChangeText={(text) => setFormData({ ...formData, addressLine1: text })}
          placeholder="Enter address line 1"
        />

        <Input
          label="Address Line 2"
          value={formData.addressLine2}
          onChangeText={(text) => setFormData({ ...formData, addressLine2: text })}
          placeholder="Enter address line 2"
        />

        <Input
          label="City"
          value={formData.city}
          onChangeText={(text) => setFormData({ ...formData, city: text })}
          placeholder="Enter city"
        />

        <Input
          label="State"
          value={formData.state}
          onChangeText={(text) => setFormData({ ...formData, state: text })}
          placeholder="Enter state"
        />

        <Input
          label="PIN Code"
          value={formData.pin}
          onChangeText={(text) => setFormData({ ...formData, pin: text })}
          placeholder="Enter 6-digit PIN code"
          keyboardType="numeric"
          maxLength={6}
          error={errors.pin}
        />

        {/* Additional Information */}
        <Text className="mb-4 mt-6 text-lg font-semibold text-gray-900">
          Additional Information
        </Text>

        <Input
          label="Emergency Contact"
          value={formData.emergencyContact}
          onChangeText={(text) => setFormData({ ...formData, emergencyContact: text })}
          placeholder="Enter 10-digit emergency contact"
          keyboardType="phone-pad"
          maxLength={10}
          error={errors.emergencyContact}
        />

        <Input
          label="Allergies"
          value={formData.allergies}
          onChangeText={(text) => setFormData({ ...formData, allergies: text })}
          placeholder="Enter allergies (if any)"
          multiline
          numberOfLines={3}
        />

        <Input
          label="ABHA ID"
          value={formData.abhaId}
          onChangeText={(text) => setFormData({ ...formData, abhaId: text })}
          placeholder="Enter 14-digit ABHA ID"
          keyboardType="numeric"
          maxLength={14}
          error={errors.abhaId}
        />

        <View className="mb-8 mt-6 flex-row gap-3">
          <Button variant="outline" className="flex-1" onPress={() => navigation.goBack()}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onPress={handleSubmit}
            loading={updatePatient.isPending}
            disabled={updatePatient.isPending}>
            Update Patient
          </Button>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
