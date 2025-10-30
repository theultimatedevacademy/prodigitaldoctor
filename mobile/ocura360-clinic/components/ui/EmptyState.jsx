import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';

/**
 * EmptyState Component
 * Display when no data is available
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
  ...props
}) {
  return (
    <View className={`flex-1 items-center justify-center p-8 ${className}`} {...props}>
      {Icon && (
        <View className="mb-4">
          <Icon size={64} color="#9CA3AF" />
        </View>
      )}
      <Text className="text-xl font-semibold text-gray-900 text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-base text-gray-600 text-center mb-6">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button onPress={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </View>
  );
}
