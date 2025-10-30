import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

/**
 * Radio Component
 * Radio button with label
 */
export function Radio({
  selected = false,
  onSelect,
  label,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <TouchableOpacity
      onPress={() => !disabled && onSelect()}
      disabled={disabled}
      className={`flex-row items-center ${disabled ? 'opacity-50' : ''} ${className}`}
      {...props}
    >
      <View
        className={`w-5 h-5 rounded-full border-2 ${
          selected
            ? 'border-blue-600'
            : 'border-gray-300'
        } items-center justify-center mr-2`}
      >
        {selected && (
          <View className="w-2.5 h-2.5 rounded-full bg-blue-600" />
        )}
      </View>
      {label && (
        <Text className="text-base text-gray-900">{label}</Text>
      )}
    </TouchableOpacity>
  );
}

/**
 * RadioGroup Component
 * Group of radio buttons
 */
export function RadioGroup({
  options = [],
  value,
  onValueChange,
  className = '',
  ...props
}) {
  return (
    <View className={className} {...props}>
      {options.map((option) => (
        <Radio
          key={option.value}
          selected={value === option.value}
          onSelect={() => onValueChange(option.value)}
          label={option.label}
          className="mb-3"
        />
      ))}
    </View>
  );
}
