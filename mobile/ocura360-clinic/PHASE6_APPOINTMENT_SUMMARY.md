# Phase 6: Appointment Management - Implementation Summary

## ✅ COMPLETED

### 6.1 Appointment API Hooks ✅
**File:** `api/hooks/useAppointments.js`

All hooks implemented and ready to use:
- ✅ `useAppointments(filters)` - Fetch appointments with role-based filtering
- ✅ `useAppointment(appointmentId)` - Fetch single appointment
- ✅ `useCreateFirstVisitAppointment()` - Create with temp patient data
- ✅ `useCreateFollowUpAppointment()` - Create with existing patient
- ✅ `useUpdateAppointment()` - Update appointment
- ✅ `useCancelAppointment()` - Cancel with reason
- ✅ `useCompleteAppointment()` - Mark as completed
- ✅ `useUpdateAppointmentVitals()` - Update vitals (auto-changes to in-progress)
- ✅ `useUpdateClinicalNotes()` - Update clinical notes
- ✅ `useUpdateAppointmentStatus()` - Manual status change
- ✅ `useAssignDoctorToAppointment()` - Assign doctor
- ✅ `useCalendarView()` - Calendar view for doctor
- ✅ `useSearchPatientsForAppointment()` - Search patients for booking

### 6.2 Appointment List Screen ✅
**File:** `screens/appointments/AppointmentsListScreen.jsx`

Fully implemented with:
- ✅ Real API integration with `useAppointments()`
- ✅ Role-based filtering (doctors see only their appointments)
- ✅ Status filter (scheduled, in-progress, completed, cancelled)
- ✅ Doctor filter (for clinic owners/staff only)
- ✅ Date filter
- ✅ Pull-to-refresh functionality
- ✅ Loading and error states
- ✅ Appointment cards showing patient name, time, doctor, visit type, status badge
- ✅ FAB for creating new appointments
- ✅ Navigation to appointment detail

**Key Features:**
```javascript
// Role-based filtering
if (user?.role === 'doctor') {
  baseFilters.doctorId = user._id;
}

// Doctor filter only shown to non-doctors
{user?.role !== 'doctor' && (
  <Select label="Doctor" ... />
)}
```

---

## 🚧 REMAINING TASKS

### 6.3 Appointment Detail Screen
**File:** `screens/appointments/AppointmentDetailScreen.jsx`
**Status:** Needs complete rewrite with real API integration

**Required Implementation:**

#### 1. Basic Information Section
```javascript
import { useAppointment } from '../../api/hooks/useAppointments';
import { useMe } from '../../api/hooks/useAuth';

const { data: appointment, isLoading } = useAppointment(appointmentId);
const { data: user } = useMe();

// Show:
- Patient info (name, phone, age, gender) with navigation to PatientDetail
- Appointment time (startAt, endAt)
- Doctor name
- Clinic name
- Status badge
- Visit type (first_visit / follow_up)
```

#### 2. Vitals Section (Staff and Doctors can edit)
```javascript
import { useUpdateAppointmentVitals } from '../../api/hooks/useAppointments';

const updateVitals = useUpdateAppointmentVitals();

// Form fields:
- Blood Pressure (Systolic/Diastolic) - numbers
- Pulse - number (bpm)
- Temperature - number (°F)
- SpO2 - number (%)
- Weight - number (kg)
- Height - number (cm)
- BMI - auto-calculated from weight/height
- Notes - text

// On save:
await updateVitals.mutateAsync({
  appointmentId,
  vitals: {
    bloodPressureSystolic,
    bloodPressureDiastolic,
    pulse,
    temperature,
    spo2,
    weight,
    height,
    notes,
  }
});
// Backend auto-changes status to 'in-progress'
```

#### 3. Clinical Notes Section (Doctors only)
```javascript
import { useUpdateClinicalNotes } from '../../api/hooks/useAppointments';

const updateNotes = useUpdateClinicalNotes();

// Show only if user.role === 'doctor'
// Form fields:
- Chief Complaint - text
- Symptoms - text
- Examination - text
- Diagnosis - text
- Treatment Plan - text
- Additional Notes - text

// On save:
await updateNotes.mutateAsync({
  appointmentId,
  clinicalNotes: {
    chiefComplaint,
    symptoms,
    examination,
    diagnosis,
    treatmentPlan,
    additionalNotes,
  }
});
```

