# Backend Integration TODO - Mobile App

## Overview
This document outlines the complete implementation plan for integrating the mobile app with the backend API. The mobile app must match 100% of web app functionality with full RBAC, DDI checking, PDF generation, and offline caching.

---

## PHASE 1: API CLIENT & INFRASTRUCTURE

### 1.1 API Client Setup ✅ COMPLETED
- [x] Create `api/apiClient.js` - Axios instance with base URL, interceptors, token handling
- [x] Add request interceptor to attach Clerk JWT token from SecureStore
- [x] Add response interceptor for error handling (401, 403, 500, network errors)
- [x] Implement retry logic for failed requests (3 retries with exponential backoff)
- [x] Add request/response logging for debugging
- [x] Handle network connectivity checks before API calls
- [x] Install dependencies: `axios`, `@react-native-community/netinfo`
- [x] Create `utils/authStorage.js` - Helper functions for token management
- [x] Create `hooks/useNetworkStatus.js` - Network connectivity monitoring hook
- [x] Update `.env.example` with API_BASE_URL configuration

### 1.2 Constants & Configuration ✅ COMPLETED
- [x] Create `utils/constants.js` - API endpoints, query keys, enums (copy from web app)
- [x] Add `API_BASE_URL` from environment variable (EXPO_PUBLIC_API_BASE_URL)
- [x] Define all API endpoints matching backend routes
- [x] Add appointment status constants (scheduled, in-progress, completed, cancelled)
- [x] Add DDI severity levels (minor, moderate, major, contraindicated)
- [x] Add medication frequencies (OD, BID, TID, QID, PRN, STAT)
- [x] Add dosage/duration units
- [x] Add gender options (M, F, O, U)
- [x] Add file upload constraints (max 10MB, allowed types)
- [x] Add user roles constants (patient, doctor, staff, clinic_owner, admin)
- [x] Add visit types (first-visit, follow-up)
- [x] Add query keys for React Query caching
- [x] Add cache and stale times configuration
- [x] Add notification types and priorities
- [x] Add error and success messages
- [x] Add validation rules (phone, email, name)
- [x] Add date/time formats
- [x] Add subscription plans and status
- [x] Add feature flags for gradual rollout
- [x] Add app configuration (name, version, support info)

### 1.3 React Query Setup ✅ COMPLETED
- [x] Install `@tanstack/react-query` and `@tanstack/react-query-persist-client`
- [x] Create `providers/QueryProvider.jsx` - QueryClient with default options
- [x] Configure stale time (2 minutes for most queries, 5 minutes for medications)
- [x] Configure cache time (10 minutes)
- [x] Configure retry logic (3 retries for failed queries)
- [x] Set up offline persistence using AsyncStorage
- [x] Add QueryClientProvider to App.jsx
- [x] Configure refetch on window focus (disabled for mobile)
- [x] Configure refetch on reconnect (enabled)
- [x] Configure exponential backoff for retry delays
- [x] Set up network status monitoring with NetInfo
- [x] Configure cache persistence with 30-minute max age
- [x] Add dehydration options (only persist successful queries)
- [x] Wrap app with PersistQueryClientProvider

---

## PHASE 2: AUTHENTICATION & USER MANAGEMENT

### 2.1 Auth API Hooks ✅ COMPLETED
- [x] Create `api/hooks/useAuth.js`
- [x] `useMe()` - GET /auth/me - Fetch current user profile
- [x] `useUpdateMyRole()` - PATCH /auth/my-role - Update user role/profile
- [x] Handle Clerk token refresh automatically
- [x] Store user data in React Query cache
- [x] `useTokenRefresh()` - Force token refresh from Clerk
- [x] `useSignOut()` - Sign out and clear all cached data
- [x] `useAuthStatus()` - Combined auth status (Clerk + backend)
- [x] `useHasRole(role)` - Check if user has specific role
- [x] `useSyncClerkUser()` - Sync Clerk user with backend
- [x] Automatic token saving to SecureStore on sign-in
- [x] Automatic token removal on sign-out
- [x] Error handling for 401 (token expired)
- [x] Query invalidation on profile updates

