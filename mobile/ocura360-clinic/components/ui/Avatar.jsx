import React from 'react';
import { View, Text, Image } from 'react-native';
import { User } from 'lucide-react-native';

/**
 * Avatar Component
 * User/Patient avatar with fallback to initials
 */
export function Avatar({
  source,
  name = '',
  size = 'md',
  className = '',
  ...props
}) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl',
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <View
      className={`${sizes[size]} rounded-full bg-gray-200 items-center justify-center overflow-hidden ${className}`}
      {...props}
    >
      {source ? (
        <Image source={source} className="w-full h-full" resizeMode="cover" />
      ) : initials ? (
        <Text className={`${textSizes[size]} font-semibold text-gray-700`}>
          {initials}
        </Text>
      ) : (
        <User size={iconSizes[size]} color="#6B7280" />
      )}
    </View>
  );
}
