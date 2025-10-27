import React, { useState } from 'react';
import { View, ScrollView, Alert, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import { ScreenWrapper } from '../../components/layouts/ScreenWrapper';
import { Header } from '../../components/layouts/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
  });

  const handleSave = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Profile updated successfully');
    }, 1000);
  };

  return (
    <ScreenWrapper withKeyboardAvoid>
      <Header title="Profile" showBack />

      <ScrollView className="flex-1 p-4">
        {/* Profile Photo */}
        <View className="items-center mb-6">
          <Avatar name={user?.fullName || 'User'} size="xl" />
          <Button variant="ghost" size="sm" className="mt-2">
            Change Photo
          </Button>
        </View>

        {/* Personal Information */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              label="First Name"
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              placeholder="Enter first name"
            />

            <Input
              label="Last Name"
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              placeholder="Enter last name"
            />

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />

            <Text className="text-xs text-gray-500 mb-4">
              Email cannot be changed. Contact support if you need to update it.
            </Text>

            <Button
              variant="primary"
              onPress={handleSave}
              loading={loading}
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="space-y-3">
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-1">
                  User ID
                </Text>
                <Text className="text-sm text-gray-900 font-mono">
                  {user?.id}
                </Text>
              </View>

              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-1">
                  Account Created
                </Text>
                <Text className="text-sm text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </Text>
              </View>

              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-1">
                  Last Sign In
                </Text>
                <Text className="text-sm text-gray-900">
                  {user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onPress={() => Alert.alert('Password', 'Password change feature coming soon')}
            >
              Change Password
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}
