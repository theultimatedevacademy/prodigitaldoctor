import React, { useState, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useSSO, useSignIn } from '@clerk/clerk-expo';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useWarmUpBrowser } from '../hooks/useWarmUpBrowser';

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen({ navigation }) {
  useWarmUpBrowser();

  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle email/password sign in
  const onSignInPress = async () => {
    if (!isLoaded) return;

    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: email,
        password,
      });

      if (completeSignIn.status === 'complete') {
        await setActive({ session: completeSignIn.createdSessionId });
      } else {
        console.log('Sign in status:', completeSignIn.status);
      }
    } catch (err) {
      console.error('Sign in error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', err.errors?.[0]?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth sign in
  const onPressSignInWithGoogle = useCallback(async () => {
    try {
      const { createdSessionId, setActive, signUp } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({ scheme: 'ocura360clinic' }),
      });

      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else if (signUp && signUp.status === 'missing_requirements') {
        navigation.navigate('ContinueSignUp');
      }
    } catch (err) {
      console.error('OAuth error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', 'Google sign in failed');
    }
  }, []);

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-12">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
            Welcome Back
          </Text>
          <Text className="text-base text-gray-600 text-center">
            Sign in to continue
          </Text>
        </View>

        {/* Google OAuth Button */}
        <TouchableOpacity
          onPress={onPressSignInWithGoogle}
          className="bg-blue-600 rounded-lg py-4 mb-6 shadow-sm"
        >
          <Text className="text-white text-center text-base font-semibold">
            Sign in with Google
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-4 text-gray-500 text-sm">or</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Email Input */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Email
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
          />
        </View>

        {/* Password Input */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Password
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
          />
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={onSignInPress}
          disabled={loading}
          className={`rounded-lg py-4 mb-6 ${
            loading ? 'bg-gray-400' : 'bg-blue-600'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center text-base font-semibold">
              Sign In
            </Text>
          )}
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View className="flex-row justify-center">
          <Text className="text-gray-600 text-sm">Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text className="text-blue-600 text-sm font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-gray-500 text-xs mt-6 leading-5">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
      <View id="clerk-captcha" />
    </View>
  );
}
