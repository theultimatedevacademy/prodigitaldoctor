# Ocura360 Mobile Apps - Setup Instructions

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **Git**
   - Download from: https://git-scm.com/
   - Verify: `git --version`

4. **Android Studio** (for Android development)
   - Download from: https://developer.android.com/studio
   - Install Android SDK and create an emulator

5. **Expo CLI** (optional, but recommended)
   ```bash
   npm install -g expo-cli
   ```

6. **EAS CLI** (for building)
   ```bash
   npm install -g eas-cli
   ```

## 🚀 Initial Setup

### Step 1: Install Dependencies

Navigate to the mobile directory and install all dependencies:

```bash
cd mobile
npm install
```

This will install dependencies for the root workspace and all sub-packages.

### Step 2: Setup Environment Variables

#### For Clinic App:
```bash
cd apps/clinic
cp .env.example .env
```

Edit `apps/clinic/.env` and add your values:
```env
API_BASE_URL=http://localhost:5000/api
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

#### For Patient App:
```bash
cd apps/patient
cp .env.example .env
```

Edit `apps/patient/.env` with the same values.

### Step 3: Configure EAS Projects

#### For Clinic App:
```bash
cd apps/clinic
eas init
```

Follow the prompts to create a new EAS project. Update `app.json` with the project ID.

#### For Patient App:
```bash
cd apps/patient
eas init
```

Follow the prompts and update `app.json`.

### Step 4: Setup Firebase (for Push Notifications)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Add Android app:
   - Package name for Clinic: `com.ocura360.clinic`
   - Package name for Patient: `com.ocura360.patient`
4. Download `google-services.json` for each app
5. Place them in:
   - `apps/clinic/google-services.json`
   - `apps/patient/google-services.json`

## 🏃 Running the Apps

### Option 1: Using Expo Go (Quick Start)

1. Install Expo Go on your Android device from Play Store

2. Start the Clinic App:
   ```bash
   cd mobile
   npm run clinic:start
   ```

3. Scan the QR code with Expo Go app

4. For Patient App:
   ```bash
   npm run patient:start
   ```

**Note:** Some features like push notifications won't work in Expo Go. Use development builds for full functionality.

### Option 2: Using Android Emulator

1. Start Android Studio and launch an emulator

2. Run the Clinic App:
   ```bash
   cd mobile
   npm run clinic:android
   ```

3. For Patient App:
   ```bash
   npm run patient:android
   ```

### Option 3: Development Build (Recommended)

This gives you full native functionality:

1. Build development client for Clinic App:
   ```bash
   cd apps/clinic
   eas build --profile development --platform android
   ```

2. Install the APK on your device

3. Start the development server:
   ```bash
   cd mobile
   npm run clinic:start
   ```

4. Open the installed app on your device

## 🔧 Backend Configuration

### Running Backend Locally

Your mobile apps need to connect to your backend. Since the backend is currently local:

#### Option 1: Using ngrok (Recommended for testing on real devices)

1. Install ngrok: https://ngrok.com/download

2. Start your backend:
   ```bash
   cd server
   npm start
   ```

3. In a new terminal, create a tunnel:
   ```bash
   ngrok http 5000
   ```

4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

5. Update your mobile `.env` files:
   ```env
   API_BASE_URL=https://abc123.ngrok.io/api
   ```

6. Restart the mobile app

#### Option 2: Using Local Network (for emulator/same network devices)

1. Find your computer's local IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`

2. Update `.env`:
   ```env
   API_BASE_URL=http://192.168.x.x:5000/api
   ```

3. Ensure your backend allows CORS from your IP

## 📱 Building for Production

### Android APK (for testing)

```bash
cd apps/clinic
eas build --profile preview --platform android
```

### Android AAB (for Play Store)

```bash
cd apps/clinic
eas build --profile production --platform android
```

The build will be uploaded to EAS and you'll get a download link.

## 🐛 Troubleshooting

### Metro Bundler Issues

If you encounter caching issues:
```bash
npx expo start --clear
```

### Dependency Issues

Clear and reinstall:
```bash
cd mobile
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
npm install
```

### Android Build Failures

1. Check Java version (should be JDK 17)
2. Clear Gradle cache:
   ```bash
   cd apps/clinic/android
   ./gradlew clean
   ```

### Clerk Authentication Issues

1. Verify your publishable key is correct
2. Check that the key starts with `pk_test_` or `pk_live_`
3. Ensure the key is set in `.env` as `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`

## 📚 Next Steps

1. **Test Authentication**: Sign up and sign in to both apps
2. **Connect to Backend**: Ensure API calls are working
3. **Test on Real Device**: Install development build and test all features
4. **Setup Push Notifications**: Configure FCM and test notifications
5. **Implement Features**: Start building out the remaining features

## 🆘 Getting Help

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Documentation**: https://reactnative.dev/
- **Clerk Documentation**: https://clerk.com/docs/reference/expo/overview
- **EAS Documentation**: https://docs.expo.dev/eas/

## 📝 Important Notes

- Always test on real devices before production
- Keep your `.env` files secure and never commit them
- Update `app.json` version numbers before each release
- Test both apps thoroughly on different Android versions
- Monitor EAS build logs for any warnings or errors

---

**Ready to start?** Run `npm run clinic:start` from the mobile directory!
