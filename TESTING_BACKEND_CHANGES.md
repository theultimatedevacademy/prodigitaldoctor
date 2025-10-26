# Testing Backend Changes - Quick Guide

## What's Been Implemented

✅ **Backend Complete:**
- User model with subscription system
- Clinic-specific roles (no more global roles)
- Subscription management (free trial, upgrade, cancel)
- Role-based permission checks
- Updated invitation system
- Appointment/prescription filtering by role

---

## Test Scenarios

### 1. Test New User Signup & Free Plan

**API Call:**
```bash
# After Clerk authentication, get user profile
GET /api/auth/me
```

**Expected Response:**
```json
{
  "_id": "...",
  "clerkId": "user_xxx",
  "email": "test@example.com",
  "subscription": {
    "plan": "free",
    "status": "active",
    "maxClinics": 0
  },
  "clinics": [],
  "canCreateClinic": false
}
```

---

### 2. Test Start Free Trial

**API Call:**
```bash
POST /api/subscription/start-trial
Authorization: Bearer {clerk_token}
```

**Expected Response:**
```json
{
  "message": "Trial started successfully",
  "subscription": {
    "plan": "basic",
    "status": "trial",
    "maxClinics": 1,
    "trialEndsAt": "2025-11-20T..."
  },
  "canCreateClinic": true
}
```

---

### 3. Test Create Clinic (With Trial)

**API Call:**
```bash
POST /api/clinics
Authorization: Bearer {clerk_token}
Content-Type: application/json

{
  "name": "Test Clinic",
  "address": {
    "line1": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pin": "400001"
  },
  "contact": {
    "phone": "+919876543210",
    "email": "clinic@example.com"
  }
}
```

**Expected Response:**
```json
{
  "_id": "clinic_id",
  "name": "Test Clinic",
  "owner": { ... },
  ...
}
```

---

### 4. Test Create Clinic Without Subscription

**Setup:** User with `maxClinics: 0` or expired trial

**API Call:**
```bash
POST /api/clinics
```

**Expected Response (403):**
```json
{
  "error": "Subscription limit reached",
  "message": "You have reached the maximum number of clinics for your plan. Please upgrade to create more clinics.",
  "currentPlan": "free",
  "maxClinics": 0,
  "ownedClinics": 0
}
```

---

### 5. Test Get User's Clinics With Roles

**API Call:**
```bash
GET /api/auth/my-clinics
Authorization: Bearer {clerk_token}
```

**Expected Response:**
```json
{
  "clinics": [
    {
      "_id": "clinic_id_1",
      "name": "My Clinic",
      "userRole": "clinic_owner",
      "owner": { ... }
    },
    {
      "_id": "clinic_id_2",
      "name": "Another Clinic",
      "userRole": "doctor",
      "staff": [ ... ]
    }
  ],
  "total": 2
}
```

---

### 6. Test Staff Invitation (Must Exist)

**API Call:**
```bash
POST /api/clinics/{clinicId}/invite
Authorization: Bearer {owner_clerk_token}
Content-Type: application/json

{
  "email": "doctor@example.com",
  "role": "doctor"
}
```

**Expected Response (Success):**
```json
{
  "message": "Invitation sent successfully",
  "invitedUser": {
    "_id": "user_id",
    "name": "Dr. Smith",
    "email": "doctor@example.com",
    "role": "doctor",
    "status": "pending"
  }
}
```

**Expected Response (User Not Found - 404):**
```json
{
  "error": "User not found on platform",
  "message": "Please ask the user to create an account first at your signup page.",
  "suggestedAction": "Share signup link with the user"
}
```

---

### 7. Test Get Pending Invitations

**API Call:**
```bash
GET /api/auth/invitations/pending
Authorization: Bearer {invited_user_token}
```

**Expected Response:**
```json
{
  "invitations": [
    {
      "_id": "clinic_id",
      "clinic": {
        "_id": "clinic_id",
        "name": "Test Clinic",
        "address": { ... },
        "owner": { ... }
      },
      "role": "doctor",
      "invitedAt": "2025-10-21T..."
    }
  ],
  "total": 1
}
```

---

### 8. Test Accept Invitation

**API Call:**
```bash
POST /api/clinics/{clinicId}/accept-invite
Authorization: Bearer {invited_user_token}
```

**Expected Response:**
```json
{
  "message": "Invitation accepted successfully",
  "clinic": {
    "_id": "clinic_id",
    "name": "Test Clinic",
    ...
  }
}
```

---

### 9. Test Role-Based Appointment Filtering

**Scenario A: Doctor views appointments**

