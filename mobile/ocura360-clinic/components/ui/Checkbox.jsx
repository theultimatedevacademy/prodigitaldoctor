import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Check } from 'lucide-react-native';

/**
 * Checkbox Component
 * Checkbox with label
 */
export function Checkbox({
  checked = false,
  onCheckedChange,
  label,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <TouchableOpacity
      onPress={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
      className={`flex-row items-center ${disabled ? 'opacity-50' : ''} ${className}`}
      {...props}
    >
      <View
        className={`w-5 h-5 rounded border-2 ${
          checked
            ? 'bg-blue-600 border-blue-600'
            : 'bg-white border-gray-300'
        } items-center justify-center mr-2`}
      >
        {checked && <Check size={14} color="#fff" />}
      </View>
      {label && (
        <Text className="text-base text-gray-900">{label}</Text>
      )}
    </TouchableOpacity>
  );
}
