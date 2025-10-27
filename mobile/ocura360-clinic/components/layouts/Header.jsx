import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

/**
 * Header Component
 * Screen header with back button and actions
 */
export function Header({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightContent,
  className = '',
  ...props
}) {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View
      className={`flex-row items-center px-4 py-3 bg-white border-b border-gray-200 ${className}`}
      {...props}
    >
      {showBack && (
        <TouchableOpacity onPress={handleBack} className="mr-3">
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
      )}
      
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm text-gray-600 mt-0.5">
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
