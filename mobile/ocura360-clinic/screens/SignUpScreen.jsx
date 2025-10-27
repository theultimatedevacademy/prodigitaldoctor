import React, { useState, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useSSO, useSignUp } from '@clerk/clerk-expo';
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

export default function SignUpScreen({ navigation }) {
  useWarmUpBrowser();

  const { signUp, setActive, isLoaded } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle email/password sign up
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      // Send verification email
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setPendingVerification(true);
    } catch (err) {
      console.error('Sign up error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', err.errors?.[0]?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  // Verify email code
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
      } else {
        console.log('Sign up status:', completeSignUp.status);
      }
    } catch (err) {
      console.error('Verification error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', err.errors?.[0]?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth sign up
  const onPressSignUpWithGoogle = useCallback(async () => {
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
      Alert.alert('Error', 'Google sign up failed');
    }
  }, []);

  if (pendingVerification) {
    return (
      <View className="flex-1 bg-white">
        <ScrollView className="flex-1" contentContainerClassName="px-6 py-12">
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
              Verify Email
            </Text>
            <Text className="text-base text-gray-600 text-center">
              Enter the verification code sent to {email}
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Verification Code
            </Text>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Enter 6-digit code"
              keyboardType="number-pad"
              maxLength={6}
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
            />
          </View>

          <TouchableOpacity
            onPress={onVerifyPress}
            disabled={loading}
            className={`rounded-lg py-4 mb-4 ${
              loading ? 'bg-gray-400' : 'bg-blue-600'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center text-base font-semibold">
                Verify Email
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
        <View id="clerk-captcha" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-12">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
            Create Account
          </Text>
          <Text className="text-base text-gray-600 text-center">
            Sign up to get started
          </Text>
        </View>

        {/* Google OAuth Button */}
        <TouchableOpacity
          onPress={onPressSignUpWithGoogle}
          className="bg-blue-600 rounded-lg py-4 mb-6 shadow-sm"
        >
          <Text className="text-white text-center text-base font-semibold">
            Sign up with Google
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-4 text-gray-500 text-sm">or</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* First Name */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            First Name
          </Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            autoCapitalize="words"
            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
          />
        </View>

        {/* Last Name */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Last Name
          </Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            autoCapitalize="words"
            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
          />
        </View>

        {/* Email */}
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

        {/* Password */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Password
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry
            autoCapitalize="none"
            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
          />
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={onSignUpPress}
          disabled={loading}
          className={`rounded-lg py-4 mb-6 ${
            loading ? 'bg-gray-400' : 'bg-blue-600'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center text-base font-semibold">
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        {/* Sign In Link */}
        <View className="flex-row justify-center">
          <Text className="text-gray-600 text-sm">Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text className="text-blue-600 text-sm font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-gray-500 text-xs mt-6 leading-5">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
      <View id="clerk-captcha" />
    </View>
  );
}
