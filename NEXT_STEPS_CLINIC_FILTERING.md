# Next Steps: Add Clinic Filtering to Existing Pages

**Status:** Frontend infrastructure complete, need to update data-fetching pages

---

## Overview

The core infrastructure is ready. Now we need to update existing pages to:
1. Get `selectedClinicId` from ClinicContext
2. Pass clinic ID to API queries
3. Apply role-based UI restrictions

---

## Pages That Need Updates

### ✅ Backend Already Filtered
These pages already have backend filtering implemented:
- `appointmentController.js` - ✅ Filters by role
- `prescriptionController.js` - ✅ Filters by role, checks permissions

### ⏳ Frontend Needs Clinic Filter

These pages need to be updated to pass `selectedClinicId`:

---

## 1. Appointments Page

**File:** `client/src/pages/AppointmentsPage.jsx`

**Changes Needed:**
```javascript
import { useClinicContext } from '../contexts/ClinicContext';
import { PERMISSIONS } from '../utils/roleConfig';

export function AppointmentsPage() {
  const { selectedClinicId, userClinicRole } = useClinicContext();
  
  // Update query to include clinic filter
  const { data } = useAppointments({
    clinic: selectedClinicId,  // ADD THIS
    // ... other filters
  });
  
  // Role-based UI
  const canViewAll = PERMISSIONS.canViewAllAppointments(userClinicRole);
  
  return (
    // ... existing UI
  );
}
```

**Backend:** Already filters by role ✅

---

## 2. Prescriptions Page

**File:** `client/src/pages/PrescriptionsPage.jsx`

**Changes Needed:**
```javascript
import { useClinicContext } from '../contexts/ClinicContext';
import { PERMISSIONS } from '../utils/roleConfig';

export function PrescriptionsPage() {
  const { selectedClinicId, userClinicRole } = useClinicContext();
  
  // Update query
  const { data } = usePrescriptions({
    clinic: selectedClinicId,  // ADD THIS
    // ... other filters
  });
  
  // Hide create button for staff
  const canCreate = PERMISSIONS.canCreatePrescription(userClinicRole);
  
  return (
    <>
      {canCreate && (
        <Button onClick={() => navigate('/prescriptions/new')}>
          Create Prescription
        </Button>
      )}
      {/* ... rest of UI */}
    </>
  );
}
```

**Backend:** Already filters by role and checks permissions ✅

---

## 3. Patients Page

**File:** `client/src/pages/PatientsPage.jsx`

**Changes Needed:**
```javascript
import { useClinicContext } from '../contexts/ClinicContext';
import { PERMISSIONS } from '../utils/roleConfig';

export function PatientsPage() {
  const { selectedClinicId, userClinicRole } = useClinicContext();
  
  // Update query
  const { data } = usePatients({
    clinic: selectedClinicId,  // ADD THIS
    // ... other filters
  });
  
  // Show appropriate empty state
  const canViewAll = PERMISSIONS.canViewAllPatients(userClinicRole);
  
  const emptyMessage = canViewAll
    ? 'No patients in this clinic yet'
    : 'No patients under your care yet';
  
  return (
    // ... existing UI with updated empty state
  );
}
```

**Backend TODO:** Need to add doctor filtering in `patientController.js`

---

## 4. Medications Page

**File:** `client/src/pages/MedicationsPage.jsx`

**Changes Needed:**
```javascript
import { useClinicContext } from '../contexts/ClinicContext';
import { PERMISSIONS } from '../utils/roleConfig';
import { Navigate } from 'react-router-dom';

export function MedicationsPage() {
  const { userClinicRole } = useClinicContext();
  
  // Block staff from accessing
  if (!PERMISSIONS.canAccessMedications(userClinicRole)) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">
            Only doctors and clinic owners can access the medication database.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    // ... existing medication search UI
  );
}
```

**Backend:** No filtering needed (global medication DB)

---

## 5. New Appointment Page

**File:** `client/src/pages/NewAppointmentPage.jsx`

**Changes Needed:**
```javascript
import { useClinicContext } from '../contexts/ClinicContext';

export function NewAppointmentPage() {
  const { selectedClinicId } = useClinicContext();
  
  // Pre-fill clinic field
  const [formData, setFormData] = useState({
    clinic: selectedClinicId,  // ADD THIS
    // ... other fields
  });
  
  // Make clinic field read-only or hidden
  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="clinic" value={selectedClinicId} />
      {/* ... rest of form */}
    </form>
  );
}
```

---

## 6. New Prescription Page

**File:** `client/src/pages/NewPrescriptionPage.jsx`

**Changes Needed:**
```javascript
import { useClinicContext } from '../contexts/ClinicContext';
import { PERMISSIONS } from '../utils/roleConfig';
import { Navigate } from 'react-router-dom';

export function NewPrescriptionPage() {
  const { selectedClinicId, userClinicRole } = useClinicContext();
  
  // Block staff
  if (!PERMISSIONS.canCreatePrescription(userClinicRole)) {
    return <Navigate to="/prescriptions" replace />;
  }
  
  // Pre-fill clinic
  const [formData, setFormData] = useState({
    clinic: selectedClinicId,  // ADD THIS
    // ... other fields
  });
  
  return (
    // ... existing form
  );
}
```

---

## 7. Patient Detail Page

**File:** `client/src/pages/PatientDetailPage.jsx`

