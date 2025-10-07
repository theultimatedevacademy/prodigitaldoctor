# Components & Pages Documentation

## Component Library

### UI Components (`src/components/ui/`)

#### Button
**Purpose**: Reusable button with multiple variants and sizes

**Props**:
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `disabled`: boolean

**Usage**:
```jsx
<Button variant="primary" size="md" onClick={handleSave} loading={isSaving}>
  Save
</Button>
```

#### Input
**Purpose**: Text input with label, error display, and validation

**Props**:
- `label`: string
- `error`: string
- `type`: string
- `required`: boolean
- Supports ref forwarding for react-hook-form

**Usage**:
```jsx
<Input
  label="Email"
  type="email"
  {...register('email')}
  error={errors.email?.message}
  required
/>
```

#### Select
**Purpose**: Dropdown select with options

**Props**:
- `label`: string
- `options`: Array<{value, label}>
- `placeholder`: string
- `error`: string

**Usage**:
```jsx
<Select
  label="Gender"
  options={GENDER_OPTIONS}
  {...register('gender')}
  error={errors.gender?.message}
/>
```

#### Modal
**Purpose**: Accessible modal dialog

**Props**:
- `isOpen`: boolean
- `onClose`: function
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'

**Features**:
- ESC key to close
- Click outside to close
- Body scroll lock when open
- Keyboard focus management

**Usage**:
```jsx
<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Confirm">
  <p>Are you sure?</p>
  <ModalFooter>
    <Button onClick={onConfirm}>Confirm</Button>
  </ModalFooter>
</Modal>
```

#### Card
**Purpose**: Content container with consistent styling

**Components**:
- `Card`: Main container
- `CardHeader`: Header section
- `CardTitle`: Title text
- `CardContent`: Main content
- `CardFooter`: Footer with actions

**Usage**:
```jsx
<Card>
  <CardHeader>
    <CardTitle>Patient Info</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content here</p>
  </CardContent>
</Card>
```

#### Alert
**Purpose**: Notification messages

**Props**:
- `variant`: 'info' | 'success' | 'warning' | 'error'
- `title`: string
- `dismissible`: boolean
- `onClose`: function

**Usage**:
```jsx
<Alert variant="success" title="Success">
  Patient created successfully!
</Alert>
```

#### SearchInput
**Purpose**: Search input with debouncing

**Props**:
- `value`: string
- `onChange`: function
- `onSearch`: function (called with debounced value)
- `debounceDelay`: number (default: 300ms)

**Usage**:
```jsx
<SearchInput
  value={query}
  onChange={setQuery}
  onSearch={handleSearch}
  placeholder="Search patients..."
/>
```

### Feature Components

#### ClinicSelector
**Location**: `src/features/clinics/ClinicSelector.jsx`

**Purpose**: Dropdown in nav to switch between clinics

**Features**:
- Fetches clinics using `useClinics()`
- Saves selection to localStorage via `useClinicContext()`
- Auto-selects first clinic if none selected
- Shows clinic name and address

**Integration**:
```jsx
// In MainLayout
<ClinicSelector />
```

#### PatientCard
**Location**: `src/features/patients/PatientCard.jsx`

**Purpose**: Display patient summary

**Props**:
- `patient`: Patient object
- `onClick`: function

**Displays**:
- Patient name and code
- Age and gender
- Phone number
- ABHA badge (if linked)

#### PrescriptionBuilder
**Location**: `src/features/prescriptions/PrescriptionBuilder.jsx`

**Purpose**: Complete prescription creation form

**Props**:
- `patientId`: string
- `clinicId`: string
- `doctorId`: string
- `appointmentId`: string (optional)
- `onSuccess`: function

**Features**:
- Medication search with autocomplete
- DDI checking on medication changes
- Diagnosis entry (ICD-10 optional)
- Override mechanism for contraindicated interactions
- PDF generation on submit

**Workflow**:
1. Search and add medications
2. Enter dosage, frequency, duration
3. Auto DDI check
4. Add diagnosis codes/text
5. Add notes
6. Submit → Generate PDF

#### DDIWarnings
**Location**: `src/features/prescriptions/DDIWarnings.jsx`

**Purpose**: Display drug interaction warnings

**Props**:
- `warnings`: Array of warning objects
- `onOverride`: function (for contraindicated)

**Warning Severities**:
- **Minor** (green): Monitor patient
- **Moderate** (amber): Caution required
- **Major** (red): Serious risk
- **Contraindicated** (dark red): Blocks submission

**Features**:
- Groups warnings by severity
- Shows composition pairs
- Displays recommendations
- Override button for contraindicated

#### MedicationSearch
**Location**: `src/features/prescriptions/MedicationSearch.jsx`

**Purpose**: Autocomplete medication search

**Props**:
- `onSelect`: function (called when med selected)
- `placeholder`: string

**Features**:
- Debounced search (300ms)
- Dropdown with medication cards
- Shows brand name, generic name, compositions
- Click outside to close

#### PDFViewer
**Location**: `src/features/prescriptions/PDFViewer.jsx`

**Purpose**: Display prescription PDFs

**Props**:
- `pdfUrl`: string
- `title`: string
- `onShare`: function (ABDM share)

**Features**:
- Iframe PDF viewer
- Download button
- Open in new tab
- Share via ABDM button

#### FileUploader
**Location**: `src/features/uploads/FileUploader.jsx`

**Purpose**: File upload with drag-and-drop

**Props**:
- `onUploadComplete`: function (receives file key)
- `allowedTypes`: Array of MIME types
- `maxSizeMB`: number
- `multiple`: boolean

