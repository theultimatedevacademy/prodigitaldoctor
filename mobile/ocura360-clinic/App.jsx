import React from 'react';
import { ClerkProvider } from '@clerk/clerk-expo';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import createTokenCache from './utils/tokenCache';
import AppNavigator from './navigation/AppNavigator';
import { QueryProvider } from './providers/QueryProvider';

import './global.css';

// Get Clerk publishable key from environment variables
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function App() {
  const tokenCache = createTokenCache();

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <ClerkProvider
          publishableKey={CLERK_PUBLISHABLE_KEY}
          tokenCache={tokenCache}
        >
          <AppNavigator />
          <StatusBar style="dark" translucent={false} backgroundColor="#FFFFFF" />
        </ClerkProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
