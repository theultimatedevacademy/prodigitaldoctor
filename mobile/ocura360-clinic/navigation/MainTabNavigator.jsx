import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import AppointmentsNavigator from './AppointmentsNavigator';
import PrescriptionsNavigator from './PrescriptionsNavigator';
import MedicationsNavigator from './MedicationsNavigator';
import MoreNavigator from './MoreNavigator';
import CustomTabBar from './components/CustomTabBar';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="DashboardTab" component={DashboardScreen} />
      <Tab.Screen name="PrescriptionsTab" component={PrescriptionsNavigator} />
      <Tab.Screen name="AppointmentsTab" component={AppointmentsNavigator} />
      <Tab.Screen name="MedicationsTab" component={MedicationsNavigator} />
      <Tab.Screen name="MoreTab" component={MoreNavigator} />
    </Tab.Navigator>
  );
}