### 2.2 User Context Enhancement ✅ COMPLETED
- [x] Update `contexts/ClinicContext.jsx` to fetch real clinic data
- [x] Replace mock clinics with API call to GET /clinics
- [x] Fetch user's owned clinics and staff clinics
- [x] Store selected clinic in AsyncStorage
- [x] Implement `switchClinic()` with API validation
- [x] Add `refreshClinics()` to reload clinic list
- [x] Handle clinic role changes (owner, doctor, staff)
- [x] Create `api/hooks/useClinics.js` with all clinic operations
- [x] Add `useClinics()` - Fetch all user's clinics
- [x] Add `useClinic(id)` - Fetch single clinic
- [x] Add `useCreateClinic()` - Create new clinic
- [x] Add `useUpdateClinic()` - Update clinic
- [x] Add `useDeleteClinic()` - Delete clinic
- [x] Add `useInviteStaff()` - Invite staff to clinic
- [x] Add `useAcceptInvitation()` - Accept invitation
- [x] Add `useRejectInvitation()` - Reject invitation
- [x] Add `useRemoveStaff()` - Remove staff from clinic
- [x] Add `usePendingInvitations()` - Get pending invitations
- [x] Integrate with `useAuthStatus()` for authentication check
- [x] Auto-select first clinic if no stored selection
- [x] Restore clinic selection from AsyncStorage
- [x] Add clinic validation before switching
- [x] Add console logging for debugging

---

## PHASE 3: CLINIC MANAGEMENT

### 3.1 Clinic API Hooks ✅ COMPLETED (Done in Phase 2.2)
- [x] Create `api/hooks/useClinics.js`
- [x] `useClinics()` - GET /clinics - Fetch user's clinics
- [x] `useClinic(clinicId)` - GET /clinics/:id - Fetch single clinic
- [x] `useCreateClinic()` - POST /clinics - Create new clinic
- [x] `useUpdateClinic()` - PATCH /clinics/:id - Update clinic details
- [x] `useDeleteClinic()` - DELETE /clinics/:id - Delete clinic
- [x] Handle subscription limits (maxClinics check)

### 3.2 Clinic Screens Updates ✅ COMPLETED
- [x] Update `ClinicsListScreen.jsx` - Replace mock data with `useClinics()`
- [x] Update `ClinicDetailScreen.jsx` - Use `useClinic(clinicId)`
- [x] Update `NewClinicScreen.jsx` - Use `useCreateClinic()` mutation
- [x] Update `ClinicSettingsScreen.jsx` - Use `useUpdateClinic()` mutation
- [x] Add loading states, error handling, pull-to-refresh
- [x] Add empty states when no clinics exist
- [x] Show subscription limits and upgrade prompts
- [x] Add ActivityIndicator for loading states
- [x] Add error states with retry functionality
- [x] Add RefreshControl for pull-to-refresh
- [x] Add subscription limit validation in NewClinicScreen
- [x] Add delete clinic functionality with confirmation
- [x] Handle clinic data structure (address, contact objects)
- [x] Show user subscription info in ClinicDetailScreen
- [x] Add permission checks (only owners can edit/delete)

---

## PHASE 4: STAFF & INVITATION MANAGEMENT

### 4.1 Invitation API Hooks ✅ COMPLETED (Done in Phase 2.2)
- [x] Create `api/hooks/useInvitations.js` (hooks in useClinics.js)
- [x] `useInviteStaff()` - POST /clinics/:id/invite - Send staff/doctor invitation
- [x] `usePendingInvitations()` - GET /clinics/:id/invitations - Fetch pending invites
- [x] `useAcceptInvitation()` - POST /clinics/:id/accept-invite - Accept invitation
- [x] `useRejectInvitation()` - POST /clinics/:id/reject-invite - Reject invitation
- [x] `useRemoveStaff()` - DELETE /clinics/:id/staff/:userId - Remove staff member

### 4.2 Staff Management Screen ✅ COMPLETED
- [x] Update `StaffManagementScreen.jsx` - Replace mock data with API hooks
- [x] Show current staff list with roles (doctor, staff)
- [x] Add "Invite Staff" button (clinic owners only)
- [x] Invite staff modal with email, role selection, send invite
- [x] Show pending invitations with status and date
- [x] Add staff removal with confirmation dialog
- [x] Add loading states and error handling
- [x] Add pull-to-refresh functionality
- [x] Combine doctors and staff into unified list
- [x] Show pending invitations count in header
- [x] Display pending invitations card at top of list
- [x] Email validation before sending invite
- [x] Role-based badge colors (doctor=primary, staff=default)
- [x] Conditional phone display (only if available)
- [x] Permission check (only owners can access)

