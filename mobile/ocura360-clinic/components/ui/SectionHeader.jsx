import React from 'react';
import { View, Text } from 'react-native';

/**
 * SectionHeader Component
 * Section header for lists
 */
export function SectionHeader({
  title,
  subtitle,
  rightContent,
  className = '',
  ...props
}) {
  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 ${className}`}
      {...props}
    >
      <View className="flex-1">
        <Text className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-xs text-gray-600 mt-0.5">
            {subtitle}
          </Text>
        )}
      </View>
      {rightContent && (
        <View className="ml-3">
          {rightContent}
        </View>
      )}
    </View>
  );
}
