# 📁 File Structure Guide

## File Extension Conventions

This project follows standard React Native conventions:

- **`.jsx`** - Files containing JSX (React components)
- **`.js`** - Pure JavaScript files (utilities, helpers, no JSX)
- **`.json`** - Configuration files
- **`.md`** - Documentation files

## Project Structure

```
mobile/ocura360-clinic/
├── screens/                      # React component screens (JSX)
│   ├── SignInScreen.jsx         # ✅ Contains JSX
│   ├── HomeScreen.jsx           # ✅ Contains JSX
│   └── ContinueSignUpScreen.jsx # ✅ Contains JSX
│
├── navigation/                   # Navigation components (JSX)
│   └── AppNavigator.jsx         # ✅ Contains JSX
│
├── utils/                        # Utility functions (JS)
│   └── tokenCache.js            # ✅ Pure JavaScript, no JSX
│
├── hooks/                        # Custom React hooks (JS)
│   └── useWarmUpBrowser.js      # ✅ Pure JavaScript, no JSX
│
├── components/                   # Reusable components (existing)
│   ├── Container.tsx            # (Original TypeScript files)
│   ├── EditScreenInfo.tsx
│   └── ScreenContent.tsx
│
├── App.jsx                      # ✅ Root component with JSX
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
├── .env                         # Environment variables (not in git)
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
│
└── Documentation/
    ├── CLERK_SETUP.md           # Comprehensive setup guide
    ├── QUICK_START.md           # Quick reference
    └── FILE_STRUCTURE.md        # This file
```

## Why These Extensions?

### `.jsx` Files (React Components)
Files that contain JSX syntax should use `.jsx` extension:
- Makes it clear the file contains React components
- Better IDE support and syntax highlighting
- Follows React best practices

**Examples:**
- `App.jsx` - Root component
- `SignInScreen.jsx` - Screen component
- `AppNavigator.jsx` - Navigation component

### `.js` Files (Pure JavaScript)
Files with pure JavaScript (no JSX) use `.js` extension:
- Utility functions
- Helper functions
- Configuration
- Custom hooks (technically can be `.js` since they don't render JSX)

**Examples:**
- `tokenCache.js` - Token storage utility
- `useWarmUpBrowser.js` - Custom hook

## Import Statements

In JavaScript/React Native, you **don't need to specify file extensions** in imports:

```javascript
// ✅ Correct - No extension needed
import AppNavigator from './navigation/AppNavigator';
import SignInScreen from '../screens/SignInScreen';
import createTokenCache from './utils/tokenCache';

// ❌ Not necessary (but works)
import AppNavigator from './navigation/AppNavigator.jsx';
import createTokenCache from './utils/tokenCache.js';
```

The bundler (Metro) automatically resolves `.js`, `.jsx`, `.ts`, and `.tsx` extensions.

## Key Points

1. **All component files use `.jsx`** - This includes screens, navigation, and any file that returns JSX
2. **Utility files use `.js`** - Pure JavaScript with no JSX rendering
3. **No TypeScript** - All files are JavaScript (as requested)
4. **Imports work without extensions** - Metro bundler handles resolution

## Migration from TypeScript

Original TypeScript files in `components/` directory:
- `Container.tsx`
- `EditScreenInfo.tsx`
- `ScreenContent.tsx`

These can be converted to `.jsx` if needed, but they're not currently used in the auth flow.

---

**Summary:** Use `.jsx` for React components, `.js` for utilities. Simple! ✨
