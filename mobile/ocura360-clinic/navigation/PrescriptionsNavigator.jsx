import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PrescriptionsListScreen from '../screens/prescriptions/PrescriptionsListScreen';
import PrescriptionDetailScreen from '../screens/prescriptions/PrescriptionDetailScreen';
import NewPrescriptionScreen from '../screens/prescriptions/NewPrescriptionScreen';
import PatientDetailScreen from '../screens/patients/PatientDetailScreen';
import AppointmentDetailScreen from '../screens/appointments/AppointmentDetailScreen';

const Stack = createStackNavigator();

export default function PrescriptionsNavigator({ navigation }) {
  useEffect(() => {
    // Listen for tab press events from the parent tab navigator
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      // Get the current tab's navigation state
      const state = navigation.getState();
      
      // The state contains the routes for the tab navigator
      // We need to check the nested stack navigator state
      if (state && state.routes) {
        const prescriptionsRoute = state.routes.find(r => r.name === 'PrescriptionsTab');
        
        if (prescriptionsRoute && prescriptionsRoute.state) {
          const stackState = prescriptionsRoute.state;
          
          // If we're not on the first screen in the stack, pop to top
          if (stackState.index > 0) {
            e.preventDefault();
            // Use popToTop to go back to the first screen in the stack
            navigation.navigate('PrescriptionsTab', {
              screen: 'PrescriptionsList'
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
      <Stack.Screen name="PrescriptionsList" component={PrescriptionsListScreen} />
      <Stack.Screen name="PrescriptionDetail" component={PrescriptionDetailScreen} />
      <Stack.Screen name="NewPrescription" component={NewPrescriptionScreen} />
      <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
    </Stack.Navigator>
  );
}
