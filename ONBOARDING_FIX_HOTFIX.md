# Onboarding Fix - Hotfix for Import Error

## Issue
After implementing the onboarding flow fix, got this error:
```
PendingUserDashboard.jsx:11 Uncaught SyntaxError: The requested module '/src/api/hooks/useSubscription.js' does not provide an export named 'useSubscription'
```

## Root Cause
Used incorrect import name `useSubscription` instead of the actual export name `useSubscriptionInfo`.

The file `client/src/api/hooks/useSubscription.js` exports:
- ✅ `useSubscriptionInfo()` - Get subscription info
- ✅ `useSubscriptionPlans()` - Get available plans
- ✅ `useStartTrial()` - Start trial
- ✅ `useUpgradeSubscription()` - Upgrade subscription
- ✅ `useCancelSubscription()` - Cancel subscription
- ❌ `useSubscription()` - Does NOT exist

## Fix Applied

Changed imports in 3 files from `useSubscription` to `useSubscriptionInfo`:

### 1. PendingUserDashboard.jsx
```javascript
// Before
import { useSubscription } from "../api/hooks/useSubscription";
const { data: subscriptionData } = useSubscription();

// After
import { useSubscriptionInfo } from "../api/hooks/useSubscription";
const { data: subscriptionData } = useSubscriptionInfo();
```

### 2. StartTrialPage.jsx
```javascript
// Before
import { useStartTrial, useSubscription } from "../api/hooks/useSubscription";
const { data: subscriptionData, isLoading } = useSubscription();

// After
import { useStartTrial, useSubscriptionInfo } from "../api/hooks/useSubscription";
const { data: subscriptionData, isLoading } = useSubscriptionInfo();
```

### 3. NewClinicPage.jsx
```javascript
// Before
import { useSubscription } from '../api/hooks/useSubscription';
const { data: subscriptionData } = useSubscription();

// After
import { useSubscriptionInfo } from '../api/hooks/useSubscription';
const { data: subscriptionData } = useSubscriptionInfo();
```

## Status
✅ **Fixed** - All imports now use correct export name `useSubscriptionInfo`

## Testing
After this fix, verify:
- [ ] No import errors in browser console
- [ ] PendingUserDashboard loads correctly
- [ ] StartTrialPage loads correctly
- [ ] NewClinicPage loads correctly
- [ ] Trial activation flow works end-to-end
