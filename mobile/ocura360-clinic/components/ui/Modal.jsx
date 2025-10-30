import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

/**
 * Modal Component
 * Full screen modal with header
 */
export function Modal({
  visible,
  onClose,
  title,
  children,
  size = 'full',
  showCloseButton = true,
  className = '',
  ...props
}) {
  const sizes = {
    full: 'flex-1',
    large: 'h-5/6',
    medium: 'h-3/4',
    small: 'h-1/2',
  };

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      transparent={size !== 'full'}
      onRequestClose={onClose}
      {...props}
    >
      <View className={`flex-1 ${size !== 'full' ? 'bg-black/50 justify-end' : 'bg-white'}`}>
        <View className={`bg-white ${size !== 'full' ? 'rounded-t-3xl' : ''} ${sizes[size]} ${className}`}>
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 flex-1">
              {title}
            </Text>
            {showCloseButton && (
              <TouchableOpacity onPress={onClose} className="ml-4">
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Content */}
          <ScrollView className="flex-1">
            {children}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}

/**
 * BottomSheet Component
 * Bottom sheet modal for filters and actions
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  height = 'auto',
  className = '',
  ...props
}) {
  return (
    <RNModal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      {...props}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-end"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View 
            className={`bg-white rounded-t-3xl ${height === 'auto' ? 'max-h-96' : ''} ${className}`}
          >
            {/* Handle */}
            <View className="items-center py-2">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>
            
            {title && (
              <View className="px-4 pb-3 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-900 text-center">
                  {title}
                </Text>
              </View>
            )}
            
            <View className="p-4">
              {children}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
}