```bash
GET /api/appointments?clinic={clinicId}
Authorization: Bearer {doctor_token}
```

**Expected:** Only appointments where `doctor === doctor_id`

**Scenario B: Clinic owner views appointments**

```bash
GET /api/appointments?clinic={clinicId}
Authorization: Bearer {owner_token}
```

**Expected:** All appointments in the clinic

**Scenario C: Staff views appointments**

```bash
GET /api/appointments?clinic={clinicId}
Authorization: Bearer {staff_token}
```

**Expected:** All appointments in the clinic

---

### 10. Test Create Prescription (Role Check)

**Scenario A: Doctor creates prescription (✅ Allowed)**

```bash
POST /api/prescriptions
Authorization: Bearer {doctor_token}
Content-Type: application/json

{
  "clinic": "clinic_id",
  "patient": "patient_id",
  "meds": [...],
  ...
}
```

**Expected:** Success (201)

**Scenario B: Staff tries to create prescription (❌ Denied)**

```bash
POST /api/prescriptions
Authorization: Bearer {staff_token}
```

**Expected Response (403):**
```json
{
  "error": "Permission denied",
  "message": "Only doctors and clinic owners can create prescriptions. Staff members do not have this permission."
}
```

---

### 11. Test Prescription Filtering by Role

**Scenario A: Doctor views prescriptions**

```bash
GET /api/clinics/{clinicId}/prescriptions
Authorization: Bearer {doctor_token}
```

**Expected:** Only prescriptions where `doctor === doctor_id`

**Scenario B: Staff views prescriptions**

```bash
GET /api/clinics/{clinicId}/prescriptions
Authorization: Bearer {staff_token}
```

**Expected:** All prescriptions in the clinic (read-only access)

---

### 12. Test Subscription Plans

**API Call:**
```bash
GET /api/subscription/plans
```

**Expected Response:**
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "maxClinics": 0,
      "features": [...]
    },
    {
      "id": "basic",
      "name": "Basic",
      "price": 999,
      "maxClinics": 1,
      "popular": true,
      "features": [...]
    },
    ...
  ]
}
```

---

## Testing Workflow

### Complete Flow Test

1. **New User Signup**
   - Sign up via Clerk
   - Call `GET /api/auth/me`
   - Verify `maxClinics: 0`, `clinics: []`

2. **Start Trial**
   - Call `POST /api/subscription/start-trial`
   - Verify `maxClinics: 1`, `status: 'trial'`

3. **Create Clinic**
   - Call `POST /api/clinics`
   - Verify clinic created
   - Call `GET /api/auth/my-clinics`
   - Verify `userRole: 'clinic_owner'`

4. **Invite Staff**
   - Create second user account
   - As owner, call `POST /api/clinics/{clinicId}/invite`
   - Verify invitation created

5. **Accept Invitation**
   - As invited user, call `GET /api/auth/invitations/pending`
   - Call `POST /api/clinics/{clinicId}/accept-invite`
   - Call `GET /api/auth/my-clinics`
   - Verify `userRole: 'doctor'` or `'staff'`

6. **Test Role Permissions**
   - As doctor, try viewing appointments (should see only own)
   - As staff, try creating prescription (should fail)
   - As owner, try viewing all appointments (should succeed)

---

## Database Inspection

### Check User Subscription

```javascript
db.users.findOne({ email: "test@example.com" }, {
  email: 1,
  subscription: 1,
  clinics: 1
})
```

### Check Clinic Ownership

```javascript
db.clinics.findOne({ name: "Test Clinic" }, {
  name: 1,
  owner: 1,
  staff: 1
})
```

### Check Staff Invitations

```javascript
db.clinics.find({ 
  "staff.accepted": false 
}).pretty()
```

---

## Common Issues & Solutions

### Issue: "User not found on platform" when inviting

**Solution:** Invited user must create an account first via Clerk signup

### Issue: "Subscription limit reached"

**Solution:** Start free trial or upgrade subscription

### Issue: Doctor sees all appointments

**Solution:** Ensure clinic ID is passed in query parameter

### Issue: Role not determined correctly

**Solution:** Check `clinic.owner` and `clinic.staff[]` in database

---

## Next Steps

Once backend testing is complete:

1. ✅ Backend fully tested and working
2. ⏳ Implement frontend changes (Phase 7-8)
3. ⏳ Create migration script for existing data
4. ⏳ Update documentation
5. ⏳ Deploy to production

---

## Support

For issues:
- Check server logs for detailed error messages
- Verify Clerk authentication tokens are valid
- Ensure MongoDB connection is active
- Check role assignments in database