**Features**:
- Drag and drop support
- File validation (type, size)
- Progress bar
- Presigned S3 upload
- Preview of selected file

## Pages

### LandingPage
**Route**: `/`

**Components Used**:
- Clerk `SignInButton`, `SignUpButton`
- Custom `Button`
- Feature cards

**Sections**:
1. Header with sign in/up buttons
2. Hero section
3. Features grid
4. CTA section
5. Footer

**Logic**:
- Redirects to `/dashboard` if signed in

### DoctorDashboard
**Route**: `/dashboard`

**Components Used**:
- `StatCard` (local component)
- `AppointmentCard`
- `Card` components
- `ClinicSelector`

**Sections**:
1. Header with quick actions
2. Statistics cards (4 metrics)
3. Today's appointments
4. Quick actions sidebar
5. Recent patients

**Data Fetched**:
- Today's appointments
- Patient statistics
- Recent prescriptions

### PatientsPage
**Route**: `/patients`

**Components Used**:
- `SearchInput`
- `PatientCard`
- `Button`

**Features**:
- Search patients by name/phone/code
- Grid display
- Empty state with CTA
- Click to view details

### NewPatientPage
**Route**: `/patients/new`

**Components Used**:
- `Card`
- `Input`, `Select`, `Textarea`
- `Button`

**Form Sections**:
1. Personal Info (name, DOB, gender)
2. Contact Info (phone, email, address)
3. Medical Info (blood group, allergies, ABHA)

**Validation**: Zod schema (`patientSchema`)

**On Success**:
- Shows patient code in toast
- Redirects to patient detail page

### PatientDetailPage
**Route**: `/patients/:id`

**Components Used**:
- `Card`
- `Badge`
- `Button`
- Tab components (local)

**Tabs**:
1. **Overview**: Medical info, quick actions
2. **Appointments**: List of appointments
3. **Prescriptions**: List of prescriptions
4. **Files**: Uploaded documents

**Data Fetched**:
- Patient details
- Appointments
- Prescriptions

### NewPrescriptionPage
**Route**: `/prescriptions/new?patientId=xxx`

**Components Used**:
- `PrescriptionBuilder`
- `Card`

**Query Params**:
- `patientId`: Required
- `appointmentId`: Optional

**On Success**:
- Redirects to prescription detail page

### PrescriptionDetailPage
**Route**: `/prescriptions/:id`

**Components Used**:
- `Card`
- `PDFViewer`
- `Badge`
- `Button`

**Sections**:
1. Header with actions
2. Patient info card
3. Doctor info card
4. Medication list
5. PDF viewer

**Actions**:
- Download PDF
- Share via ABDM (if ABHA linked)

### MedicationsPage
**Route**: `/meds`

**Components Used**:
- `SearchInput`
- `Card`
- `Badge`

**Features**:
- Debounced medication search
- Shows compositions, manufacturer, category
- No selection action (view only)

## Custom Hooks

### useAuth
**Location**: `src/hooks/useAuth.js`

**Returns**:
```js
{
  user,              // Backend user object
  clerkUser,         // Clerk user
  isLoading,         // Loading state
  isAuthenticated,   // true if signed in + backend user loaded
  getAuthToken,      // Get Clerk JWT
  signOut,           // Sign out function
  hasRole,           // Check role
  isDoctor,          // Convenience: check if doctor
  isPatient,         // Convenience: check if patient
  isStaff,
  isAdmin,
}
```

### useClinicContext
**Location**: `src/hooks/useClinicContext.js`

**Provider**: `<ClinicProvider>`

**Returns**:
```js
{
  selectedClinicId,     // Current clinic ID
  setSelectedClinicId,  // Update selection
}
```

**Features**:
- Persists to localStorage
- Auto-loads on mount

### useDebounce
**Location**: `src/hooks/useDebounce.js`

**Usage**:
```js
const debouncedValue = useDebounce(value, 300);
```

### useLocalStorage
**Location**: `src/hooks/useLocalStorage.js`

**Usage**:
```js
const [value, setValue] = useLocalStorage('key', initialValue);
```

## React Query Hooks

### usePatients
```js
const { data, isLoading, error } = usePatients(clinicId, filters);
// data.patients, data.total
```

### useCreatePatient
```js
const mutation = useCreatePatient();
mutation.mutate(patientData, {
  onSuccess: (result) => {
    // result.patient
  }
});
```

### usePrescriptions
```js
const { data } = usePrescriptions({ clinicId, patientId });
// data.prescriptions
```

### useCheckDDI
```js
const mutation = useCheckDDI();
const result = await mutation.mutateAsync(compositionIds);
// result.warnings
```

### useFileUpload
```js
const { uploadFile, isLoading } = useFileUpload(onProgress);
const fileKey = await uploadFile(file);
```

## Utilities

### Formatters (`src/utils/formatters.js`)
- `formatDate(date, format)`
- `formatTime(date)`
- `formatPhone(phone)`
- `formatCurrency(amount)`
- `formatFileSize(bytes)`
- `getSeverityColor(severity)`
- `getStatusColor(status)`

### Validators (`src/utils/validators.js`)
- `patientSchema` (Zod)
- `prescriptionSchema` (Zod)
- `appointmentSchema` (Zod)
- `isValidPhone(phone)`
- `isValidAbhaId(abhaId)`
- `validateFile(file, maxSizeMB, allowedTypes)`

### Constants (`src/utils/constants.js`)
- `API_ENDPOINTS`
- `USER_ROLES`
- `DDI_SEVERITY`
- `MEDICATION_FREQUENCIES`
- `GENDER_OPTIONS`
- `QUERY_KEYS`

---

**Last Updated**: 2025-10-08
