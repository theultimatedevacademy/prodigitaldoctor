# API Client Documentation

## Overview
The API client provides a configured Axios instance with automatic token handling, error management, retry logic, and network connectivity checks.

## Features

### ✅ Automatic Token Management
- Automatically attaches Clerk JWT token from SecureStore to all requests
- Token is retrieved on every request to ensure freshness
- Invalid tokens are automatically cleared on 401 errors

### ✅ Network Connectivity Checks
- Checks network status before making requests
- Returns user-friendly error message if offline
- Uses `@react-native-community/netinfo` for reliable detection

### ✅ Error Handling
- **401 Unauthorized**: Clears token, prompts re-authentication
- **403 Forbidden**: Returns permission denied message
- **404 Not Found**: Returns resource not found message
- **500 Server Error**: Returns generic server error message
- **Network Errors**: Returns no internet connection message

### ✅ Retry Logic
- Automatically retries failed requests (5xx errors only)
- Maximum 3 retry attempts
- Exponential backoff delay (1s, 2s, 4s, max 10s)
- Does not retry 4xx client errors

### ✅ Request/Response Logging
- Logs all requests and responses in development mode
- Redacts sensitive data (tokens)
- Helps with debugging API issues

## Usage

### Basic Usage

```javascript
import { get, post, put, patch, del } from '../api/apiClient';

// GET request
const data = await get('/appointments');

// POST request
const newAppointment = await post('/appointments', {
  clinic: 'clinic-id',
  doctor: 'doctor-id',
  patient: 'patient-id',
  startAt: '2024-01-01T10:00:00Z',
});

// PATCH request
const updated = await patch('/appointments/123/vitals', {
  bloodPressureSystolic: 120,
  bloodPressureDiastolic: 80,
});

// DELETE request
await del('/appointments/123');
```

### With Query Parameters

```javascript
import { get } from '../api/apiClient';

const appointments = await get('/appointments', {
  params: {
    clinicId: 'clinic-123',
    date: '2024-01-01',
    status: 'scheduled',
  },
});
```

### Error Handling

```javascript
import { post } from '../api/apiClient';

try {
  const prescription = await post('/prescriptions', prescriptionData);
  console.log('Success:', prescription);
} catch (error) {
  if (error.isNetworkError) {
    // No internet connection
    alert('Please check your internet connection');
  } else if (error.requiresAuth) {
    // 401 - Token expired
    // Navigate to login screen
  } else if (error.permissionDenied) {
    // 403 - No permission
    alert(error.message);
  } else {
    // Other errors
    alert(error.message || 'An error occurred');
  }
}
```

### File Upload

```javascript
import { upload } from '../api/apiClient';

const formData = new FormData();
formData.append('file', {
  uri: fileUri,
  type: 'image/jpeg',
  name: 'photo.jpg',
});

const result = await upload('/uploads/presign', formData, (progressEvent) => {
  const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  console.log('Upload progress:', percentCompleted);
});
```

### Using with React Query

```javascript
import { useQuery, useMutation } from '@tanstack/react-query';
import { get, post } from '../api/apiClient';

// Query
export function useAppointments(filters) {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => get('/appointments', { params: filters }),
  });
}

// Mutation
export function useCreateAppointment() {
  return useMutation({
    mutationFn: (data) => post('/appointments', data),
  });
}
```

## Configuration

### Environment Variables

Add to your `.env` file:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

For production:

```env
EXPO_PUBLIC_API_BASE_URL=https://api.yourapp.com/api
```

### Token Management

The API client uses `utils/authStorage.js` for token management:

```javascript
import { saveAuthToken, getAuthToken, removeAuthToken } from '../utils/authStorage';

// Save token after Clerk authentication
await saveAuthToken(clerkToken);

// Token is automatically attached to requests
// No need to manually add it

// Remove token on logout
await removeAuthToken();
```

## Network Status Monitoring

Use the `useNetworkStatus` hook to monitor connectivity:

```javascript
import { useNetworkStatus } from '../hooks/useNetworkStatus';

function MyComponent() {
  const { isConnected, isInternetReachable, type } = useNetworkStatus();

  if (!isConnected) {
    return <OfflineBanner />;
  }

  return <YourContent />;
}
```

## Error Response Format

All errors are normalized to this format:

```javascript
{
  message: 'User-friendly error message',
  status: 401, // HTTP status code
  data: { ... }, // Original error data from backend
  isNetworkError: true, // If network error
  requiresAuth: true, // If 401 error
  permissionDenied: true, // If 403 error
  isServerError: true, // If 500 error
  originalError: { ... }, // Original axios error
}
```

## Best Practices

1. **Always handle errors**: Wrap API calls in try-catch blocks
2. **Show user-friendly messages**: Use error.message for user feedback
3. **Check network status**: Use `useNetworkStatus` hook for offline UI
4. **Use React Query**: Leverage caching and automatic refetching
5. **Log errors**: Use console.error for debugging in development
6. **Test offline scenarios**: Ensure app works gracefully without internet

## Troubleshooting

### Token not being attached
- Ensure token is saved using `saveAuthToken()`
- Check SecureStore permissions
- Verify Clerk authentication is complete

### Requests failing with network error
- Check device internet connection
- Verify API_BASE_URL is correct
- Ensure backend server is running
- Check firewall/proxy settings

### 401 errors
- Token may be expired - re-authenticate with Clerk
- Token may be invalid - clear and re-login
- Backend may not recognize token format

### Retry not working
- Retries only work for 5xx errors
- 4xx errors are not retried (client errors)
- Max 3 retries with exponential backoff