#### 4. Prescriptions Section
```javascript
// Show linked prescriptions
{appointment.prescriptions?.map(prescription => (
  <ListItem
    title={`Prescription - ${formatDate(prescription.createdAt)}`}
    subtitle={`${prescription.medications?.length || 0} medications`}
    onPress={() => navigation.navigate('PrescriptionDetail', { id: prescription._id })}
  />
))}

// "Create Prescription" button (doctors only)
{user?.role === 'doctor' && appointment.status !== 'cancelled' && (
  <Button onPress={() => navigation.navigate('NewPrescription', { 
    appointmentId,
    patientId: appointment.patient._id 
  })}>
    Create Prescription
  </Button>
)}
```

#### 5. Action Buttons
```javascript
import { useCancelAppointment, useCompleteAppointment } from '../../api/hooks/useAppointments';

const cancelAppointment = useCancelAppointment();
const completeAppointment = useCompleteAppointment();

// Cancel button (if status is 'scheduled' or 'in-progress')
{['scheduled', 'in-progress'].includes(appointment.status) && (
  <Button
    variant="destructive"
    onPress={() => {
      Alert.alert(
        'Cancel Appointment',
        'Reason for cancellation:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: async () => {
              await cancelAppointment.mutateAsync({
                appointmentId,
                reason: 'User cancelled'
              });
              navigation.goBack();
            }
          }
        ]
      );
    }}
  >
    Cancel Appointment
  </Button>
)}

// Complete button (if status is 'in-progress')
{appointment.status === 'in-progress' && (
  <Button
    onPress={async () => {
      await completeAppointment.mutateAsync(appointmentId);
      Alert.alert('Success', 'Appointment marked as completed');
    }}
  >
    Mark as Complete
  </Button>
)}
```

---

### 6.4 New Appointment Screen
**File:** `screens/appointments/NewAppointmentScreen.jsx`
**Status:** Needs complete rewrite with real API integration

**Required Implementation:**

#### 1. Visit Type Selection
```javascript
const [visitType, setVisitType] = useState('first_visit');

<RadioGroup
  value={visitType}
  onValueChange={setVisitType}
  options={[
    { label: 'First Visit', value: 'first_visit' },
    { label: 'Follow-Up', value: 'follow_up' },
  ]}
/>
```

#### 2. First Visit Form
```javascript
import { useCreateFirstVisitAppointment } from '../../api/hooks/useAppointments';

const createFirstVisit = useCreateFirstVisitAppointment();

// Show when visitType === 'first_visit'
<Input label="Patient Name *" value={name} onChangeText={setName} />
<Input label="Phone Number *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
<Input label="Age" value={age} onChangeText={setAge} keyboardType="numeric" />
<Select
  label="Gender"
  value={gender}
  options={[
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
    { label: 'Other', value: 'O' },
  ]}
/>

// On submit:
const result = await createFirstVisit.mutateAsync({
  clinic: selectedClinicId,
  doctor: selectedDoctorId,
  tempPatientData: {
    name,
    phone,
    age: parseInt(age),
    gender,
  },
  startAt: combinedDateTime.toISOString(),
  endAt: new Date(combinedDateTime.getTime() + 30 * 60000).toISOString(), // +30 min
  notes,
});

// Show success with patient code
Alert.alert(
  'Success',
  `Appointment created! Patient Code: ${result.patientCode}`,
  [{ text: 'OK', onPress: () => navigation.navigate('AppointmentDetail', { id: result._id }) }]
);
```

#### 3. Follow-Up Form
```javascript
import { 
  useCreateFollowUpAppointment,
  useSearchPatientsForAppointment 
} from '../../api/hooks/useAppointments';
import { useDebounce } from '../../hooks/useDebounce';

const createFollowUp = useCreateFollowUpAppointment();
const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useDebounce(searchQuery, 300);

// Search patients (min 2 chars)
const { data: searchResults = [] } = useSearchPatientsForAppointment(
  debouncedSearch,
  selectedClinicId,
  { enabled: debouncedSearch.length >= 2 }
);

// Show when visitType === 'follow_up'
<SearchBar
  placeholder="Search by patient code or phone"
  value={searchQuery}
  onChangeText={setSearchQuery}
/>

{searchResults.map(patient => (
  <ListItem
    key={patient._id}
    title={patient.name}
    subtitle={`${patient.patientCode} • ${patient.phone}`}
    onPress={() => setSelectedPatient(patient)}
  />
))}

// On submit:
await createFollowUp.mutateAsync({
  clinic: selectedClinicId,
  doctor: selectedDoctorId,
  patient: selectedPatient._id,
  startAt: combinedDateTime.toISOString(),
  endAt: new Date(combinedDateTime.getTime() + 30 * 60000).toISOString(),
  notes,
});

navigation.navigate('AppointmentDetail', { id: result._id });
```

