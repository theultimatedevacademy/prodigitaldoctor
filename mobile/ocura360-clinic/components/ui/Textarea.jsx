import React from 'react';
import { View, Text, TextInput } from 'react-native';

/**
 * Textarea Component
 * Multi-line text input
 */
export function Textarea({
  label,
  error,
  placeholder,
  value,
  onChangeText,
  numberOfLines = 4,
  maxLength,
  editable = true,
  className = '',
  ...props
}) {
  const inputClasses = `bg-gray-50 border ${
    error ? 'border-red-500' : 'border-gray-300'
  } rounded-lg px-4 py-3 text-base text-gray-900 ${
    !editable ? 'opacity-50' : ''
  }`;

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        editable={editable}
        placeholderTextColor="#9CA3AF"
        textAlignVertical="top"
        className={inputClasses}
        style={{ minHeight: numberOfLines * 24 }}
        {...props}
      />
      {maxLength && (
        <Text className="text-xs text-gray-500 mt-1 text-right">
          {value?.length || 0}/{maxLength}
        </Text>
      )}
      {error && (
        <Text className="text-sm text-red-600 mt-1">{error}</Text>
      )}
    </View>
  );
}
