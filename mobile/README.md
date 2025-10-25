# Ocura360 Mobile Apps

This is a monorepo containing both the Clinic and Patient mobile applications for Ocura360.

## 📁 Structure

```
mobile/
├── apps/
│   ├── clinic/          # Ocura360 - Clinic Staff App
│   └── patient/         # Ocura360-Patient - Patient App
├── packages/
│   ├── shared/          # Shared utilities, API clients, stores
│   └── ui/              # Shared UI components
└── package.json         # Root workspace configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)

### Installation

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Setup environment variables:
```bash
# Copy example env files
cp apps/clinic/.env.example apps/clinic/.env
cp apps/patient/.env.example apps/patient/.env
```

3. Update the `.env` files with your actual values (Clerk keys, API URLs, etc.)

## 🏃 Running the Apps

### Clinic App (Ocura360)
```bash
npm run clinic:start          # Start Metro bundler
npm run clinic:android        # Run on Android
npm run clinic:ios            # Run on iOS (macOS only)
```

### Patient App (Ocura360-Patient)
```bash
npm run patient:start         # Start Metro bundler
npm run patient:android       # Run on Android
npm run patient:ios           # Run on iOS (macOS only)
```

## 📱 Development

### Using Expo Go (Development)
1. Install Expo Go on your device
2. Run `npm run clinic:start` or `npm run patient:start`
3. Scan the QR code with Expo Go

### Using Development Build (Recommended)
```bash
# Build development client
eas build --profile development --platform android

# Install on device, then run
npm run clinic:start
```

## 🏗️ Building for Production

### Android
```bash
# Clinic App
cd apps/clinic
eas build --platform android --profile production

# Patient App
cd apps/patient
eas build --platform android --profile production
```

### iOS (requires macOS)
```bash
eas build --platform ios --profile production
```

## 📦 Project Structure Details

### `/apps/clinic` - Clinic Staff App
For doctors, clinic owners, and staff members.

**Features:**
- Dashboard with appointments overview
- Patient management (CRUD)
- Appointment scheduling
- Prescription creation with DDI checking
- Analytics and reports
- Multi-clinic support

### `/apps/patient` - Patient App
For patients to manage their health records.

**Features:**
- View appointments and prescriptions
- Search and book appointments at clinics
- Link patient codes
- Manage family member profiles
- Download prescriptions

### `/packages/shared`
Shared business logic, API clients, and utilities.

**Contents:**
- `api/` - Axios client, API hooks
- `stores/` - Zustand state management
- `config/` - Constants, environment config
- `utils/` - Helper functions
- `types/` - Shared type definitions (JSDoc)

### `/packages/ui`
Reusable UI components matching web design.

**Contents:**
- Base components (Button, Input, Card, etc.)
- Form components
- Layout components
- Mobile-specific components (BottomSheet, etc.)

## 🔧 Configuration Files

- `eas.json` - EAS Build configuration
- `app.json` - Expo app configuration
- `.env` - Environment variables (not committed)
- `babel.config.js` - Babel configuration
- `metro.config.js` - Metro bundler configuration

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Code Style

- ESLint for linting
- Prettier for formatting
- Run `npm run lint` to check
- Run `npm run format` to auto-fix

## 🔐 Environment Variables

Required environment variables for both apps:

```env
# API Configuration
API_BASE_URL=http://localhost:5000/api
API_TIMEOUT=30000

# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx

# Optional
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

## 📚 Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Clerk Expo Documentation](https://clerk.com/docs/reference/expo/overview)
- [NativeWind Documentation](https://www.nativewind.dev/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` and `npm run format`
4. Test on both Android and iOS (if possible)
5. Submit a pull request

## 📄 License

Proprietary - All rights reserved