#### 4. Common Fields
```javascript
// Doctor selection
<Select
  label="Doctor *"
  value={selectedDoctorId}
  onValueChange={setSelectedDoctorId}
  options={clinicDoctors.map(d => ({
    label: d.name,
    value: d._id,
  }))}
/>

// Date/Time pickers
<DatePicker
  label="Appointment Date *"
  value={appointmentDate}
  onChange={setAppointmentDate}
  mode="date"
  minimumDate={new Date()}
/>

<DatePicker
  label="Appointment Time *"
  value={appointmentTime}
  onChange={setAppointmentTime}
  mode="time"
/>

// Notes (optional)
<Textarea
  label="Notes"
  value={notes}
  onChangeText={setNotes}
  placeholder="Additional notes..."
/>
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Appointment Detail Screen
- [ ] Replace mock data with `useAppointment(appointmentId)`
- [ ] Add loading and error states
- [ ] Implement vitals form with all fields
- [ ] Add BMI auto-calculation (weight / (height/100)^2)
- [ ] Integrate `useUpdateAppointmentVitals()` hook
- [ ] Implement clinical notes form (doctors only)
- [ ] Integrate `useUpdateClinicalNotes()` hook
- [ ] Show linked prescriptions with navigation
- [ ] Add "Create Prescription" button (doctors only)
- [ ] Implement cancel appointment with reason
- [ ] Implement complete appointment
- [ ] Add role-based UI hiding (staff can't create prescriptions)
- [ ] Add patient info section with navigation to PatientDetail

### New Appointment Screen
- [ ] Replace mock data with real API hooks
- [ ] Implement visit type selection (radio group)
- [ ] Create first visit form with temp patient data
- [ ] Create follow-up form with patient search
- [ ] Integrate `useSearchPatientsForAppointment()` with debounce
- [ ] Add date/time pickers
- [ ] Fetch clinic doctors dynamically
- [ ] Integrate `useCreateFirstVisitAppointment()` hook
- [ ] Integrate `useCreateFollowUpAppointment()` hook
- [ ] Show success message with patient code (first visit)
- [ ] Navigate to appointment detail after creation
- [ ] Add form validation
- [ ] Add loading states

---

## 🔑 KEY POINTS

### Role-Based Access
- **Doctors:** Can only see their own appointments, can edit vitals and clinical notes, can create prescriptions
- **Staff:** Can see all clinic appointments, can edit vitals, cannot create prescriptions or edit clinical notes
- **Clinic Owners:** Can see all clinic appointments, full access

### Smart Patient Matching
- Backend handles patient matching/creation automatically
- For first visits, temp patient data is stored
- Backend creates/links patient record after appointment
- Patient code is auto-generated and returned

### Status Flow
- **scheduled** → Initial status
- **in-progress** → Auto-set when vitals are updated
- **completed** → Manually set by doctor/staff
- **cancelled** → Manually set with reason

### Data Structure
```javascript
// Appointment object
{
  _id: string,
  clinic: { _id, name },
  doctor: { _id, name },
  patient: { _id, name, phone, age, gender } | null,
  tempPatientData: { name, phone } | null,
  visitType: 'first_visit' | 'follow_up',
  startAt: Date,
  endAt: Date,
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled',
  vitals: {
    bloodPressureSystolic, bloodPressureDiastolic,
    pulse, temperature, spo2, weight, height, notes
  } | null,
  clinicalNotes: {
    chiefComplaint, symptoms, examination,
    diagnosis, treatmentPlan, additionalNotes
  } | null,
  prescriptions: [{ _id, createdAt, medications }],
  notes: string,
}
```

---

## 🎯 NEXT STEPS

1. **Complete Appointment Detail Screen** (6.3)
   - Highest priority for viewing/managing appointments
   - Required for vitals and clinical notes workflow

2. **Complete New Appointment Screen** (6.4)
   - Critical for creating new appointments
   - Required for first visit and follow-up workflows

3. **Test End-to-End Flow**
   - Create first visit appointment
   - Update vitals (should change status to in-progress)
   - Add clinical notes (doctors only)
   - Create prescription
   - Mark as complete

4. **Update BACKEND_INTEGRATION_TODO.md**
   - Mark completed tasks
   - Document any issues or blockers
