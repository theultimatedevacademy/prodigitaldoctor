# Role-Based Access Control (RBAC) System

## User Roles

The application supports the following roles:

### 1. **patient**
- Can view their own appointments
- Can view their own prescriptions
- Can link patient codes
- **Cannot** see clinic selector
- **Cannot** manage clinics

### 2. **doctor**
- Can create patients
- Can create prescriptions
- Can manage appointments
- Can search medications
- **Cannot** see clinic selector
- **Cannot** manage clinics (assigned to clinics by clinic owners)

### 3. **clinic_owner**
- Has all doctor capabilities
- **Can** see clinic selector in navigation bar
- **Can** create and manage clinics
- **Can** invite staff and doctors to their clinics
- **Can** view clinic analytics

### 4. **assistant**
- Can help with patient registration
- Can schedule appointments
- Cannot create prescriptions
- **Cannot** see clinic selector

### 5. **admin**
- Full system access
- Can manage all users and clinics

## Role Promotion Flow

### Doctor → Clinic Owner

When a **doctor** creates their first clinic:
1. They automatically get the `clinic_owner` role added
2. The clinic selector appears in the navigation bar
3. They can now manage clinics
4. They retain their doctor capabilities

**Backend Logic** (`clinicController.js`):
```javascript
// Auto-add clinic_owner role when they create their first clinic
if (!user.roles.includes('clinic_owner')) {
  user.roles.push('clinic_owner');
  logger.info({ userId: user._id }, 'User promoted to clinic_owner role');
}
```

## Navigation Bar

### For clinic_owner:
```
[Logo] [Dashboard] [Clinics] [Patients] [Appointments] [Prescriptions] [Medications]    [ClinicSelector] [UserButton]
```

### For doctor:
```
[Logo] [Dashboard] [Patients] [Appointments] [Prescriptions] [Medications]    [UserButton]
```

### For patient:
```
[Logo] [Dashboard] [My Appointments] [My Prescriptions] [Profile]    [UserButton]
```

## Clinic Selector Visibility

The **ClinicSelector** component is ONLY visible when:
- User has `clinic_owner` role
- User is authenticated

**Code** (`MainLayout.jsx`):
```javascript
const canManageClinics = isClinicOwner();

// In header
{canManageClinics && <ClinicSelector />}
```

## Permissions Matrix

| Feature | Patient | Doctor | Clinic Owner | Assistant | Admin |
|---------|---------|--------|--------------|-----------|-------|
| View own appointments | ✅ | ✅ | ✅ | ✅ | ✅ |
| View own prescriptions | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create patients | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create prescriptions | ❌ | ✅ | ✅ | ❌ | ✅ |
| Create appointments | ❌ | ✅ | ✅ | ✅ | ✅ |
| **See Clinic Selector** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Create Clinics** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Manage Clinics** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Invite Staff** | ❌ | ❌ | ✅ | ❌ | ✅ |

## How to Test

### Test Clinic Selector Visibility

1. **Sign in as a new doctor** (only has `doctor` role)
   - ✅ You should NOT see the clinic selector
   - ✅ You should NOT see "Clinics" in navigation

2. **Create your first clinic**
   - Click "Create New Clinic" from dashboard
   - Fill in clinic details
   - Submit

3. **After clinic creation**
   - ✅ Your role automatically updates to include `clinic_owner`
   - ✅ The clinic selector appears in the navigation bar
   - ✅ "Clinics" menu item appears in sidebar
   - ✅ You can now switch between clinics

### Verify in Browser Console

After page load, check the debug logs:
```javascript
MainLayout Debug: {
  user: { ... },
  roles: ['doctor', 'clinic_owner'],  // Should include clinic_owner after creating clinic
  isDoctor: true,
  isClinicOwner: true,  // Should be true after creating clinic
  canManageClinics: true  // Should be true after creating clinic
}
```

## Troubleshooting

### Clinic selector not showing after creating clinic?

**Check:**
1. Open browser console and look for "MainLayout Debug" log
2. Verify `roles` array includes `'clinic_owner'`
3. Verify `isClinicOwner` is `true`
4. Verify `canManageClinics` is `true`

**If roles don't include clinic_owner:**
- Refresh the page (the user data should invalidate and refetch)
- Check backend logs to confirm role was added
- Verify the clinic was created successfully

### Still not working?

**Backend check:**
```bash
# Check MongoDB to verify user has clinic_owner role
# Use MongoDB Compass or CLI to inspect user document
```

**Frontend check:**
```javascript
// In browser console
localStorage.getItem('selectedClinicId')  // Should show clinic ID after creation
```

## Implementation Files

- **Role checking**: `client/src/hooks/useAuth.js`
- **Layout with selector**: `client/src/layouts/MainLayout.jsx`
- **Clinic selector**: `client/src/features/clinics/ClinicSelector.jsx`
- **Backend role promotion**: `server/controllers/clinicController.js`
- **User model**: `server/models/user.js`
