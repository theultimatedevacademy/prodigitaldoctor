import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';

/**
 * SearchBar Component
 * Search input with icon and clear button
 */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  className = '',
  ...props
}) {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChangeText('');
    }
  };

  return (
    <View className={`flex-row items-center bg-gray-100 rounded-lg px-4 py-2 ${className}`}>
      <Search size={20} color="#6B7280" className="mr-2" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className="flex-1 text-base text-gray-900"
        {...props}
      />
      {value && value.length > 0 && (
        <TouchableOpacity onPress={handleClear} className="ml-2">
          <X size={20} color="#6B7280" />
        </TouchableOpacity>
      )}
    </View>
  );
}
