import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

/**
 * Card Component
 * Container component with border and shadow matching web app
 */
export function Card({ children, className = '', onPress, ...props }) {
  const baseClasses = 'rounded-lg border border-gray-200 bg-white shadow-sm';
  const interactiveClasses = onPress ? 'active:shadow-md' : '';

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onPress={onPress}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * CardHeader component for card title and description
 */
export function CardHeader({ children, className = '', ...props }) {
  return (
    <View className={`p-4 pb-2 ${className}`} {...props}>
      {children}
    </View>
  );
}

/**
 * CardTitle component
 */
export function CardTitle({ children, className = '', ...props }) {
  return (
    <Text className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </Text>
  );
}

/**
 * CardDescription component
 */
export function CardDescription({ children, className = '', ...props }) {
  return (
    <Text className={`text-sm text-gray-600 mt-1 ${className}`} {...props}>
      {children}
    </Text>
  );
}

/**
 * CardContent component for main card content
 */
export function CardContent({ children, className = '', ...props }) {
  return (
    <View className={`p-4 pt-0 ${className}`} {...props}>
      {children}
    </View>
  );
}

/**
 * CardFooter component for card actions
 */
export function CardFooter({ children, className = '', ...props }) {
  return (
    <View className={`p-4 pt-2 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </View>
  );
}
