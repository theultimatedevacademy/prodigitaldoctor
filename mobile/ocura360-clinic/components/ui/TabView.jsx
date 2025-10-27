import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

/**
 * TabView Component
 * Tabbed navigation for detail screens
 */
export function TabView({ tabs = [], className = '', ...props }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View className={`flex-1 ${className}`} {...props}>
      {/* Tab Headers */}
      <View className="flex-row border-b border-gray-200 bg-white">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveTab(index)}
              className={`px-4 py-3 border-b-2 ${
                activeTab === index
                  ? 'border-blue-600'
                  : 'border-transparent'
              }`}
            >
              <Text
                className={`text-base font-semibold ${
                  activeTab === index ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View className="flex-1">
        {tabs[activeTab]?.content}
      </View>
    </View>
  );
}
