import React from 'react';
import { View } from 'react-native';

/**
 * Divider Component
 * Horizontal line divider
 */
export function Divider({ className = '', ...props }) {
  return (
    <View className={`h-px bg-gray-200 ${className}`} {...props} />
  );
}
