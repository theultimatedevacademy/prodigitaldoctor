import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

/**
 * Spinner Component
 * Loading indicator
 */
export function Spinner({ size = 'large', color = '#4285F4', className = '' }) {
  return (
    <View className={`items-center justify-center ${className}`}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

/**
 * LoadingOverlay Component
 * Full screen loading overlay with message
 */
export function LoadingOverlay({ message = 'Loading...', className = '' }) {
  return (
    <View className={`flex-1 items-center justify-center bg-white ${className}`}>
      <ActivityIndicator size="large" color="#4285F4" />
      {message && (
        <Text className="text-gray-600 mt-4 text-base">{message}</Text>
      )}
    </View>
  );
}
