import React from 'react';
import { View, Text, TextInput } from 'react-native';

/**
 * Input Component
 * Text input with label and error state
 */
export function Input({
  label,
  error,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines = 1,
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
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
        placeholderTextColor="#9CA3AF"
        className={inputClasses}
        {...props}
      />
      {error && (
        <Text className="text-sm text-red-600 mt-1">{error}</Text>
      )}
    </View>
  );
}
