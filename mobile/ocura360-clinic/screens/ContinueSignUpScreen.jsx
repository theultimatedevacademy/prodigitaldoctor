import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';

export default function ContinueSignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Protect the page from users who are not in the sign-up flow
    if (isLoaded && !signUp?.id) {
      // Navigate back to sign in
      console.log('No sign-up in progress, redirect to sign-in');
    }
  }, [isLoaded, signUp]);

  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  const status = signUp?.status;
  const missingFields = signUp?.missingFields || [];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Update the SignUp object with the missing fields
      const res = await signUp?.update(formData);
      
      if (res?.status === 'complete') {
        await setActive({
          session: res.createdSessionId,
        });
      }
    } catch (err) {
      console.error('Error completing sign-up:', JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  if (status === 'missing_requirements') {
    return (
      <View className="flex-1 bg-white">
        <ScrollView className="flex-1" contentContainerClassName="p-6">
          <View className="mt-8 mb-8">
            <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
              Complete Your Profile
            </Text>
            <Text className="text-base text-gray-600 text-center">
              We need a bit more information to complete your sign-up
            </Text>
          </View>

          <View className="mt-4">
            {missingFields.map((field) => (
              <View key={field} className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  {field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </Text>
                <TextInput
                  value={formData[field] || ''}
                  onChangeText={(value) => handleChange(field, value)}
                  placeholder={`Enter ${field.replace(/_/g, ' ')}`}
                  autoCapitalize="none"
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
                />
              </View>
            ))}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className={`rounded-lg py-4 mt-4 ${
                loading ? 'bg-gray-400' : 'bg-blue-600'
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center text-base font-semibold">
                  Complete Sign Up
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View id="clerk-captcha" />
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4285F4" />
        <View id="clerk-captcha" />
      </View>
    </View>
  );
}
