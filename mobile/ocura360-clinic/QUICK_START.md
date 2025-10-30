# 🚀 Quick Start Guide - Clerk Auth Setup

## Step 1: Get Your Clerk Publishable Key

1. Go to https://dashboard.clerk.com
2. Sign in or create an account
3. Create a new application (or select existing)
4. Copy your **Publishable Key** from the dashboard

## Step 2: Configure Environment

1. Open `.env` file in the project root
2. Replace the placeholder:
   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   ```

## Step 3: Enable Google OAuth in Clerk

1. In Clerk Dashboard, go to **Configure → SSO Connections**
2. Click on **Google**
3. Toggle **Enable for sign-up and sign-in**
4. For development, use Clerk's shared credentials
5. Click **Save**

## Step 4: Add Redirect URL in Clerk

1. In Clerk Dashboard, go to **Paths**
2. Under **Redirect URLs**, add: `ocura360clinic://`
3. Click **Save**

## Step 5: Run the App

```bash
# Start the development server
npm start

# Then press:
# - 'i' for iOS simulator
# - 'a' for Android emulator
# - Scan QR code for physical device
```

## Step 6: Test Authentication

1. App will show the Sign In screen
2. Tap **"Sign in with Google"**
3. Choose a Google account
4. Authenticate
5. You'll be redirected back to the app
6. Home screen will show your user information

## ✅ You're Done!

Your app now has:
- ✅ Google OAuth authentication
- ✅ Secure token storage
- ✅ Session management
- ✅ Protected routes
- ✅ User profile display

## 🔧 Next Steps (Optional)

### Add More OAuth Providers

1. Enable provider in Clerk Dashboard
2. Add button in `screens/SignInScreen.js`:
   ```javascript
   <TouchableOpacity onPress={() => signInWith('oauth_github')}>
     <Text>Sign in with GitHub</Text>
   </TouchableOpacity>
   ```

### Customize Required Fields

1. In Clerk Dashboard → **User & Authentication**
2. Set fields as Required/Optional
3. Users will be prompted via Continue Sign-Up screen

### Test on Physical Device

For iOS:
```bash
npm run ios
```

For Android:
```bash
npm run android
```

## 🐛 Common Issues

**Issue:** "Invalid publishable key"  
**Solution:** Make sure `.env` file exists and has correct key. Restart Metro bundler.

**Issue:** OAuth redirect not working  
**Solution:** Use development build instead of Expo Go:
```bash
npx expo prebuild
npx expo run:ios  # or run:android
```

**Issue:** App shows loading screen forever  
**Solution:** Check your internet connection and verify Clerk key is correct.

## 📚 Full Documentation

For detailed information, see `CLERK_SETUP.md` in this directory.

## 🆘 Need Help?

- **Clerk Docs**: https://clerk.com/docs
- **Clerk Support**: https://clerk.com/support
- **Expo Docs**: https://docs.expo.dev

---

**Ready to build something awesome!** 🎉
