# Clinic Management Implementation Summary

## Overview
Complete overhaul of role-based access control (RBAC) system with clinic-scoped permissions, subscription management, and improved onboarding flow.

---

## Key Changes

### ✅ **Phase 1: Database Schema - COMPLETED**

#### 1.1 User Model Updates (`server/models/user.js`)

**REMOVED:**
- `roles: [String]` - Global roles array deleted

**ADDED:**
- `subscription: SubscriptionSchema` - Subscription management
  - `plan`: 'free' | 'basic' | 'pro' | 'enterprise'
  - `status`: 'active' | 'trial' | 'expired' | 'cancelled'
  - `maxClinics`: Number (0, 1, 3, or 999)
  - `trialEndsAt`: Date
  - `stripeCustomerId`: String
  - `stripeSubscriptionId`: String

**NEW METHODS:**
- `getRoleInClinic(clinicId)` - Returns user's role in specific clinic
- `getOwnedClinics()` - Returns clinics where user is owner
- `getStaffClinics()` - Returns clinics where user is accepted staff
- `getAllClinics()` - Returns all accessible clinics with roles
- `canCreateClinic()` - Checks subscription limits
- `hasAccessToClinic(clinicId)` - Verifies clinic access

#### 1.2 Clinic Model Updates (`server/models/clinic.js`)

**CHANGED:**
- Staff role enum: `['doctor', 'staff']` (removed 'assistant', 'receptionist')

---

### ✅ **Phase 2: RBAC System - COMPLETED**

#### 2.1 RBAC Helpers (`server/utils/rbacHelpers.js`) - NEW FILE

Centralized permission checking functions:
- `getUserClinicRole(userId, clinicId)` - Get role in clinic
- `hasClinicAccess(userId, clinicId)` - Check access
- `isClinicOwner(userId, clinicId)` - Owner check
- `canManageStaff(userId, clinicId)` - Staff management permission
- `canCreatePrescription(userId, clinicId)` - Prescription creation permission
- `canViewAllAppointments(userId, clinicId)` - View all appointments
- `canViewAllPatients(userId, clinicId)` - View all patients
- `canViewAllPrescriptions(userId, clinicId)` - View all prescriptions
- `canAccessMedications(userId, clinicId)` - Medication DB access
- `getDoctorPatients(doctorId, clinicId)` - Get patients doctor has seen
- `doctorHasAccessToPatient(doctorId, patientId, clinicId)` - Patient access check

#### 2.2 RBAC Middleware Updates (`server/middlewares/rbac.js`)

**UPDATED:**
- `requireClinicAccess()` - Now attaches `req.userClinicRole`
- `requireClinicOwner()` - Simplified with role check

**NEW:**
- `requireClinicRole(roles)` - Require specific clinic roles

---

### ✅ **Phase 3: Authentication Updates - COMPLETED**

#### 3.1 Auth Controller (`server/controllers/authController.js`)

**UPDATED:**
- `getMe()` - Now returns user with clinics and their roles, subscription info

**NEW:**
- `getMyClinics()` - Get all clinics with roles
- `getPendingInvitations()` - Get pending clinic invitations

**REMOVED:**
- `updateUserRole()` - No longer needed (roles are clinic-specific)
- `updateMyRole()` - No longer needed

#### 3.2 Auth Routes (`server/routes/auth.js`)

**NEW ROUTES:**
- `GET /api/auth/my-clinics` - Get user's clinics with roles
- `GET /api/auth/invitations/pending` - Get pending invitations

**REMOVED:**
- `POST /api/auth/my-role` - No longer needed
- `PATCH /api/auth/users/:userId/role` - No longer needed

---

### ✅ **Phase 4: Subscription System - COMPLETED**

#### 4.1 Subscription Controller (`server/controllers/subscriptionController.js`) - NEW FILE

