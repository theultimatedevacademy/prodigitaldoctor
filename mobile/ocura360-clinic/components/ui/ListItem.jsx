import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

/**
 * ListItem Component
 * Reusable list item with optional chevron
 */
export function ListItem({
  title,
  subtitle,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  rightContent,
  showChevron = false,
  onPress,
  className = '',
  ...props
}) {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      onPress={onPress}
      className={`flex-row items-center p-4 border-b border-gray-100 ${
        onPress ? 'active:bg-gray-50' : ''
      } ${className}`}
      {...props}
    >
      {LeftIcon && (
        <View className="mr-3">
          <LeftIcon size={24} color="#6B7280" />
        </View>
      )}
      
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900">
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
      
      {RightIcon && (
        <View className="ml-3">
          <RightIcon size={20} color="#6B7280" />
        </View>
      )}
      
      {showChevron && (
        <ChevronRight size={20} color="#9CA3AF" className="ml-2" />
      )}
    </Component>
  );
}
