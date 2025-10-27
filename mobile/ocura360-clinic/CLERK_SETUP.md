# Clerk Authentication Setup Guide

This guide explains how to configure and use Clerk authentication with Google SSO in the Ocura360 Clinic mobile app.

## 📋 Prerequisites

- Node.js and npm installed
- Expo CLI installed (`npm install -g expo-cli`)
- Clerk account (sign up at https://clerk.com)
- Google Cloud Console account (for custom OAuth credentials in production)

## 🚀 Setup Instructions

### 1. Configure Clerk Dashboard

1. **Create a Clerk Application**
   - Go to https://dashboard.clerk.com
   - Create a new application or select an existing one
   - Copy your **Publishable Key**

2. **Enable Google OAuth**
   - Navigate to **Configure → SSO Connections**
   - Enable **Google** as an OAuth provider
   - For development: Use Clerk's shared credentials
   - For production: Set up custom Google OAuth credentials

3. **Configure Redirect URLs**
   - Navigate to **Paths** section in Clerk Dashboard
   - Add development redirect URL: `ocura360clinic://`
   - Add any additional URLs as needed

4. **Configure User Settings** (Optional)
   - Set required fields (email, name, etc.)
   - Enable/disable username requirements
   - Configure progressive sign-up if desired

### 2. Configure Environment Variables

1. Open the `.env` file in the project root
2. Replace the placeholder with your actual Clerk Publishable Key:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

**⚠️ IMPORTANT:** Never commit your `.env` file to version control!

### 3. Install Dependencies (Already Done)

All required dependencies are already installed:
- `@clerk/clerk-expo` - Clerk SDK for Expo
- `expo-secure-store` - Secure token storage
- `expo-auth-session` - OAuth session handling
- `expo-web-browser` - Browser handling for OAuth
- `@react-navigation/native` - Navigation library
- `@react-navigation/stack` - Stack navigator
- `react-native-screens` - Native screen components
- `react-native-gesture-handler` - Gesture handling

### 4. Run the App

```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## 🏗️ Project Structure

```
mobile/ocura360-clinic/
├── screens/
│   ├── SignInScreen.js          # Google OAuth sign-in screen
│   ├── HomeScreen.js             # Main app screen (authenticated)
│   └── ContinueSignUpScreen.js  # Handle missing requirements
├── navigation/
│   └── AppNavigator.js          # Navigation configuration
├── utils/
│   └── tokenCache.js            # Secure token storage utility
├── hooks/
│   └── useWarmUpBrowser.js      # Android browser optimization
├── App.js                       # Root component with ClerkProvider
├── app.json                     # Expo configuration with URL scheme
├── .env                         # Environment variables (not in git)
└── .env.example                 # Environment template
```

## 🔐 Authentication Flow

### Sign In with Google OAuth

1. User taps "Sign in with Google" button
2. App redirects to Google authentication
3. User authenticates with Google account
4. Google redirects back to app with auth token
5. Clerk creates/signs in user session
6. User is redirected to Home screen

### Missing Requirements Flow

If your Clerk instance requires additional information (username, phone, etc.):

1. After OAuth, `signUp.status === 'missing_requirements'`
2. User is shown the Continue Sign-Up screen
3. User fills in missing fields
4. Session is created after completion

## 📱 Key Components

### ClerkProvider (App.js)

Wraps the entire app and provides authentication context:

```javascript
<ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
  <AppNavigator />
</ClerkProvider>
```

### SignInScreen

Handles Google OAuth authentication:

```javascript
const { startSSOFlow } = useSSO();

const onPressSignInWithGoogle = async () => {
  const { createdSessionId, setActive } = await startSSOFlow({
    strategy: 'oauth_google',
    redirectUrl: AuthSession.makeRedirectUri({ scheme: 'ocura360clinic' }),
  });

  if (createdSessionId) {
    setActive({ session: createdSessionId });
  }
};
```

### AppNavigator

Conditionally renders auth or app screens based on authentication status:

```javascript
const { isLoaded, isSignedIn } = useAuth();

{isSignedIn ? (
  <Stack.Screen name="Home" component={HomeScreen} />
) : (
  <Stack.Screen name="SignIn" component={SignInScreen} />
)}
```

## 🔧 Customization

### Add More OAuth Providers

To add more OAuth providers (Facebook, GitHub, etc.):

1. Enable the provider in Clerk Dashboard
2. Update SignInScreen.js with new button:

```javascript
const onPressSignInWithFacebook = async () => {
  await startSSOFlow({
    strategy: 'oauth_facebook',
    redirectUrl: AuthSession.makeRedirectUri({ scheme: 'ocura360clinic' }),
  });
};
```

### Configure Required Fields

In Clerk Dashboard:
1. Navigate to **User & Authentication → Email, Phone, Username**
2. Set fields as required, optional, or off
3. Users will be prompted to fill missing fields via ContinueSignUpScreen

### Customize Styling

All screens use React Native StyleSheet. Modify styles in each screen file:

```javascript
const styles = StyleSheet.create({
  googleButton: {
    backgroundColor: '#4285F4',  // Change colors here
    // ... other styles
  },
});
```

## 🧪 Testing

### Test on Expo Go (Development)

```bash
npm start
# Scan QR code with Expo Go app
```

**Note:** OAuth may have limitations in Expo Go. For full testing, use a development build.

### Test with Development Build

```bash
# Create development build
npx expo prebuild

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

### Test OAuth Flow

1. Click "Sign in with Google"
2. Verify redirect to Google
3. Authenticate with test Google account
4. Verify redirect back to app
5. Verify user session is created
6. Verify user data appears on Home screen
7. Test sign out functionality

## 🚢 Production Deployment

### 1. Set Up Custom Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-clerk-app.clerk.accounts.dev/v1/oauth_callback`
6. Copy Client ID and Client Secret to Clerk Dashboard

### 2. Update Environment Variables

Create production `.env` file with production Clerk key:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key_here
```

### 3. Build Production App

```bash
# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

### 4. Configure App Stores

- Update bundle identifiers in app.json
- Create app listings in App Store and Google Play
- Submit builds for review

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Already added to .gitignore
2. **Use production keys in production** - Separate dev/prod keys
3. **Enable bot protection** - Clerk's captcha is enabled by default
4. **Review OAuth scopes** - Only request necessary permissions
5. **Keep dependencies updated** - Regularly update Clerk SDK
6. **Enable OTA updates** - Install expo-updates for security patches

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Expo SDK Reference](https://clerk.com/docs/references/expo/overview)
- [OAuth Connections Guide](https://clerk.com/docs/guides/development/custom-flows/authentication/oauth-connections)
- [Expo Authentication Guide](https://docs.expo.dev/guides/authentication/)
- [React Navigation Docs](https://reactnavigation.org/)

## 🐛 Troubleshooting

### "Invalid publishable key" error
- Check that your `.env` file exists and has the correct key
- Verify the key starts with `pk_test_` or `pk_live_`
- Restart the Metro bundler after changing `.env`

### OAuth redirect not working
- Verify URL scheme in `app.json` matches redirect URL
- Check that redirect URL is added in Clerk Dashboard
- Test with development build (not Expo Go) for full OAuth support

### "Missing requirements" screen appears unexpectedly
- Check Clerk Dashboard user settings
- Verify which fields are required
- Update ContinueSignUpScreen to handle your specific fields

### Session not persisting after app restart
- Verify expo-secure-store is installed
- Check that tokenCache is passed to ClerkProvider
- Clear app data and test again

## 📞 Support

For issues with:
- **Clerk**: Visit [Clerk Support](https://clerk.com/support)
- **Expo**: Check [Expo Forums](https://forums.expo.dev/)
- **This Implementation**: Review the code comments and this documentation

---

**Last Updated:** October 2025
**Version:** 1.0.0
