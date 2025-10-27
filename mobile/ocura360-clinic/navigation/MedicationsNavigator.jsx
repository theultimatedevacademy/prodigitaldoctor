import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MedicationsListScreen from '../screens/medications/MedicationsListScreen';
import MedicationDetailScreen from '../screens/medications/MedicationDetailScreen';

const Stack = createStackNavigator();

export default function MedicationsNavigator({ navigation }) {
  useEffect(() => {
    // Listen for tab press events from the parent tab navigator
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      // Get the current tab's navigation state
      const state = navigation.getState();
      
      // The state contains the routes for the tab navigator
      // We need to check the nested stack navigator state
      if (state && state.routes) {
        const medicationsRoute = state.routes.find(r => r.name === 'MedicationsTab');
        
        if (medicationsRoute && medicationsRoute.state) {
          const stackState = medicationsRoute.state;
          
          // If we're not on the first screen in the stack, pop to top
          if (stackState.index > 0) {
            e.preventDefault();
            // Use popToTop to go back to the first screen in the stack
            navigation.navigate('MedicationsTab', {
              screen: 'MedicationsList'
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
      <Stack.Screen name="MedicationsList" component={MedicationsListScreen} />
      <Stack.Screen name="MedicationDetail" component={MedicationDetailScreen} />
    </Stack.Navigator>
  );
}
