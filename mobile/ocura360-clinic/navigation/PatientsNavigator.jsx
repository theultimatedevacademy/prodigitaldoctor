import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PatientsListScreen from '../screens/patients/PatientsListScreen';
import PatientDetailScreen from '../screens/patients/PatientDetailScreen';
import EditPatientScreen from '../screens/patients/EditPatientScreen';

const Stack = createStackNavigator();

export default function PatientsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="PatientsList" component={PatientsListScreen} />
      <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
      <Stack.Screen name="EditPatient" component={EditPatientScreen} />
    </Stack.Navigator>
  );
}
