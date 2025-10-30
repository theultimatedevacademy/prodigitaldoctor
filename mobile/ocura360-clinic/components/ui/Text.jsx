import React from 'react';
import { Text as RNText } from 'react-native';

/**
 * Text Component
 * Wrapper for React Native Text with className support
 */
export function Text({ className = '', children, ...props }) {
  return (
    <RNText className={className} {...props}>
      {children}
    </RNText>
  );
}
