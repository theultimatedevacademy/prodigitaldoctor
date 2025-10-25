# Ocura360 Mobile - TODO List

## ✅ Completed

- [x] Project structure setup
- [x] Expo configuration for both apps
- [x] Authentication screens (Sign in/Sign up)
- [x] Tab navigation setup
- [x] Basic screens with mock UI
- [x] Clerk authentication integration
- [x] NativeWind (Tailwind) setup
- [x] Shared packages structure
- [x] API client foundation
- [x] Environment configuration

## 🚧 In Progress

- [ ] Connect API client to backend
- [ ] Implement real data fetching

## 📋 High Priority

### Backend Integration
- [ ] Setup API client with Clerk token injection
- [ ] Create React Query hooks for all endpoints
- [ ] Test all API endpoints from mobile
- [ ] Handle offline scenarios

### Core Features - Clinic App
- [ ] **Dashboard**
  - [ ] Fetch real appointments data
  - [ ] Fetch real stats
  - [ ] Implement quick actions
  
- [ ] **Appointments**
  - [ ] List appointments with filters
  - [ ] Create new appointment
  - [ ] Edit appointment
  - [ ] Cancel appointment
  - [ ] Calendar view integration
  - [ ] Conflict detection
  
- [ ] **Patients**
  - [ ] Search patients
  - [ ] View patient details
  - [ ] Add new patient
  - [ ] Edit patient
  - [ ] View patient history
  - [ ] Document upload
  
- [ ] **Prescriptions**
  - [ ] Create prescription flow
  - [ ] Medication search with autocomplete
  - [ ] DDI checking
  - [ ] Diagnosis entry
  - [ ] PDF generation
  - [ ] Share prescription
  
- [ ] **Profile**
  - [ ] Edit profile
  - [ ] Clinic selection
  - [ ] Settings
  - [ ] Biometric auth toggle

### Core Features - Patient App
- [ ] **Home**
  - [ ] Clinic search
  - [ ] Nearby clinics (location-based)
  - [ ] Quick actions
  
- [ ] **Appointments**
  - [ ] Book appointment
  - [ ] View appointments
  - [ ] Cancel appointment
  
- [ ] **Prescriptions**
  - [ ] View prescriptions
  - [ ] Download PDF
  - [ ] Share prescription
  
- [ ] **Profile**
  - [ ] Link patient code
  - [ ] Manage family members
  - [ ] Settings

## 🎯 Medium Priority

### Mobile-Specific Features
- [ ] **Camera Integration**
  - [ ] Capture documents
  - [ ] Upload to S3
  - [ ] Image compression
  
- [ ] **Push Notifications**
  - [ ] Setup FCM
  - [ ] Register device token
  - [ ] Handle notifications
  - [ ] Deep linking
  - [ ] Appointment reminders
  
- [ ] **Biometric Authentication**
  - [ ] Fingerprint/Face ID
  - [ ] Fallback to PIN
  - [ ] Settings integration
  
- [ ] **Offline Support**
  - [ ] Cache management
  - [ ] Offline queue
  - [ ] Sync on reconnect
  - [ ] Offline indicators
  
- [ ] **Location Services**
  - [ ] Get current location
  - [ ] Autofill addresses
  - [ ] Nearby clinics search

### UI/UX Improvements
- [ ] Loading states for all screens
- [ ] Error boundaries
- [ ] Empty states
- [ ] Pull to refresh
- [ ] Infinite scroll for lists
- [ ] Skeleton loaders
- [ ] Toast notifications
- [ ] Bottom sheets for actions
- [ ] Image zoom/preview
- [ ] Form validation feedback

### Shared Components
- [ ] Button component
- [ ] Input component
- [ ] Card component
- [ ] Modal component
- [ ] DatePicker component
- [ ] TimePicker component
- [ ] SearchBar component
- [ ] Avatar component
- [ ] Badge component
- [ ] Dropdown component

## 🔮 Low Priority / Future

### Advanced Features
- [ ] Voice input for prescriptions
- [ ] QR code scanner for patient codes
- [ ] Telemedicine integration
- [ ] Chat with doctor
- [ ] Medication reminders
- [ ] Health tracking
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Accessibility improvements

### Performance
- [ ] Image optimization
- [ ] Bundle size optimization
- [ ] Memory profiling
- [ ] Performance monitoring
- [ ] Crash reporting (Sentry)

### Testing
- [ ] Unit tests for utilities
- [ ] Integration tests for API
- [ ] E2E tests with Detox
- [ ] Accessibility testing

### DevOps
- [ ] CI/CD pipeline
- [ ] Automated builds
- [ ] Beta testing workflow
- [ ] App Store submission

## 🐛 Known Issues

- [ ] None yet (add as you find them)

## 📝 Notes

- Focus on Android first (as per requirements)
- iOS support can be added later
- Keep web app and mobile app UI consistent
- Test on multiple Android versions
- Consider tablet layouts

---

**Last Updated:** [Current Date]
**Next Review:** After completing High Priority items
