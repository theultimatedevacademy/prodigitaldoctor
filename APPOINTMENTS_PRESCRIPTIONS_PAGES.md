# Appointments & Prescriptions Pages

## Created Pages

### 1. AppointmentsPage (`/appointments`)

**Features:**
- ✅ Lists all appointments for the selected clinic
- ✅ Search by patient, doctor, or reason
- ✅ Filter by status (scheduled, confirmed, completed, etc.)
- ✅ Shows empty state with message when no appointments exist
- ✅ Requires clinic selection to view appointments
- ✅ Loading states with spinner
- ✅ Summary showing count of appointments

**Empty State:**
- Shows Calendar icon
- Message: "No Appointments Yet"
- Button: "Create First Appointment" (disabled - coming soon)

**With Data:**
- Grid layout of appointment cards
- Each card shows:
  - Patient name
  - Doctor name
  - Date & time
  - Duration
  - Status badge
  - Reason (if available)

### 2. PrescriptionsPage (`/prescriptions`)

**Features:**
- ✅ Lists all prescriptions for the selected clinic
- ✅ Search by patient, doctor, or diagnosis
- ✅ Shows empty state with message when no prescriptions exist
- ✅ Requires clinic selection to view prescriptions
- ✅ Loading states with spinner
- ✅ Summary showing count of prescriptions

**Empty State:**
- Shows FileText icon
- Message: "No Prescriptions Yet"
- Button: "Create First Prescription" (links to `/prescriptions/new`)

**With Data:**
- List layout of prescription cards
- Each card shows:
  - Patient name
  - Doctor name
  - Diagnosis
  - Number of medications
  - Created date
  - Active badge

## Routes Added

```javascript
// Appointments
<Route path="appointments" element={<AppointmentsPage />} />

// Prescriptions
<Route path="prescriptions" element={<PrescriptionsPage />} />
<Route path="prescriptions/new" element={<NewPrescriptionPage />} />
<Route path="prescriptions/:id" element={<PrescriptionDetailPage />} />
```

## Navigation

Both pages are accessible from:
1. **Sidebar navigation** (for clinic owners and doctors)
2. **Dashboard quick links** (if implemented)

## Clinic Selection Required

Both pages check for selected clinic:
- If no clinic selected → Shows "No Clinic Selected" message
- If clinic selected but loading → Shows spinner
- If clinic selected and loaded → Shows data or empty state

## Empty States

### No Clinic Selected
```
[Calendar/FileText Icon]
No Clinic Selected
Please select a clinic to view [appointments/prescriptions]
[Select Clinic] button → links to /clinics
```

### No Data Yet
```
[Calendar/FileText Icon]
No [Appointments/Prescriptions] Yet
Create your first [appointment/prescription] to get started
[Create First...] button → disabled or links to creation page
```

### No Search Results
```
[Calendar/FileText Icon]
No Matching [Appointments/Prescriptions]
Try adjusting your search or filters
```

## Search & Filters

### AppointmentsPage
- **Search:** Patient name, doctor name, reason
- **Filter:** Status dropdown (all, scheduled, confirmed, in-progress, completed, cancelled, no-show)

### PrescriptionsPage
- **Search:** Patient name, doctor name, diagnosis
- **Filter:** None (can be added in future)

## TODO / Coming Soon

### Appointments
- [ ] Create new appointment page
- [ ] Edit appointment functionality
- [ ] Cancel appointment functionality
- [ ] Appointment details page
- [ ] Calendar view

### Prescriptions
- ✅ List prescriptions
- ✅ Create new prescription (page exists)
- ✅ View prescription details (page exists)
- [ ] Edit prescription
- [ ] Delete prescription
- [ ] Print/Download PDF

## Testing

1. **Without clinic selected:**
   - Navigate to `/appointments` or `/prescriptions`
   - Should see "No Clinic Selected" message
   - Click "Select Clinic" → redirects to `/clinics`

2. **With clinic selected (no data):**
   - Select a clinic from clinic selector
   - Navigate to pages
   - Should see empty state with create button

3. **With data:**
   - Create some appointments/prescriptions
   - Should see list of items
   - Test search functionality
   - Test filters (appointments only)

## Known Issues

- Appointment creation functionality not yet implemented
- New Appointment button is disabled with tooltip "Coming soon"
- Appointments can currently only be created from other parts of the app
