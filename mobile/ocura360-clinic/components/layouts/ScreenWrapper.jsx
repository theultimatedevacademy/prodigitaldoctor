import React from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * ScreenWrapper Component
 * Wrapper for all screens with safe area and keyboard handling
 */
export function ScreenWrapper({
  children,
  withKeyboardAvoid = false,
  className = '',
  edges = ['top', 'left', 'right'],
  ...props
}) {
  const content = (
    <SafeAreaView 
      edges={edges}
      className={`flex-1 bg-white ${className}`} 
      {...props}
    >
      {children}
    </SafeAreaView>
  );

  if (withKeyboardAvoid) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
}
