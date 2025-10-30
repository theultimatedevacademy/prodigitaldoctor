import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AppointmentsListScreen from '../screens/appointments/AppointmentsListScreen';
import AppointmentDetailScreen from '../screens/appointments/AppointmentDetailScreen';
import NewAppointmentScreen from '../screens/appointments/NewAppointmentScreen';
import PatientDetailScreen from '../screens/patients/PatientDetailScreen';
import PrescriptionDetailScreen from '../screens/prescriptions/PrescriptionDetailScreen';
import NewPrescriptionScreen from '../screens/prescriptions/NewPrescriptionScreen';

const Stack = createStackNavigator();

export default function AppointmentsNavigator({ navigation }) {
  useEffect(() => {
    // Listen for tab press events from the parent tab navigator
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      // Get the current tab's navigation state
      const state = navigation.getState();
      
      // The state contains the routes for the tab navigator
      // We need to check the nested stack navigator state
      if (state && state.routes) {
        const appointmentsRoute = state.routes.find(r => r.name === 'AppointmentsTab');
        
        if (appointmentsRoute && appointmentsRoute.state) {
          const stackState = appointmentsRoute.state;
          
          // If we're not on the first screen in the stack, pop to top
          if (stackState.index > 0) {
            e.preventDefault();
            // Use popToTop to go back to the first screen in the stack
            navigation.navigate('AppointmentsTab', {
              screen: 'AppointmentsList'
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
      <Stack.Screen name="AppointmentsList" component={AppointmentsListScreen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
      <Stack.Screen name="NewAppointment" component={NewAppointmentScreen} />
      <Stack.Screen name="EditAppointment" component={NewAppointmentScreen} />
      <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
      <Stack.Screen name="PrescriptionDetail" component={PrescriptionDetailScreen} />
      <Stack.Screen name="NewPrescription" component={NewPrescriptionScreen} />
    </Stack.Navigator>
  );
}