**ENDPOINTS:**
- `getSubscriptionInfo()` - Get user's subscription details
- `startFreeTrial()` - Start 30-day trial (1 clinic)
- `upgradeSubscription()` - Upgrade to paid plan
- `cancelSubscription()` - Cancel subscription
- `getPlans()` - Get available plans

**PLANS:**
- **Free**: 0 clinics, join existing clinics only
- **Basic**: 1 clinic, ₹999/month, 30-day trial
- **Pro**: 3 clinics, ₹2,499/month
- **Enterprise**: Unlimited clinics, custom pricing

#### 4.2 Subscription Routes (`server/routes/subscription.js`) - NEW FILE

**NEW ROUTES:**
- `GET /api/subscription/plans` - Public, get plans
- `GET /api/subscription/info` - Get subscription info
- `POST /api/subscription/start-trial` - Start trial
- `POST /api/subscription/upgrade` - Upgrade plan
- `POST /api/subscription/cancel` - Cancel subscription

---

### ✅ **Phase 5: Clinic Management Updates - COMPLETED**

#### 5.1 Clinic Controller (`server/controllers/clinicController.js`)

**UPDATED:**
- `createClinic()` - Now checks subscription limits
- `getClinics()` - Returns clinics with user's role in each
- `inviteStaff()` - Only accepts existing users, validates roles ('doctor' or 'staff')

**BEHAVIOR CHANGES:**
- User must exist on platform before invitation
- Cannot invite clinic owner as staff
- Only 'doctor' or 'staff' roles allowed

---

### ✅ **Phase 6: Appointment Controller Updates - COMPLETED**

#### 6.1 Appointment Controller (`server/controllers/appointmentController.js`)

**UPDATED:**
- `getAppointments()` - Now filters based on user role:
  - **Doctors**: See only their own appointments
  - **Clinic Owner/Staff**: See all clinic appointments

---

## Role & Permission Matrix (FINAL)

| Feature | Clinic Owner | Doctor | Staff |
|---------|-------------|--------|-------|
| **Clinic Management** |
| Create clinic | ✅ (with subscription) | ❌ | ❌ |
| Edit clinic settings | ✅ | ❌ | ❌ |
| Manage staff/invite | ✅ | ❌ | ❌ |
| View clinic analytics | ✅ | ❌ | ❌ |
| **Patient Management** |
| Create patients | ✅ (via appointment) | ✅ (via appointment) | ✅ (via appointment) |
| View patients | ✅ (all) | ✅ (only seen) | ✅ (all) |
| Edit patients | ✅ (all) | ✅ (only seen) | ✅ (all) |
| **Appointments** |
| View appointments | ✅ (all) | ✅ (only their own) | ✅ (all) |
| Create appointments | ✅ | ✅ | ✅ |
| Edit/cancel appointments | ✅ | ✅ (own only) | ✅ |
| Assign/reassign doctor | ✅ | ❌ | ✅ |
| **Prescriptions** |
| Create prescriptions | ✅ | ✅ (own patients) | ❌ |
| View prescriptions | ✅ (all) | ✅ (own only) | ✅ (all) |
| Print prescriptions | ✅ | ✅ | ✅ |
| Edit prescriptions | ✅ | ✅ (own only) | ❌ |
| **Medications** |
| Search medication DB | ✅ | ✅ | ❌ |

---

## Data Flow

### 1. New User Signup
```
User signs up via Clerk
    ↓
User created with free plan (maxClinics: 0)
    ↓
User sees empty dashboard
    ↓
Options:
    - Start free trial → Create clinic
    - Wait for invitation → Accept invite
```

### 2. Creating First Clinic
```
User clicks "Start Trial"
    ↓
Trial activated (30 days, maxClinics: 1)
    ↓
User creates clinic
    ↓
User becomes clinic owner
    ↓
User can now invite staff
```

### 3. Invitation Flow
```
Owner invites staff by email
    ↓
System checks if user exists
    ↓
If exists: Add to clinic.staff[] (accepted: false)
    ↓
User sees notification/pending invitation
    ↓
User accepts invitation
    ↓
accepted: true, user added to clinic
```

