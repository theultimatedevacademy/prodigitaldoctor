import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';

/**
 * FloatingActionButton Component
 * FAB for primary actions
 */
export function FloatingActionButton({
  onPress,
  icon: Icon = Plus,
  position = 'bottom-right',
  className = '',
  ...props
}) {
  const positions = {
    'bottom-right': 'absolute bottom-6 right-6',
    'bottom-left': 'absolute bottom-6 left-6',
    'bottom-center': 'absolute bottom-6 self-center',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`w-14 h-14 rounded-full bg-blue-600 items-center justify-center shadow-lg active:bg-blue-700 ${positions[position]} ${className}`}
      {...props}
    >
      <Icon size={24} color="#fff" />
    </TouchableOpacity>
  );
}
