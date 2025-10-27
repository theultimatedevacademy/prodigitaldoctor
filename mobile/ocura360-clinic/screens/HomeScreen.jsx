import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';

export default function HomeScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="p-6">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
            Welcome to Ocura360 Clinic
          </Text>
          <Text className="text-base text-gray-600 text-center">
            Your healthcare management platform
          </Text>
        </View>

        {user && (
          <View className="bg-gray-50 p-6 rounded-xl mb-8 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Profile Information
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-1">
                Name
              </Text>
              <Text className="text-base text-gray-900">
                {user.fullName || 'Not set'}
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-1">
                Email
              </Text>
              <Text className="text-base text-gray-900">
                {user.primaryEmailAddress?.emailAddress || 'Not set'}
              </Text>
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-600 mb-1">
                User ID
              </Text>
              <Text className="text-xs text-gray-700 font-mono">
                {user.id}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-red-600 rounded-lg py-4 shadow-sm"
        >
          <Text className="text-white text-center text-base font-semibold">
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