### 4. Role Determination
```
When accessing clinic features:
    ↓
Check: Is user owner? → clinic_owner
    ↓
Check: Is user in staff[]? → doctor/staff
    ↓
Apply role-based filters
```

---

## API Changes Summary

### New Endpoints
- `GET /api/auth/my-clinics`
- `GET /api/auth/invitations/pending`
- `GET /api/subscription/plans`
- `GET /api/subscription/info`
- `POST /api/subscription/start-trial`
- `POST /api/subscription/upgrade`
- `POST /api/subscription/cancel`

### Removed Endpoints
- `POST /api/auth/my-role`
- `PATCH /api/auth/users/:userId/role`

### Modified Endpoints
- `GET /api/auth/me` - Now includes clinics with roles and subscription
- `GET /api/clinics` - Returns clinics with user's role
- `POST /api/clinics/:clinicId/invite` - Only accepts existing users
- `GET /api/appointments` - Filtered by user role

---

## Testing Checklist

### Backend Testing
- [ ] User model methods work correctly
- [ ] Subscription limits enforced
- [ ] Role-based appointment filtering
- [ ] Staff invitation requires existing user
- [ ] Clinic creation requires subscription
- [ ] Trial activation works
- [ ] Pending invitations API works

### Integration Testing
- [ ] New user signup flow
- [ ] Trial activation and clinic creation
- [ ] Staff invitation and acceptance
- [ ] Multi-clinic user scenarios
- [ ] Doctor sees only their appointments
- [ ] Staff sees all appointments
- [ ] Owner can manage everything

---

## Migration Required

### For Existing Users
```javascript
// Run migration script to:
1. Convert User.roles[] to subscription model
2. Set default subscription based on clinic ownership
3. Ensure clinic.staff[] has correct roles
```

---

## Next Steps (Frontend)

### Phase 7: Frontend Updates (Not Yet Implemented)
1. **Remove old components:**
   - Delete `RoleSelectionModal.jsx`
   - Update `RoleBasedDashboard.jsx`

2. **Create new components:**
   - `PendingUserDashboard.jsx` - Empty state for new users
   - `InvitationNotificationBell.jsx` - Show pending invitations
   - `StartTrialPage.jsx` - Trial activation flow
   - `UpgradePlanPage.jsx` - Plan upgrade UI

3. **Update existing components:**
   - `ClinicSelector` - Show role badges
   - `MainLayout` - Role-based navigation
   - `useAuth` hook - Clinic-specific role methods

4. **Add clinic filtering:**
   - All appointment queries
   - All prescription queries
   - All patient queries

---

## Notes

- Patient role removed (will be built separately later)
- Payment integration (Stripe/Razorpay) marked as TODO
- Email service for invitations exists but may need updates
- Clinic owner is automatically a doctor (superset relationship)
- Roles are now **per-clinic**, not global

---

## Files Changed

### Backend (Completed)
- ✅ `server/models/user.js`
- ✅ `server/models/clinic.js`
- ✅ `server/utils/rbacHelpers.js` (NEW)
- ✅ `server/middlewares/rbac.js`
- ✅ `server/controllers/authController.js`
- ✅ `server/controllers/clinicController.js`
- ✅ `server/controllers/appointmentController.js` (partial)
- ✅ `server/controllers/subscriptionController.js` (NEW)
- ✅ `server/routes/auth.js`
- ✅ `server/routes/subscription.js` (NEW)
- ✅ `server/index.js`

### Frontend (Not Started)
- ⏳ All frontend changes pending

---

## Environment Variables

No new environment variables required. Existing Clerk and Stripe keys will be used.

---

## Deployment Notes

1. Run database migration before deploying
2. Test subscription limits thoroughly
3. Verify role-based filters work correctly
4. Ensure backward compatibility for existing users
5. Update API documentation
