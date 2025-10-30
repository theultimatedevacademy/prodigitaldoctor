import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';

/**
 * Select Component
 * Dropdown picker for mobile
 */
export function Select({
  label,
  value,
  options = [],
  onValueChange,
  placeholder = 'Select an option',
  error,
  className = '',
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optionValue) => {
    onValueChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className={`bg-gray-50 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-lg px-4 py-3 flex-row items-center justify-between`}
        {...props}
      >
        <Text className={`text-base ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
          {displayText}
        </Text>
        <ChevronDown size={20} color="#6B7280" />
      </TouchableOpacity>

      {error && (
        <Text className="text-sm text-red-600 mt-1">{error}</Text>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View className="flex-1 justify-end">
            <View className="bg-white rounded-t-3xl max-h-96">
              <View className="p-4 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-900 text-center">
                  {label || 'Select'}
                </Text>
              </View>
              <FlatList
                data={options}
                keyExtractor={(item) => item.value.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item.value)}
                    className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100"
                  >
                    <Text className={`text-base ${
                      item.value === value ? 'text-blue-600 font-semibold' : 'text-gray-900'
                    }`}>
                      {item.label}
                    </Text>
                    {item.value === value && (
                      <Check size={20} color="#2563EB" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
