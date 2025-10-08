# Quick Start Guide - Refined Auth System

## 🚀 Start Your Application

```bash
# Make sure you've installed the dependencies
npm install

# Start both server and client
npm run dev
```

---

## ✅ Testing Checklist

### 1. Landing Page

Visit: `http://localhost:5173`

**Verify**:
- [ ] Single "Sign In / Sign Up" button in header
- [ ] "Pricing" link in header scrolls to pricing section
- [ ] "Get Started Free" button opens Clerk modal
- [ ] "View Demo" button scrolls to features
- [ ] Pricing section displays with 3 tiers
- [ ] Testimonials section shows 3 reviews
- [ ] All sections are properly styled

---

### 2. First-Time User Sign-Up

**Steps**:
1. Click "Sign In / Sign Up"
2. Create account (email/Google/etc.)
3. Complete Clerk authentication

**Expected Result**:
- [ ] Redirected to `/dashboard`
- [ ] Role selection modal appears
- [ ] 4 role options displayed with icons
- [ ] Modal cannot be closed without selecting role

**Select Each Role and Test**:

#### Test: Patient Role
- [ ] Select "I am a patient"
- [ ] Click "Continue"
- [ ] PatientDashboard loads
- [ ] Sign out and sign back in
- [ ] Still goes to PatientDashboard

#### Test: Doctor Role
- [ ] Create new account
- [ ] Select "I am a doctor and I work in a clinic"
- [ ] Click "Continue"
- [ ] DoctorDashboard loads
- [ ] Can see patient management features

#### Test: Clinic Owner Role
- [ ] Create new account
- [ ] Select "I am a doctor and I run my own clinic"
- [ ] Click "Continue"
- [ ] DoctorDashboard loads
- [ ] Sign out/in - still DoctorDashboard

#### Test: Assistant Role
- [ ] Create new account
- [ ] Select "I am a staff/assistant in a clinic"
- [ ] Click "Continue"
- [ ] DoctorDashboard loads

---

### 3. Returning User

**Steps**:
1. Sign out
2. Sign in with existing account

**Expected Result**:
- [ ] No role selection modal
- [ ] Direct route to appropriate dashboard
- [ ] Dashboard matches previously selected role

---

### 4. API Endpoints

#### Test GET /api/auth/me

```bash
# Get your Clerk token from browser DevTools > Application > Local Storage
# Look for a key like "clerk-token"

curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response**:
```json
{
  "_id": "...",
  "clerkId": "user_xxx",
  "roles": ["doctor"],  // or ["patient"], etc.
  "name": "John Doe",
  "email": "john@example.com",
  ...
}
```

#### Test POST /api/auth/my-role

```bash
curl -X POST http://localhost:5000/api/auth/my-role \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roles": ["doctor"]}'
```

**Expected**: Updated user object with new role

---

### 5. Error Scenarios

#### Test: Network Error During Role Selection
- [ ] Open DevTools > Network tab
- [ ] Set to "Offline"
- [ ] Try to select role
- [ ] Error toast appears
- [ ] Modal stays open
- [ ] Go back online and retry
- [ ] Should work

#### Test: Invalid Role
Not applicable (UI restricts to valid options)

#### Test: Already Signed In
- [ ] Sign in as any user
- [ ] Try to visit `/` (homepage)
- [ ] Should redirect to `/dashboard`

---

### 6. Clerk Dashboard Verification

**Check Clerk Dashboard**:
1. Go to https://dashboard.clerk.com
2. Select your app
3. Go to Users
4. Select a user who completed role selection
5. Click "Metadata" tab
6. Verify `publicMetadata` has:
   ```json
   {
     "roles": ["doctor"]
   }
   ```

---

### 7. MongoDB Verification

**Check MongoDB**:
```javascript
// Connect to MongoDB and run:
db.users.find().pretty()

