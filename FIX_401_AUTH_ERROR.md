# Fixed: 401 Unauthorized Error on /api/auth/me

## ✅ Issue Resolved

Fixed the console error: `GET http://localhost:5000/api/auth/me 401 (Unauthorized)`

## 🔍 Root Cause

**Race Condition**: The React Query hook `useMe()` was attempting to fetch the user profile **before Clerk authentication had fully initialized**, resulting in API requests being sent without the required JWT token.

### The Problem Flow:

1. **App loads** → `useAuth()` hook initializes
2. **`useMe()` query starts immediately** → Tries to fetch `/api/auth/me`
3. **Clerk still loading** → `window.Clerk.session` is `null`
4. **No token added** → Request sent without `Authorization` header
5. **Backend returns 401** → "No token provided"

## 🛠️ The Fix

### Changed Files:

#### 1. **`client/src/api/hooks/useAuth.js`**

**Before:**
```javascript
export function useMe() {
  return useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn: () => get(API_ENDPOINTS.ME),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    // ❌ No 'enabled' condition - runs immediately!
  });
}
```

**After:**
```javascript
export function useMe(isSignedIn = false, isClerkLoaded = false) {
  return useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn: () => get(API_ENDPOINTS.ME),
    enabled: isSignedIn && isClerkLoaded, // ✅ Only fetch when ready
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
```

#### 2. **`client/src/hooks/useAuth.js`**

**Before:**
```javascript
export function useAuth() {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const { getToken, signOut } = useClerkAuth();
  
  const { 
    data: backendUser, 
    isLoading: isUserLoading, 
    error: userError 
  } = useMe(); // ❌ No parameters passed
```

**After:**
```javascript
export function useAuth() {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const { getToken, signOut } = useClerkAuth();
  
  // Fetch backend user profile (only when Clerk is loaded and user is signed in)
  const { 
    data: backendUser, 
    isLoading: isUserLoading, 
    error: userError 
  } = useMe(isSignedIn, isClerkLoaded); // ✅ Pass Clerk state
```

## 📋 What Changed

### Key Improvements:

1. **Conditional Query Execution**
   - Added `enabled: isSignedIn && isClerkLoaded` to the React Query configuration
   - Query won't run until both conditions are true

2. **Parameter Passing**
   - `useMe()` now accepts `isSignedIn` and `isClerkLoaded` parameters
   - `useAuth()` passes these values from Clerk's `useUser()` hook

3. **Proper Initialization Sequence**
   ```
   Clerk Loads → User Signs In → Query Enabled → Token Available → Request Succeeds
   ```

## ✅ Benefits

1. **No More 401 Errors**
   - Requests only sent when authentication is ready
   - Token is always available when needed

2. **Better Performance**
   - Avoids unnecessary failed requests
   - No wasted API calls during initialization

3. **Cleaner Console**
   - No error logs during normal operation
   - Easier debugging of real issues

4. **Correct Loading States**
   - `isLoading` accurately reflects when user data is being fetched
   - UI can show proper loading indicators

## 🧪 Testing

### Before Fix:
```
Browser Console:
❌ GET http://localhost:5000/api/auth/me 401 (Unauthorized)
⚠️  apiClient.js:93
```

### After Fix:
```
Browser Console:
✅ No errors
✅ Clean initialization
```

## 📝 Technical Details

### React Query `enabled` Option

The `enabled` option in React Query controls whether a query should run:

```javascript
useQuery({
  queryKey: ['user'],
  queryFn: fetchUser,
  enabled: false, // Query is disabled
})
```

When `enabled` is `false`, the query:
- Won't execute automatically
- Can still be triggered manually
- Will pause until `enabled` becomes `true`

### Clerk Authentication States

```javascript
const { isLoaded, isSignedIn, user } = useUser();

// isLoaded: false → Clerk SDK initializing
// isLoaded: true, isSignedIn: false → Not authenticated
// isLoaded: true, isSignedIn: true → Fully authenticated
```

## 🎯 Impact

- **Zero Breaking Changes** - All existing functionality works as before
- **Performance Improvement** - Fewer failed API requests
- **Better UX** - No console errors visible to developers
- **Maintainability** - Clear separation of concerns

## 🔄 Flow Diagram

```
┌─────────────────┐
│  App Starts     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Clerk Loads     │
└────────┬────────┘
         │
         v
┌─────────────────┐     NO
│ isClerkLoaded? ─┼─────> Wait...
└────────┬────────┘
         │ YES
         v
┌─────────────────┐     NO
│ isSignedIn?    ─┼─────> Don't fetch
└────────┬────────┘
         │ YES
         v
┌─────────────────┐
│ Enable Query    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Get Token       │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Fetch /me       │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Success ✅      │
└─────────────────┘
```

## 💡 Best Practice

This fix follows React Query best practices:
- **Dependent Queries** - Wait for prerequisites before fetching
- **Conditional Fetching** - Use `enabled` for auth-dependent queries
- **Error Prevention** - Avoid predictable failure scenarios

---

**Status:** ✅ Fixed and Tested
**Files Modified:** 2
**Breaking Changes:** None
**Side Effects:** None
