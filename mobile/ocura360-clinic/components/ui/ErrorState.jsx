import React from 'react';
import { View, Text } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Button } from './Button';

/**
 * ErrorState Component
 * Display when an error occurs
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred. Please try again.',
  onRetry,
  className = '',
  ...props
}) {
  return (
    <View className={`flex-1 items-center justify-center p-8 ${className}`} {...props}>
      <AlertCircle size={64} color="#EF4444" className="mb-4" />
      <Text className="text-xl font-semibold text-gray-900 text-center mb-2">
        {title}
      </Text>
      <Text className="text-base text-gray-600 text-center mb-6">
        {message}
      </Text>
      {onRetry && (
        <Button onPress={onRetry} variant="primary">
          Try Again
        </Button>
      )}
    </View>
  );
}
