import React from 'react';
import { View, Text } from 'react-native';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react-native';

/**
 * Alert Component
 * Alert/notification box with variants
 */
export function Alert({
  children,
  variant = 'info',
  title,
  onClose,
  className = '',
  ...props
}) {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      text: 'text-blue-900',
      icon: Info,
      iconColor: '#1E40AF',
    },
    success: {
      container: 'bg-green-50 border-green-200',
      text: 'text-green-900',
      icon: CheckCircle,
      iconColor: '#15803D',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-900',
      icon: AlertTriangle,
      iconColor: '#A16207',
    },
    error: {
      container: 'bg-red-50 border-red-200',
      text: 'text-red-900',
      icon: AlertCircle,
      iconColor: '#B91C1C',
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <View
      className={`flex-row p-4 rounded-lg border ${config.container} ${className}`}
      {...props}
    >
      <Icon size={20} color={config.iconColor} className="mr-3 mt-0.5" />
      <View className="flex-1">
        {title && (
          <Text className={`font-semibold mb-1 ${config.text}`}>
            {title}
          </Text>
        )}
        <Text className={`text-sm ${config.text}`}>{children}</Text>
      </View>
      {onClose && (
        <X
          size={20}
          color={config.iconColor}
          onPress={onClose}
          className="ml-2"
        />
      )}
    </View>
  );
}
