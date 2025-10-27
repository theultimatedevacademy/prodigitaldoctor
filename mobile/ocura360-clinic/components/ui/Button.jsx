import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

/**
 * Button Component
 * Reusable button with variants and sizes matching web app
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  className = '',
  ...props
}) {
  const baseClasses = 'flex-row items-center justify-center rounded-lg';

  const variants = {
    primary: 'bg-blue-600 active:bg-blue-700',
    secondary: 'bg-gray-200 active:bg-gray-300',
    outline: 'border border-gray-300 bg-transparent active:bg-gray-50',
    ghost: 'bg-transparent active:bg-gray-100',
    danger: 'bg-red-600 active:bg-red-700',
  };

  const sizes = {
    sm: 'h-8 px-3',
    md: 'h-10 px-4',
    lg: 'h-12 px-6',
  };

  const textVariants = {
    primary: 'text-white font-semibold',
    secondary: 'text-gray-900 font-semibold',
    outline: 'text-gray-900 font-semibold',
    ghost: 'text-gray-900 font-semibold',
    danger: 'text-white font-semibold',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const disabledClasses = disabled || loading ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#fff' : '#000'}
          className="mr-2"
        />
      )}
      <Text className={`${textVariants[variant]} ${textSizes[size]}`}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}