### 4.3 Invitation Notifications ✅ COMPLETED
- [x] Update `NotificationsScreen.jsx` to show pending invitations
- [x] Add "Accept" and "Reject" buttons for invitation notifications
- [x] Show invitation details (clinic name, role, invited by)
- [x] Refresh clinic list after accepting invitation
- [x] Create `InvitationCard.jsx` component
- [x] Fix API endpoint to `/auth/invitations/pending`
- [x] Add comprehensive error handling in invite flow
- [x] Add success confirmation with modal auto-close
- [x] Handle specific error cases (user not found, already invited, etc.)
- [x] Update Accept/Reject hooks to invalidate all relevant queries
- [x] Add loading states and pull-to-refresh
- [x] Display invitation count in header

---

## PHASE 5: PATIENT MANAGEMENT ✅ COMPLETED

### 5.1 Patient API Hooks ✅ 
- [x] Create `api/hooks/usePatients.js` 
- [x] `usePatients(filters)` - GET /patients - Fetch patients with filters (clinicId, search)
- [x] `usePatient(patientId)` - GET /patients/:id - Fetch single patient
- [x] `useCreatePatient()` - POST /patients - Create new patient
- [x] `useUpdatePatient()` - PATCH /patients/:id - Update patient
- [x] `useDeletePatient()` - DELETE /patients/:id - Delete patient
- [x] `useSearchPatientsForAppointment(query, clinicId)` - GET /appointments/search-patients
- [x] `usePatientHistory(patientId)` - GET /patients/:id/history - Get patient history

### 5.2 Patient Screens Updates ✅
- [x] Update `PatientsListScreen.jsx` - Use `usePatients({ clinicId })` 
- [x] Add search functionality with debounce (300ms)
- [x] Add filter by gender, age range (minAge, maxAge)
- [x] Add loading and error states
- [x] Add FloatingActionButton for creating new patients
- [x] Update `PatientDetailScreen.jsx` - Use `usePatient(patientId)` 
- [x] Show patient code for selected clinic
- [x] Show appointment history, prescription history
- [x] Add loading and error states
- [x] Update `NewPatientScreen.jsx` - Use `useCreatePatient()` mutation
- [x] Handle patient code generation (auto-generated by backend)
- [x] Add form validation (phone, email, required fields)
- [x] Add success/error handling with proper alerts

### 5.3 Additional Improvements ✅
- [x] Create `hooks/useDebounce.js` - Custom hook for debouncing search
- [x] Update `utils/constants.js` - Add QUERY_KEYS for patients with filters
- [x] Add PATIENT_HISTORY query key

---

## PHASE 6: APPOINTMENT MANAGEMENT (CRITICAL)

### 6.1 Appointment API Hooks ✅
- [x] Create `api/hooks/useAppointments.js`
- [x] `useAppointments(filters)` - GET /appointments - Fetch appointments (clinicId, doctorId, date, status)
- [x] `useAppointment(appointmentId)` - GET /appointments/:id - Fetch single appointment
- [x] `useCreateFirstVisitAppointment()` - POST /appointments/first-visit - Create with temp patient
- [x] `useCreateFollowUpAppointment()` - POST /appointments/follow-up - Create with existing patient
- [x] `useUpdateAppointment()` - PATCH /appointments/:id - Update appointment
- [x] `useCancelAppointment()` - POST /appointments/:id/cancel - Cancel appointment
- [x] `useCompleteAppointment()` - POST /appointments/:id/complete - Mark as completed
- [x] `useUpdateAppointmentVitals()` - PATCH /appointments/:id/vitals - Update vitals (auto in-progress)
- [x] `useUpdateClinicalNotes()` - PATCH /appointments/:id/clinical-notes - Update notes
- [x] `useUpdateAppointmentStatus()` - PATCH /appointments/:id/status - Manual status change
- [x] `useAssignDoctorToAppointment()` - PATCH /appointments/:id/assign-doctor - Assign doctor
- [x] `useCalendarView(doctorId, startDate, endDate)` - GET /appointments/calendar
- [x] `useSearchPatientsForAppointment(query, clinicId)` - GET /appointments/search-patients

