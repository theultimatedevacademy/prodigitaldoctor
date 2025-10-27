import React, { useState } from 'react';
import { View, ScrollView, Alert, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { useCreateClinic } from '../../api/hooks/useClinics';
import { useMe } from '../../api/hooks/useAuth';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../utils/constants';

export default function NewClinicScreen() {
  const navigation = useNavigation();
  const createClinic = useCreateClinic();
  const { data: user } = useMe();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Clinic name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    // Check subscription limits
    const maxClinics = user?.subscription?.maxClinics || 1;
    const currentClinics = user?.clinics?.length || 0;
    
    if (currentClinics >= maxClinics && user?.subscription?.plan === 'free') {
      Alert.alert(
        'Subscription Limit Reached',
        `You can only create ${maxClinics} clinic${maxClinics > 1 ? 's' : ''} on the free plan. Please upgrade to create more clinics.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') }
        ]
      );
      return;
    }

    try {
      await createClinic.mutateAsync({
        name: formData.name.trim(),
        address: {
          street: formData.address.trim(),
          city: '', // Can be enhanced with separate fields
          state: '',
          pincode: '',
          country: 'India',
        },
        contact: {
          phone: formData.phone.trim(),
          email: formData.email.trim(),
        },
      });

      Alert.alert('Success', SUCCESS_MESSAGES.CLINIC_CREATED, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error?.message || ERROR_MESSAGES.UNKNOWN_ERROR
      );
    }
  };

  return (
    <ScreenWrapper withKeyboardAvoid>
      <Header title="Create Clinic" showBack />

      <ScrollView className="flex-1 p-4">
        {/* Logo Upload Placeholder */}
        <View className="items-center mb-6">
          <Avatar name={formData.name} size="xl" />
          <Button variant="ghost" size="sm" className="mt-2">
            Upload Logo
          </Button>
        </View>

        <Input
          label="Clinic Name *"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Enter clinic name"
          error={errors.name}
        />

        <Textarea
          label="Address *"
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
          placeholder="Enter clinic address"
          numberOfLines={3}
          error={errors.address}
        />

        <Input
          label="Phone Number *"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          error={errors.phone}
        />

        <Input
          label="Email *"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <View className="flex-row gap-3 mt-6 mb-8">
          <Button
            variant="outline"
            className="flex-1"
            onPress={() => navigation.goBack()}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onPress={handleSubmit}
            loading={createClinic.isLoading}
            disabled={createClinic.isLoading}
          >
            Create Clinic
          </Button>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
