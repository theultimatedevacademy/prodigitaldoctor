import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { ListItem } from '../../components/ui/ListItem';
import { Settings, Users, CreditCard } from 'lucide-react-native';
import { useClinicContext } from '../../contexts/ClinicContext';
import { useClinic, useUpdateClinic, useDeleteClinic } from '../../api/hooks/useClinics';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../utils/constants';

export default function ClinicSettingsScreen() {
  const navigation = useNavigation();
  const { selectedClinicId, userClinicRole } = useClinicContext();
  const { data: clinic, isLoading } = useClinic(selectedClinicId);
  const updateClinic = useUpdateClinic();
  const deleteClinic = useDeleteClinic();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  // Update form data when clinic loads
  useEffect(() => {
    if (clinic) {
      setFormData({
        name: clinic.name || '',
        address: clinic.address?.street || clinic.address || '',
        phone: clinic.contact?.phone || clinic.phone || '',
        email: clinic.contact?.email || clinic.email || '',
      });
    }
  }, [clinic]);

  const isOwner = userClinicRole === 'clinic_owner';

  // Loading state
  if (isLoading) {
    return (
      <ScreenWrapper>
        <Header title="Clinic Settings" showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading settings...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Permission check
  if (!isOwner) {
    return (
      <ScreenWrapper>
        <Header title="Settings" showBack />
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-lg text-gray-600 text-center">
            Only clinic owners can access settings
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  const handleSave = async () => {
    try {
      await updateClinic.mutateAsync({
        clinicId: selectedClinicId,
        data: {
          name: formData.name.trim(),
          address: {
            street: formData.address.trim(),
            city: clinic?.address?.city || '',
            state: clinic?.address?.state || '',
            pincode: clinic?.address?.pincode || '',
            country: clinic?.address?.country || 'India',
          },
          contact: {
            phone: formData.phone.trim(),
            email: formData.email.trim(),
          },
        },
      });

      Alert.alert('Success', SUCCESS_MESSAGES.CLINIC_UPDATED);
    } catch (error) {
      Alert.alert(
        'Error',
        error?.message || ERROR_MESSAGES.UNKNOWN_ERROR
      );
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Clinic',
      'Are you sure you want to delete this clinic? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteClinic.mutateAsync(selectedClinicId);
              Alert.alert('Success', 'Clinic deleted successfully', [
                { text: 'OK', onPress: () => navigation.navigate('Clinics') }
              ]);
            } catch (error) {
              Alert.alert(
                'Error',
                error?.message || 'Failed to delete clinic'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper withKeyboardAvoid>
      <Header title="Clinic Settings" showBack />

      <ScrollView className="flex-1 p-4">
        {/* Clinic Information */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Clinic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              label="Clinic Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter clinic name"
            />

            <Textarea
              label="Address"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Enter clinic address"
              numberOfLines={3}
            />

            <Input
              label="Phone Number"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Button
              variant="primary"
              onPress={handleSave}
              loading={updateClinic.isLoading}
              disabled={updateClinic.isLoading}
              className="mt-2"
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Management</CardTitle>
          </CardHeader>
          <CardContent>
            <ListItem
              title="Manage Staff"
              subtitle="Invite and manage staff members"
              leftIcon={Users}
              showChevron
              onPress={() => navigation.navigate('Staff')}
            />
            <ListItem
              title="Subscription"
              subtitle="View and manage subscription"
              leftIcon={CreditCard}
              showChevron
              onPress={() => navigation.navigate('Subscription')}
            />
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="mb-8 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="danger"
              onPress={handleDelete}
              loading={deleteClinic.isLoading}
              disabled={deleteClinic.isLoading}
            >
              Delete Clinic
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}