### 6.2 Appointment List Screen ✅
- [x] Update `AppointmentsListScreen.jsx` - Use `useAppointments()`
- [x] Add date filter (custom date selection)
- [x] Add status filter (scheduled, in-progress, completed, cancelled)
- [x] Add doctor filter (for clinic owners/staff)
- [x] Implement role-based filtering (doctors see only their appointments)
- [x] Add pull-to-refresh
- [x] Show appointment cards with patient name, time, status badge
- [x] Add "New Appointment" FAB (floating action button)
- [x] Add loading and error states

### 6.3 Appointment Detail Screen ✅ COMPLETE
- [x] Update `AppointmentDetailScreen.jsx` - Use `useAppointment(appointmentId)`
- [x] Show patient info with navigation to PatientDetail
- [x] Show appointment time, doctor, clinic, status
- [x] Add "Edit Vitals" section (staff and doctors can edit)
- [x] Implement vitals form (BP, pulse, temp, SpO2, weight, height, BMI calc)
- [x] Use `useUpdateAppointmentVitals()` - Auto-changes status to "in-progress"
- [x] Add "Clinical Notes" section (doctors only)
- [x] Implement clinical notes form (chief complaint, diagnosis, notes)
- [x] Use `useUpdateClinicalNotes()`
- [x] Add "Create Prescription" button (doctors only, navigates to NewPrescription)
- [x] Show linked prescriptions with navigation
- [x] Add status change buttons (Cancel, Complete)
- [x] Handle role-based UI hiding (staff can't create prescriptions)
- [x] Add loading and error states
- [x] Implement vitals and clinical notes modals with BottomSheet

### 6.4 New Appointment Screen ✅ COMPLETE
- [x] Update `NewAppointmentScreen.jsx` - Use create hooks
- [x] Add visit type selection (First Visit, Follow-Up)
- [x] For First Visit: Show patient form (name, phone, age, gender)
- [x] For Follow-Up: Show patient search with `useSearchPatientsForAppointment()`
- [x] Patient search by code or phone (min 2 chars, debounced)
- [x] Show only patients with completed visits in this clinic
- [x] Add date/time picker
- [x] Add doctor selection dropdown (fetched from clinic staff)
- [x] Add notes field (optional)
- [x] Use `useCreateFirstVisitAppointment()` or `useCreateFollowUpAppointment()`
- [x] Handle smart patient matching (backend handles reuse/creation)
- [x] Show success message with patient code (for first visit)
- [x] Navigate to appointment detail after creation
- [x] Add form validation and error handling
- [x] Add loading states during submission

---

## PHASE 7: PRESCRIPTION MANAGEMENT (CRITICAL) ✅ COMPLETE

### 7.1 Prescription API Hooks ✅ COMPLETE
- [x] Create `api/hooks/usePrescriptions.js`
- [x] `usePrescriptions(filters)` - GET /prescriptions - Fetch prescriptions (clinicId, patientId)
- [x] `usePrescription(prescriptionId)` - GET /prescriptions/:id - Fetch single prescription
- [x] `useCreatePrescription()` - POST /prescriptions - Create prescription with DDI check
- [x] `useUpdatePrescription()` - PUT /prescriptions/:id - Update prescription
- [x] `useDeletePrescription()` - DELETE /prescriptions/:id - Delete prescription
- [x] `usePrescriptionPDFData(prescriptionId)` - GET /prescriptions/:id/pdf-data - Get PDF data
- [x] `useUpdatePrescriptionPDF()` - PATCH /prescriptions/:id/pdf - Update PDF URL after upload

### 7.2 Prescription List Screen ✅ COMPLETE
- [x] Update `PrescriptionsListScreen.jsx` - Use `usePrescriptions({ clinicId })`
- [x] Implement role-based filtering (doctors see only their prescriptions)
- [x] Add date range filter
- [x] Add patient search filter
- [x] Show prescription cards (date, patient, doctor, medication count)
- [x] Add "New Prescription" FAB (doctors and owners only)
- [x] Add pull-to-refresh
- [x] Navigate to PrescriptionDetail on card tap

### 7.3 Prescription Detail Screen ✅ COMPLETE
- [x] Update `PrescriptionDetailScreen.jsx` - Use `usePrescription(prescriptionId)` 
- [x] Show patient info, doctor info, clinic info, date
- [x] Show diagnosis list
- [x] Show medications table (name, composition, dosage, frequency, duration, notes)
- [x] Show DDI warnings with severity badges (minor, moderate, major, contraindicated)
- [x] Add "Generate PDF" button
- [x] Add "Edit" button (doctors and owners only)
- [x] Add "Delete" button (doctors and owners only)
- [x] Navigate to patient detail, appointment detail

### 7.4 New/Edit Prescription Screen ✅ COMPLETE
- [x] Update `NewPrescriptionScreen.jsx` - Use create/update hooks
- [x] Accept appointmentId as param (when creating from appointment)
- [x] Auto-populate patient, clinic, doctor from appointment
- [x] Add diagnosis input (array of diagnosis - ICD codes optional)
- [x] Add medication search and selection
- [x] Implement medication search with debounce (300ms)
- [x] Show medication dropdown with brand name, generic name, composition
- [x] Add selected medications list with dosage, frequency, duration inputs
- [x] Add "Remove" button for each medication
- [x] Implement DDI checking on medication selection
- [x] Show DDI warnings with severity, description, recommendation
- [x] For severe warnings (major, contraindicated), require override checkbox
- [x] Add notes field (optional)
- [x] Use `useCreatePrescription` with overrideDDI support
- [x] Handle validation (at least 1 medication required)
- [x] Show success message
- [x] Auto-complete appointment after prescription creation (backend handles)
- [x] Navigate to prescription detail after creation

---

## PHASE 8: MEDICATION DATABASE (CRITICAL) ✅ COMPLETE

### 8.1 Medication API Hooks ✅ COMPLETE
- [x] Create `api/hooks/useMedications.js` 
- [x] `useMedications(filters)` - GET /medications - Fetch medications (search, category)
- [x] `useMedication(medicationId)` - GET /medications/:id - Fetch single medication
- [x] `useSearchMedications(query)` - GET /medications/search - Search medications
- [x] `useCheckDDI(medicationIds)` - POST /medications/check-ddi - Check drug interactions

### 8.2 Medications List Screen ✅ COMPLETE
- [x] Update `MedicationsListScreen.jsx` - Use `useSearchMedications()` 
- [x] Add search bar with debounce (300ms)
- [x] Show medication cards (brand name, generic name, composition, form)
- [x] Make cards clickable to navigate to MedicationDetail
- [x] Add pull-to-refresh
- [x] Handle role-based access (doctors and owners only)
- [x] Add loading and error states
- [x] Show helpful empty states

### 8.3 Medication Detail Screen ✅ COMPLETE
- [x] Update `MedicationDetailScreen.jsx` - Use `useMedication(medicationId)` 
- [x] Show brand name, generic name
- [x] Show composition (unique_composition array)
- [x] Show chemical, therapeutic, and action classes
- [x] Show habit forming warning
- [x] Show manufacturer, form (tablet, capsule, etc.)
- [x] Show usage instructions
- [x] Show side effects
- [x] Show available substitutes

---

## PHASE 9: PDF GENERATION (CRITICAL)

### 9.1 PDF Library Setup
- [ ] Install `react-native-html-to-pdf` or `expo-print`
- [ ] Create `utils/pdfGenerator.js` - PDF generation utilities

### 9.2 Prescription PDF Generation
- [ ] Create `components/prescription/PrescriptionPDFTemplate.jsx` - HTML template
- [ ] Include clinic logo, name, address, contact
- [ ] Include doctor name, qualifications, specializations, HPR ID
- [ ] Include patient name, age, gender, phone, patient code
- [ ] Include prescription date, prescription ID
- [ ] Include diagnosis list
- [ ] Include medications table (name, composition, dosage, frequency, duration, notes)
- [ ] Include DDI warnings section (if any)
- [ ] Include doctor signature placeholder
- [ ] Add clinic footer with HFR ID
- [ ] Implement `generatePrescriptionPDF(prescriptionId)` function
- [ ] Fetch PDF data using `usePrescriptionPDFData(prescriptionId)`
- [ ] Generate PDF using expo-print or react-native-html-to-pdf
- [ ] Save PDF to device (use expo-file-system)
- [ ] Show share sheet (email, WhatsApp, print)

### 9.3 PDF Upload to S3
- [ ] Create `api/hooks/useUploads.js`
- [ ] `useGetPresignedUrl()` - POST /uploads/presign - Get S3 presigned URL
- [ ] Implement `uploadPDFToS3(pdfUri, prescriptionId)` function
- [ ] Get presigned URL from backend
- [ ] Upload PDF file to S3 using presigned URL
- [ ] Update prescription with PDF URL using `useUpdatePrescriptionPDF()`
- [ ] Show upload progress indicator
- [ ] Handle upload errors and retry

---

## PHASE 10: DOCUMENT UPLOAD & CAMERA

### 10.1 Document Upload Setup
- [ ] Install `expo-image-picker` and `expo-document-picker`
- [ ] Install `expo-file-system` for file operations
- [ ] Create `utils/fileUpload.js` - File upload utilities

### 10.2 Image/Document Capture
- [ ] Create `components/ui/DocumentPicker.jsx` - Reusable component
- [ ] Add "Take Photo" option (expo-image-picker camera)
- [ ] Add "Choose from Gallery" option (expo-image-picker library)
- [ ] Add "Choose Document" option (expo-document-picker)
- [ ] Implement file size validation (max 10MB)
- [ ] Implement file type validation (jpg, png, pdf)
- [ ] Show image preview before upload
- [ ] Compress images before upload (use expo-image-manipulator)

### 10.3 Patient Document Upload
- [ ] Add document upload to `NewPatientScreen.jsx` and `PatientDetailScreen.jsx`
- [ ] Allow uploading ID proof, medical records, prescriptions
- [ ] Store document URLs in patient.documents array
- [ ] Show document list with thumbnails
- [ ] Add delete document functionality

---

## PHASE 11: PUSH NOTIFICATIONS (REQUIRED)

### 11.1 Expo Notifications Setup
- [ ] Configure `expo-notifications` (already installed)
- [ ] Request notification permissions on app launch
- [ ] Get Expo push token and store in user profile
- [ ] Create `utils/notifications.js` - Notification utilities

### 11.2 Notification Handlers
- [ ] Implement `registerForPushNotifications()` function
- [ ] Store push token in backend (add to user model)
- [ ] Handle foreground notifications (show in-app alert)
- [ ] Handle background notifications (show system notification)
- [ ] Handle notification taps (navigate to relevant screen)

### 11.3 Notification Types
- [ ] Appointment reminders (1 hour before, 1 day before)
- [ ] Invitation notifications (staff/doctor invites)
- [ ] Prescription created notifications
- [ ] Appointment status changes
- [ ] Developer notifications (updates, promotions)

### 11.4 Notification Preferences
- [ ] Add notification settings screen
- [ ] Toggle for appointment reminders
- [ ] Toggle for invitation notifications
- [ ] Toggle for prescription notifications
- [ ] Toggle for promotional notifications
- [ ] Store preferences in AsyncStorage and backend

---

## PHASE 12: ROLE-BASED ACCESS CONTROL (RBAC)

### 12.1 Permission Utilities
- [ ] Update `utils/roleConfig.js` with all permissions
- [ ] Add `canRecordVitals(role)` - staff, doctor, owner
- [ ] Add `canCreatePrescription(role)` - doctor, owner (NOT staff)
- [ ] Add `canEditPrescription(role)` - doctor, owner
- [ ] Add `canViewAllAppointments(role)` - owner, staff (doctors see only theirs)
- [ ] Add `canManageStaff(role)` - owner only
- [ ] Add `canAccessMedications(role)` - doctor, owner (NOT staff)
- [ ] Add `canDeletePrescription(role)` - doctor, owner

### 12.2 UI Component Hiding
- [ ] Create `components/rbac/RoleGuard.jsx` - Conditional rendering based on role
- [ ] Wrap "Create Prescription" button in RoleGuard (doctors, owners)
- [ ] Wrap "Invite Staff" button in RoleGuard (owners)
- [ ] Wrap "Edit Prescription" button in RoleGuard (doctors, owners)
- [ ] Wrap "Access Medications" tab in RoleGuard (doctors, owners)
- [ ] Hide navigation items based on role (use `getFilteredNavItems()`)

### 12.3 API-Level Validation
- [ ] Backend already enforces RBAC (requireClinicAccess middleware)
- [ ] Handle 403 Forbidden errors gracefully
- [ ] Show permission denied alerts
- [ ] Log permission errors for debugging

---

## PHASE 13: OFFLINE SUPPORT & CACHING

### 13.1 React Query Persistence
- [ ] Configure AsyncStorage persister for React Query
- [ ] Persist query cache for offline viewing
- [ ] Set cache time to 24 hours for offline data
- [ ] Invalidate cache on app foreground (if online)

### 13.2 Network Detection
- [ ] Install `@react-native-community/netinfo`
- [ ] Create `hooks/useNetworkStatus.js` - Network status hook
- [ ] Show offline banner when network is unavailable
- [ ] Disable mutations when offline
- [ ] Queue mutations for retry when online (optional)

### 13.3 Optimistic Updates
- [ ] Implement optimistic updates for appointment status changes
- [ ] Implement optimistic updates for vitals recording
- [ ] Rollback on error
- [ ] Show loading states during mutations

---

## PHASE 14: DASHBOARD & ANALYTICS

### 14.1 Dashboard API Hooks
- [ ] Create `api/hooks/useAnalytics.js`
- [ ] `useDashboardStats(clinicId)` - GET /analytics/dashboard - Fetch stats
- [ ] `useAppointmentStats(clinicId, dateRange)` - GET /analytics/appointments
- [ ] `usePrescriptionStats(clinicId, dateRange)` - GET /analytics/prescriptions

### 14.2 Dashboard Screen
- [ ] Update `DashboardScreen.jsx` - Use analytics hooks
- [ ] Show today's appointments count
- [ ] Show total patients count
- [ ] Show today's prescriptions count
- [ ] Show monthly growth percentage
- [ ] Show upcoming appointments list (next 5)
- [ ] Show recent prescriptions list (last 5)
- [ ] Add quick actions (New Appointment, View Calendar)
- [ ] Add pull-to-refresh

---

## PHASE 15: SUBSCRIPTION MANAGEMENT

### 15.1 Subscription API Hooks
- [ ] Create `api/hooks/useSubscription.js`
- [ ] `useSubscription()` - GET /subscription - Fetch user subscription
- [ ] `useUpgradeSubscription()` - POST /subscription/upgrade - Upgrade plan
- [ ] `useCancelSubscription()` - POST /subscription/cancel - Cancel subscription

### 15.2 Subscription Screen
- [ ] Update `SubscriptionScreen.jsx` - Use subscription hooks
- [ ] Show current plan (free, basic, pro, enterprise)
- [ ] Show plan limits (maxClinics)
- [ ] Show trial status and expiry date
- [ ] Add upgrade buttons for each plan
- [ ] Show plan comparison table
- [ ] Handle Stripe payment integration (future)

---

## PHASE 16: ERROR HANDLING & VALIDATION

### 16.1 Error Handling Utilities
- [ ] Create `utils/errorHandler.js` - Centralized error handling
- [ ] Handle network errors (show retry button)
- [ ] Handle 401 Unauthorized (redirect to login)
- [ ] Handle 403 Forbidden (show permission denied)
- [ ] Handle 404 Not Found (show not found message)
- [ ] Handle 500 Server Error (show generic error)
- [ ] Handle validation errors (show field-specific errors)

### 16.2 Form Validation
- [ ] Create `utils/validation.js` - Validation utilities
- [ ] Add phone number validation (10 digits)
- [ ] Add email validation (regex)
- [ ] Add required field validation
- [ ] Add date validation (not in past for appointments)
- [ ] Add medication dosage validation (positive numbers)
- [ ] Show validation errors inline

### 16.3 Toast Notifications
- [ ] Install `react-native-toast-message` or use custom toast
- [ ] Create `components/ui/Toast.jsx` - Toast component
- [ ] Show success toasts (green) for successful operations
- [ ] Show error toasts (red) for failed operations
- [ ] Show info toasts (blue) for informational messages
- [ ] Auto-dismiss after 3-5 seconds

---

## PHASE 17: TESTING & QUALITY ASSURANCE

### 17.1 Manual Testing Checklist
- [ ] Test all CRUD operations (Create, Read, Update, Delete)
- [ ] Test role-based access (clinic owner, doctor, staff)
- [ ] Test appointment workflow (scheduled → in-progress → completed)
- [ ] Test prescription creation with DDI checking
- [ ] Test PDF generation and sharing
- [ ] Test offline mode (view cached data)
- [ ] Test network error handling
- [ ] Test form validation
- [ ] Test push notifications
- [ ] Test invitation flow (send, accept, reject)
- [ ] Test patient matching (first-visit, follow-up)
- [ ] Test document upload (photos, PDFs)

### 17.2 Edge Cases
- [ ] Test with no internet connection
- [ ] Test with slow network (3G)
- [ ] Test with expired Clerk token
- [ ] Test with invalid clinic selection
- [ ] Test with no clinics (new user)
- [ ] Test with pending invitations
- [ ] Test with subscription limits exceeded
- [ ] Test with large datasets (100+ appointments)

### 17.3 Performance Optimization
- [ ] Optimize list rendering (use FlatList with pagination)
- [ ] Implement infinite scroll for long lists
- [ ] Lazy load images
- [ ] Debounce search inputs (300ms)
- [ ] Minimize re-renders (use React.memo, useMemo, useCallback)
- [ ] Optimize bundle size (remove unused dependencies)

---

## PHASE 18: DEPLOYMENT & PRODUCTION

### 18.1 Environment Configuration
- [ ] Set up production API URL in .env
- [ ] Configure Clerk production keys
- [ ] Configure S3 bucket for production
- [ ] Configure push notification credentials (FCM, APNs)

### 18.2 Build & Release
- [ ] Build Android APK/AAB for Google Play
- [ ] Build iOS IPA for App Store
- [ ] Test on physical devices (Android, iOS)
- [ ] Submit to Google Play Store
- [ ] Submit to Apple App Store
- [ ] Set up app versioning and update mechanism

---

## PRIORITY ORDER

### P0 - Critical (MVP Must-Have)
1. API Client & React Query setup
2. Authentication & Clerk integration
3. Clinic selection & role management
4. Appointment management (full CRUD, vitals, clinical notes)
5. Prescription creation with DDI checking
6. Medication search
7. PDF generation and sharing
8. RBAC enforcement (UI hiding + API validation)

### P1 - High Priority (Required)
1. Patient management (CRUD)
2. Staff invitation system
3. Push notifications (appointments, invitations)
4. Document upload (camera, gallery)
5. Offline caching for viewing
6. Error handling & validation

### P2 - Medium Priority (Nice-to-Have)
1. Dashboard analytics
2. Subscription management
3. Notification preferences
4. Advanced search/filters
5. Performance optimizations

---

## NOTES & CONSIDERATIONS

### Backend Compatibility
- All API endpoints match the existing backend routes
- Use exact same request/response formats as web app
- Maintain compatibility with backend RBAC middleware
- Handle backend validation errors properly

### Smart Patient Matching
- Backend handles patient matching logic (findOrCreatePatient service)
- Mobile just sends patient data, backend decides reuse/create
- Show patient code after creation (for first-visit)
- Search only returns patients with completed visits

### DDI Checking Flow
1. User selects medications
2. Frontend calls POST /medications/check-ddi with medication IDs
3. Backend returns warnings array with severity
4. If severe (major/contraindicated), show override checkbox
5. Submit prescription with overrideDDI flag
6. Backend logs override in audit log

### Auto-Status Changes
- Vitals saved → Status changes to "in-progress" (backend automatic)
- Prescription created → Status changes to "completed" (backend automatic)
- Mobile just calls the endpoints, backend handles status transitions

### Role-Based Filtering
- Doctors: See only their own appointments/prescriptions (backend filters)
- Staff: See all clinic appointments/prescriptions (backend allows)
- Owners: See all clinic data (backend allows)
- Mobile doesn't need to filter, backend does it

### File Upload Flow
1. User selects/captures file
2. Frontend validates size/type
3. Call POST /uploads/presign to get S3 presigned URL
4. Upload file directly to S3 using presigned URL
5. Update entity (patient/prescription) with S3 URL
6. Backend stores S3 key for future access

---

## COMPLETION CRITERIA

- [ ] All API hooks implemented and tested
- [ ] All screens connected to real backend
- [ ] No mock data remaining
- [ ] RBAC fully enforced (UI + API)
- [ ] Appointment workflow fully functional
- [ ] Prescription creation with DDI checking works
- [ ] PDF generation and sharing works
- [ ] Push notifications working
- [ ] Invitation system working
- [ ] Offline caching implemented
- [ ] Error handling comprehensive
- [ ] Form validation complete
- [ ] App tested on Android and iOS
- [ ] Performance optimized
- [ ] Ready for production deployment

---

**Total Estimated Tasks: 250+**
**Estimated Timeline: 4-6 weeks (full-time development)**
