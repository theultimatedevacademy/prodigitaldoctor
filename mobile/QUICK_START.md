# 🚀 Quick Start Guide

## Get Up and Running in 5 Minutes

### 1. Install Dependencies (2 min)

```bash
cd mobile
npm install
```

### 2. Setup Environment Variables (1 min)

**Clinic App:**
```bash
cd apps/clinic
cp .env.example .env
```

Edit `.env` and add your Clerk key:
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

**Patient App:**
```bash
cd apps/patient
cp .env.example .env
```

Add the same Clerk key.

### 3. Start the App (1 min)

**Option A: Using Expo Go (Easiest)**
```bash
cd mobile
npm run clinic:start
```

Scan the QR code with Expo Go app on your phone.

**Option B: Using Android Emulator**
```bash
npm run clinic:android
```

### 4. Test Authentication (1 min)

1. App should open to sign-in screen
2. Click "Sign Up" to create an account
3. Enter your details and verify email
4. You should see the dashboard!

## ✅ What's Working

- ✅ Authentication (Sign in/Sign up)
- ✅ Basic navigation (5 tabs)
- ✅ Dashboard with mock data
- ✅ Appointments list view
- ✅ Patients list view
- ✅ Prescriptions list view
- ✅ Profile with sign out

## 🔨 What to Build Next

1. **Connect to Real API**
   - Setup API client with your backend
   - Replace mock data with real API calls

2. **Implement CRUD Operations**
   - Create/Edit appointments
   - Add/Edit patients
   - Create prescriptions

3. **Add Mobile Features**
   - Camera for documents
   - Push notifications
   - Biometric auth
   - Offline support

## 📝 Commands Cheat Sheet

```bash
# Clinic App
npm run clinic:start      # Start dev server
npm run clinic:android    # Run on Android
npm run clinic:ios        # Run on iOS (Mac only)

# Patient App
npm run patient:start     # Start dev server
npm run patient:android   # Run on Android
npm run patient:ios       # Run on iOS (Mac only)

# Utilities
npm run lint              # Check code quality
npm run format            # Format code
```

## 🐛 Common Issues

**"Cannot find module"**
```bash
cd mobile
rm -rf node_modules
npm install
```

**"Metro bundler error"**
```bash
npx expo start --clear
```

**"Clerk key not found"**
- Make sure `.env` file exists in `apps/clinic/` and `apps/patient/`
- Key should start with `EXPO_PUBLIC_`

## 📚 Full Documentation

See `SETUP_INSTRUCTIONS.md` for detailed setup guide.

---

**Need help?** Check the troubleshooting section in SETUP_INSTRUCTIONS.md
