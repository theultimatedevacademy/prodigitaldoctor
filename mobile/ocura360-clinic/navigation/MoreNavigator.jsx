import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MoreScreen from '../screens/more/MoreScreen';
import ProfileScreen from '../screens/more/ProfileScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ClinicsListScreen from '../screens/clinics/ClinicsListScreen';
import ClinicDetailScreen from '../screens/clinics/ClinicDetailScreen';
import NewClinicScreen from '../screens/clinics/NewClinicScreen';
import ClinicSettingsScreen from '../screens/clinics/ClinicSettingsScreen';
import StaffManagementScreen from '../screens/staff/StaffManagementScreen';
import SubscriptionScreen from '../screens/onboarding/SubscriptionScreen';
import PatientsListScreen from '../screens/patients/PatientsListScreen';
import PatientDetailScreen from '../screens/patients/PatientDetailScreen';
import EditPatientScreen from '../screens/patients/EditPatientScreen';

const Stack = createStackNavigator();

export default function MoreNavigator({ navigation }) {
  useEffect(() => {
    // Listen for tab press events from the parent tab navigator
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      // Get the current tab's navigation state
      const state = navigation.getState();
      
      // The state contains the routes for the tab navigator
      // We need to check the nested stack navigator state
      if (state && state.routes) {
        const moreRoute = state.routes.find(r => r.name === 'MoreTab');
        
        if (moreRoute && moreRoute.state) {
          const stackState = moreRoute.state;
          
          // If we're not on the first screen in the stack, pop to top
          if (stackState.index > 0) {
            e.preventDefault();
            // Use popToTop to go back to the first screen in the stack
            navigation.navigate('MoreTab', {
              screen: 'MoreScreen'
            });
          }
        }
      }
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MoreScreen" component={MoreScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Clinics" component={ClinicsListScreen} />
      <Stack.Screen name="ClinicDetail" component={ClinicDetailScreen} />
      <Stack.Screen name="NewClinic" component={NewClinicScreen} />
      <Stack.Screen name="ClinicSettings" component={ClinicSettingsScreen} />
      <Stack.Screen name="Staff" component={StaffManagementScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="Patients" component={PatientsListScreen} />
      <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
      <Stack.Screen name="EditPatient" component={EditPatientScreen} />
    </Stack.Navigator>
  );
}
