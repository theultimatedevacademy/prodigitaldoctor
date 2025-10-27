import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { View, ActivityIndicator } from 'react-native';
import { ClinicProvider } from '../contexts/ClinicContext';
import { NotificationProvider } from '../contexts/NotificationContext';

// Auth screens
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ContinueSignUpScreen from '../screens/ContinueSignUpScreen';

// Onboarding screens
import LandingScreen from '../screens/onboarding/LandingScreen';
import PendingUserDashboard from '../screens/onboarding/PendingUserDashboard';
import StartTrialScreen from '../screens/onboarding/StartTrialScreen';

// Main app
import MainTabNavigator from './MainTabNavigator';

// Additional screens that need to be accessible from anywhere
import PatientDetailScreen from '../screens/patients/PatientDetailScreen';
import AppointmentDetailScreen from '../screens/appointments/AppointmentDetailScreen';
import NewAppointmentScreen from '../screens/appointments/NewAppointmentScreen';
import PrescriptionDetailScreen from '../screens/prescriptions/PrescriptionDetailScreen';
import NewPrescriptionScreen from '../screens/prescriptions/NewPrescriptionScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  // Show loading screen while checking authentication status
  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // Check if user needs to complete signup
  const needsToCompleteSignup = isSignedIn && (!user?.firstName || !user?.lastName);

  return (
    <NavigationContainer>
      {isSignedIn ? (
        // User is signed in - wrap with providers
        <ClinicProvider>
          <NotificationProvider>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}
            >
              {needsToCompleteSignup ? (
                // User needs to complete signup
                <Stack.Screen
                  name="ContinueSignUp"
                  component={ContinueSignUpScreen}
                />
              ) : (
                // User is fully set up - show main app
                <>
                  <Stack.Screen name="MainApp" component={MainTabNavigator} />
                  <Stack.Screen name="PendingUserDashboard" component={PendingUserDashboard} />
                  <Stack.Screen name="StartTrial" component={StartTrialScreen} />
                </>
              )}
            </Stack.Navigator>
          </NotificationProvider>
        </ClinicProvider>
      ) : (
        // User is not signed in - show auth/landing screens
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