// Verify each user has:
{
  clerkId: "user_xxx",
  roles: ["doctor"],  // Should not be empty
  name: "...",
  email: "...",
  ...
}
```

---

## 🎨 Landing Page Elements

### Header
- [ ] Logo with icon
- [ ] App name
- [ ] Pricing link (smooth scroll)
- [ ] Sign In / Sign Up button

### Hero
- [ ] Compelling headline
- [ ] Value proposition
- [ ] "Get Started Free" CTA
- [ ] "View Demo" button
- [ ] Trust indicators (HIPAA, ABDM, Secure)

### Features
- [ ] 6 feature cards
- [ ] Proper icons and colors
- [ ] Hover effects work

### Pricing
- [ ] 3 pricing tiers
- [ ] "Most Popular" badge on Professional
- [ ] All features listed
- [ ] Get Started buttons work

### Testimonials
- [ ] 3 testimonial cards
- [ ] 5-star ratings
- [ ] Doctor names and locations
- [ ] Quote styling

### Final CTA
- [ ] Gradient background
- [ ] Clear messaging
- [ ] Get Started button

### Footer
- [ ] Copyright info
- [ ] Security badges

---

## 🔧 Common Issues & Fixes

### Issue: Role Modal Not Appearing

**Check**:
```bash
# 1. Is user created in MongoDB?
db.users.findOne({ clerkId: "user_xxx" })

# 2. Check roles field
# If roles: [], modal should appear
# If roles: ["doctor"], modal should NOT appear
```

**Fix**: Ensure user.roles is empty array for new users

---

### Issue: Wrong Dashboard

**Check**: `RoleBasedDashboard.jsx` priority logic
```javascript
// Priority order:
1. doctor/clinic_owner → DoctorDashboard
2. assistant → DoctorDashboard  
3. patient → PatientDashboard
```

---

### Issue: Cannot Submit Role

**Check Browser Console**:
- Look for network errors
- Check API endpoint is `/api/auth/my-role`
- Verify token is being sent

**Server Logs**:
- Check for validation errors
- Verify MongoDB connection
- Check Clerk SDK errors

---

## 📊 Expected Behavior Summary

| User Type | First Login | Subsequent Login | Dashboard |
|-----------|-------------|------------------|-----------|
| New User | Role Modal | Direct | Based on role |
| Patient | Role Modal | Direct | PatientDashboard |
| Doctor | Role Modal | Direct | DoctorDashboard |
| Clinic Owner | Role Modal | Direct | DoctorDashboard |
| Assistant | Role Modal | Direct | DoctorDashboard |

---

## 🎯 Success Criteria

Your implementation is successful when:

1. ✅ Single sign-in button on landing page
2. ✅ New users see role selection modal
3. ✅ Role is saved to both MongoDB and Clerk
4. ✅ Users route to correct dashboard
5. ✅ Returning users don't see modal
6. ✅ Pricing section displays correctly
7. ✅ Testimonials section shows
8. ✅ All buttons and links work
9. ✅ Error handling works properly
10. ✅ Data persists across sign-out/in

---

## 🚨 Critical Files Modified

**Client**:
- ✅ `client/src/components/RoleSelectionModal.jsx` (NEW)
- ✅ `client/src/components/RoleBasedDashboard.jsx`
- ✅ `client/src/pages/LandingPage.jsx`
- ✅ `client/src/utils/constants.js`

**Server**:
- ✅ `server/models/user.js`
- ✅ `server/controllers/authController.js`
- ✅ `server/routes/auth.js`

---

## 📝 Next Steps After Testing

1. **Customize Pricing**
   - Update prices to match your business model
   - Adjust features per tier
   - Add payment integration

2. **Add Real Testimonials**
   - Replace sample testimonials
   - Add real doctor photos
   - Get permission for quotes

3. **Implement Demo**
   - Create demo video
   - Or add interactive tour
   - Link from "View Demo" button

4. **Role-Based Features**
   - Implement patient-specific features in PatientDashboard
   - Add clinic owner admin features
   - Restrict features based on role

5. **Analytics**
   - Track which roles users select
   - Monitor conversion rates
   - A/B test landing page elements

---

## 🆘 Get Help

**Check Documentation**:
- `REFINED_AUTH_WORKFLOW.md` - Complete workflow details
- `ROLE_BASED_AUTH_SETUP.md` - Original setup guide
- `INSTALLATION_STEPS.md` - Installation instructions

**Debug Steps**:
1. Check browser console for errors
2. Check server terminal for errors
3. Verify environment variables
4. Test API endpoints directly
5. Check MongoDB data
6. Check Clerk dashboard

**All systems should be operational** after following this guide. If issues persist, review the detailed documentation files.