**Changes Needed:**
```javascript
import { useClinicContext } from '../contexts/ClinicContext';
import { PERMISSIONS } from '../utils/roleConfig';

export function PatientDetailPage() {
  const { selectedClinicId, userClinicRole } = useClinicContext();
  const { id: patientId } = useParams();
  
  // Fetch patient with clinic context
  const { data: patient } = usePatient(patientId, {
    clinic: selectedClinicId  // ADD THIS if backend needs it
  });
  
  // Check if doctor can access this patient
  const canEdit = PERMISSIONS.canEditAllPatients(userClinicRole);
  
  return (
    <>
      {canEdit && (
        <Button onClick={() => navigate(`/patients/${patientId}/edit`)}>
          Edit Patient
        </Button>
      )}
      {/* ... rest of UI */}
    </>
  );
}
```

---

## 8. Update API Hooks

### `useAppointments`

**File:** `client/src/api/hooks/useAppointments.js`

```javascript
export function useAppointments(filters = {}) {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.clinic) params.append('clinic', filters.clinic);  // ADD
      if (filters.doctor) params.append('doctor', filters.doctor);
      if (filters.date) params.append('date', filters.date);
      // ... other filters
      
      return get(`/appointments?${params.toString()}`);
    },
    enabled: !!filters.clinic,  // ADD: Only fetch if clinic selected
  });
}
```

### `usePrescriptions`

**File:** `client/src/api/hooks/usePrescriptions.js`

Similar pattern - add clinic filter

### `usePatients`

**File:** `client/src/api/hooks/usePatients.js`

Similar pattern - add clinic filter

---

## Implementation Priority

### **High Priority** (Core functionality)
1. ✅ AppointmentsPage - Add clinic filter
2. ✅ PrescriptionsPage - Add clinic filter + hide create for staff
3. ✅ PatientsPage - Add clinic filter
4. ✅ NewAppointmentPage - Pre-fill clinic
5. ✅ NewPrescriptionPage - Pre-fill clinic + block staff

### **Medium Priority** (Better UX)
1. ✅ MedicationsPage - Block staff access
2. ✅ PatientDetailPage - Role-based edit access
3. ✅ AppointmentDetailPage - Role-based edit access

### **Low Priority** (Edge cases)
1. ⏳ Analytics page (not yet created)
2. ⏳ Clinic Settings page (not yet created)

---

## Backend Updates Still Needed

### `patientController.js`

**Need to add doctor filtering:**

```javascript
export const getPatients = async (req, res) => {
  const { userId } = req.auth;
  const { clinic } = req.query;
  
  const filter = { clinic };
  
  // Role-based filtering
  const user = await User.findOne({ clerkId: userId });
  const userRole = await getUserClinicRole(user._id, clinic);
  
  if (userRole === 'doctor') {
    // Only show patients the doctor has seen
    const doctorPatients = await getDoctorPatients(user._id, clinic);
    filter._id = { $in: doctorPatients };
  }
  // Owners and staff see all patients
  
  const patients = await Patient.find(filter);
  res.json({ patients });
};
```

---

## Testing Checklist

### **As Clinic Owner:**
- [ ] See all appointments in clinic
- [ ] See all prescriptions in clinic
- [ ] See all patients in clinic
- [ ] Can create appointments/prescriptions
- [ ] Can access medications
- [ ] Can access staff management

### **As Doctor:**
- [ ] See only my appointments
- [ ] See only my prescriptions
- [ ] See only patients I've seen
- [ ] Can create appointments/prescriptions
- [ ] Can access medications
- [ ] Cannot access staff management

### **As Staff:**
- [ ] See all appointments in clinic
- [ ] See all prescriptions in clinic (read-only)
- [ ] See all patients in clinic
- [ ] Can create appointments
- [ ] Cannot create prescriptions
- [ ] Cannot access medications
- [ ] Cannot access staff management

### **Clinic Switching:**
- [ ] Switching clinic updates all data
- [ ] Role changes when switching
- [ ] Navigation updates appropriately

---

## Quick Implementation Example

Here's a complete example for AppointmentsPage:

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import { useClinicContext } from '../contexts/ClinicContext';
import { useAppointments } from '../api/hooks/useAppointments';
import { PERMISSIONS } from '../utils/roleConfig';
import { Button } from '../components/ui/Button';

export function AppointmentsPage() {
  const navigate = useNavigate();
  const { selectedClinicId, userClinicRole } = useClinicContext();
  const [filters, setFilters] = useState({});
  
  // Fetch appointments with clinic filter
  const { data, isLoading } = useAppointments({
    clinic: selectedClinicId,
    ...filters,
  });
  
  const appointments = data?.appointments || [];
  const canViewAll = PERMISSIONS.canViewAllAppointments(userClinicRole);
  
  const emptyMessage = canViewAll
    ? 'No appointments scheduled yet'
    : 'No appointments assigned to you yet';
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Calendar className="mr-3" />
          Appointments
        </h1>
        <Button onClick={() => navigate('/appointments/new')}>
          <Plus className="w-5 h-5 mr-2" />
          New Appointment
        </Button>
      </div>
      
      {/* Filters */}
      {/* ... existing filter UI ... */}
      
      {/* Appointments List */}
      {isLoading ? (
        <div>Loading...</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <AppointmentCard key={apt._id} appointment={apt} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Summary

**Infrastructure Complete ✅**
- ClinicContext provides selectedClinicId and userClinicRole
- Permission helpers available in roleConfig.js
- Backend already filters appointments and prescriptions

**Next Steps:**
1. Update 5-7 pages to use ClinicContext
2. Update API hooks to include clinic filter
3. Add doctor patient filtering in backend
4. Test all role combinations
5. Test clinic switching

**Estimated Time:** 2-3 hours for all page updates

---

**Ready to implement!** Just follow the patterns shown above for each page.
