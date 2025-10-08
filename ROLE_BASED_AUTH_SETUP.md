# Role-Based Authentication Setup Guide

This guide explains how to set up and use the role-based authentication system with Clerk.

## Overview

The system now supports role-based authentication where users can be:
- **Doctors** - Access to full clinical features
- **Patients** - Access to their own medical records
- **Staff/Assistants** - Clinic management features
- **Admins** - Full system access

## Setup Instructions

### 1. Install Required Dependencies

#### Server Dependencies
```bash
cd server
npm install @clerk/clerk-sdk-node cors
```

#### Client Dependencies
The client already has `@clerk/clerk-react` installed. If not:
```bash
cd client
npm install @clerk/clerk-react
```

### 2. Environment Variables

#### Server (.env)
Create or update `server/.env`:
```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Clerk
CLERK_SECRET_KEY=your_clerk_secret_key

# Server
PORT=5000
CLIENT_URL=http://localhost:5173
```

#### Client (.env)
Create or update `client/.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Get Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Navigate to **API Keys**
4. Copy:
   - **Publishable Key** → `VITE_CLERK_PUBLISHABLE_KEY` (client)
   - **Secret Key** → `CLERK_SECRET_KEY` (server)

### 4. Configure User Roles in Clerk

#### Option A: Using Clerk Dashboard (Manual)
1. Go to Clerk Dashboard → Users
2. Select a user
3. Click on **Metadata** tab
4. Add to **Public Metadata**:
```json
{
  "roles": ["doctor"]
}
```
or
```json
{
  "roles": ["patient"]
}
```

#### Option B: Using Clerk Webhooks (Automated)
Set up a webhook to automatically assign roles on user signup:

1. Go to Clerk Dashboard → Webhooks
2. Create endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to `user.created` event
4. In your webhook handler, assign default role based on signup method

### 5. Start the Application

#### Terminal 1 - Start Server
```bash
cd server
npm run dev
```

#### Terminal 2 - Start Client
```bash
cd client
npm run dev
```

## How It Works

### Authentication Flow

1. **User Signs In/Up** → Clerk handles authentication
2. **Token Generated** → Clerk issues JWT token
3. **API Request** → Client sends token in `Authorization` header
4. **Token Verification** → Server verifies token with Clerk
5. **User Profile** → Server fetches/creates user profile from MongoDB
6. **Role Check** → System routes user to appropriate dashboard

### File Structure

```
client/src/
├── components/
│   ├── RoleBasedDashboard.jsx  # Routes users based on role
│   └── ProtectedRoute.jsx       # Auth + role checking
├── pages/
│   ├── DoctorDashboard.jsx      # Doctor interface
│   └── PatientDashboard.jsx     # Patient interface
└── hooks/
    └── useAuth.js               # Auth state management

server/
├── controllers/
│   └── authController.js        # Auth logic
├── middlewares/
│   └── clerkAuth.js            # Clerk verification
└── routes/
    └── auth.js                 # Auth endpoints
```

### API Endpoints

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer {clerk_token}
```
Response:
```json
{
  "_id": "...",
  "clerkId": "user_xxx",
  "roles": ["doctor"],
  "name": "Dr. Smith",
  "email": "doctor@example.com",
  ...
}
```

#### Update User Role (Admin Only)
```
PATCH /api/auth/users/:userId/role
Authorization: Bearer {admin_clerk_token}
Content-Type: application/json

{
  "roles": ["doctor", "clinic_owner"]
}
```

## Usage Examples

### Protect Routes by Role

```javascript
// In main.jsx
<Route 
  path="/patients" 
  element={
    <ProtectedRoute requiredRole="doctor">
      <PatientsPage />
    </ProtectedRoute>
  } 
/>

// Multiple roles
<Route 
  path="/clinic-settings" 
  element={
    <ProtectedRoute requiredRole={["doctor", "clinic_owner"]}>
      <ClinicSettings />
    </ProtectedRoute>
  } 
/>
```

### Check User Role in Components

```javascript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, isDoctor, isPatient } = useAuth();
  
  return (
    <div>
      {isDoctor() && <DoctorOnlyFeature />}
      {isPatient() && <PatientOnlyFeature />}
    </div>
  );
}
```

### Backend Role Checking

```javascript
import { requireAuth, requireRole } from '../middlewares/clerkAuth.js';

// Doctor only endpoint
router.get('/patients', 
  requireAuth, 
  requireRole(['doctor']), 
  getPatients
);

// Admin only endpoint
router.delete('/users/:id', 
  requireAuth, 
  requireRole(['admin']), 
  deleteUser
);
```

## Testing the System

### Test as Doctor
1. Sign up/in with Clerk
2. Set role to `"doctor"` in Clerk Dashboard → User → Public Metadata
3. Refresh the page
4. Should see `DoctorDashboard` with clinic features

### Test as Patient
1. Sign up/in with different account
2. Set role to `"patient"` in Clerk Dashboard
3. Refresh the page
4. Should see `PatientDashboard`

### Test Role Protection
1. As a patient, try to access `/patients` (doctor-only route)
2. Should be redirected to `/dashboard`

## Troubleshooting

### Issue: "No token provided" error
- Check that `VITE_CLERK_PUBLISHABLE_KEY` is set in client `.env`
- Verify Clerk is initialized properly in `main.jsx`
- Check browser console for Clerk errors

### Issue: "Invalid token" error
- Verify `CLERK_SECRET_KEY` matches your Clerk application
- Check that keys are from the same Clerk application
- Try signing out and back in

### Issue: User stuck on "Role Not Assigned"
- Check user's public metadata in Clerk Dashboard
- Ensure `roles` array is set: `{"roles": ["doctor"]}`
- Verify spelling matches exactly: `"doctor"` or `"patient"`

### Issue: 401 Unauthorized on API calls
- Check that API client is sending token (inspect Network tab)
- Verify CORS is enabled on server
- Check `CLIENT_URL` in server `.env` matches client URL

### Issue: CORS errors
- Verify server has `cors` middleware configured
- Check `CLIENT_URL` environment variable
- Make sure server is running on correct port

## Default User Roles

The system will default to `"patient"` role if no role is specified. To change the default:

In `server/controllers/authController.js`, line 30:
```javascript
const roles = clerkUser.publicMetadata?.roles || ['patient']; // Change default here
```

## Security Notes

1. **Never expose Clerk Secret Key** in client-side code
2. **Always verify tokens** on the backend for protected operations
3. **Use HTTPS** in production
4. **Regularly rotate** Clerk API keys
5. **Audit role changes** - log all role modifications

## Next Steps

1. Set up Clerk webhooks for automatic role assignment
2. Create admin panel for role management
3. Add role-based UI elements throughout the app
4. Implement audit logging for sensitive operations
5. Add email notifications for role changes

## Support

For issues related to:
- **Clerk Authentication**: [Clerk Documentation](https://clerk.com/docs)
- **Role-Based Access**: Check this guide or create an issue
- **Backend API**: Review `server/controllers/authController.js`
