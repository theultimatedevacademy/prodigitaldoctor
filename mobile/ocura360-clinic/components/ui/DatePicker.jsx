import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';

/**
 * DatePicker Component
 * Native date picker for mobile
 */
export function DatePicker({
  label,
  value,
  onChange,
  mode = 'date',
  placeholder = 'Select date',
  error,
  minimumDate,
  maximumDate,
  className = '',
  ...props
}) {
  const [show, setShow] = useState(false);

  const handleChange = (event, selectedDate) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date) => {
    if (!date) return placeholder;
    if (mode === 'time') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        onPress={() => setShow(true)}
        className={`bg-gray-50 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-lg px-4 py-3 flex-row items-center justify-between`}
        {...props}
      >
        <Text className={`text-base ${value ? 'text-gray-900' : 'text-gray-400'}`}>
          {formatDate(value)}
        </Text>
        <Calendar size={20} color="#6B7280" />
      </TouchableOpacity>

      {error && (
        <Text className="text-sm text-red-600 mt-1">{error}</Text>
      )}

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
}
