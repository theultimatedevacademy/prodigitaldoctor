import React from 'react';
import { View, TouchableOpacity, Text, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, Calendar, FileText, Pill, Menu } from 'lucide-react-native';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  // Define tab configuration
  const tabs = [
    { name: 'DashboardTab', icon: LayoutDashboard, label: 'Dashboard' },
    { name: 'PrescriptionsTab', icon: FileText, label: 'Prescriptions' },
    { name: 'AppointmentsTab', icon: Calendar, label: 'Appointments', isFAB: true },
    { name: 'MedicationsTab', icon: Pill, label: 'Medications' },
    { name: 'MoreTab', icon: Menu, label: 'More' },
  ];

  const handlePress = (route, index) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 8),
        },
      ]}
    >
      {tabs.map((tab, index) => {
        const route = state.routes.find(r => r.name === tab.name);
        if (!route) return null;

        const routeIndex = state.routes.indexOf(route);
        const isFocused = state.index === routeIndex;
        const Icon = tab.icon;

        // Render FAB for Appointments
        if (tab.isFAB) {
          return (
            <View key={tab.name} style={styles.fabContainer}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={tab.label}
                onPress={() => handlePress(route, routeIndex)}
                style={styles.fab}
                activeOpacity={0.8}
              >
                <Icon size={28} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
              {isFocused && (
                <Text style={styles.fabLabel}>{tab.label}</Text>
              )}
            </View>
          );
        }

        // Render regular tabs
        return (
          <TouchableOpacity
            key={tab.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={tab.label}
            onPress={() => handlePress(route, routeIndex)}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <Icon
              size={24}
              color={isFocused ? '#2563EB' : '#6B7280'}
              strokeWidth={isFocused ? 2.5 : 2}
            />
            {isFocused && (
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? '#2563EB' : '#6B7280' },
                ]}
              >
                {tab.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    paddingHorizontal: 8,
    alignItems: 'flex-start',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  fabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -28,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 6,
    textAlign: 'center',
  },
});

export default CustomTabBar;
