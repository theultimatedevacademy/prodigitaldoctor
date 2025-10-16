# ProDigitalDoctor API Documentation

Base URL: `http://localhost:5000/api`

All endpoints (except webhooks and public routes) require authentication via Clerk JWT token in the `Authorization` header:
```
Authorization: Bearer <clerk_jwt_token>
```

## Table of Contents

1. [Authentication](#authentication)
2. [Clinics](#clinics)
3. [Patients](#patients)
4. [Appointments](#appointments)
5. [Medications & Compositions](#medications--compositions)
6. [Prescriptions](#prescriptions)
7. [Uploads](#uploads)
8. [Analytics](#analytics)
9. [Admin](#admin)

---

## Authentication

### Get Current User
```http
GET /api/auth/me
```

**Response**:
```json
{
  "_id": "xxx",
  "clerkId": "user_xxx",
  "roles": ["doctor", "clinic_owner"],
  "name": "Dr. John Doe",
  "email": "john@example.com",
  "clinics": [...]
}
```

### Update Profile
```http
PATCH /api/auth/profile
```

**Body**:
```json
{
  "name": "Dr. John Doe",
  "phone": "+91-9876543210",
  "qualifications": "MBBS, MD",
  "specializations": ["Cardiology"]
}
```

### Update My Role
```http
POST /api/auth/my-role
```

**Body**:
```json
{
  "roles": ["doctor", "clinic_owner"]
}
```

---

## Clinics

### Create Clinic
```http
POST /api/clinics
```

**Body**:
```json
{
  "name": "City Medical Center",
  "address": {
    "line1": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pin": "400001"
  },
  "contact": {
    "phone": "+91-22-12345678",
    "email": "contact@citymedical.com"
  },
  "workingHours": {
    "monday": [{ "start": "09:00", "end": "17:00" }],
    "tuesday": [{ "start": "09:00", "end": "17:00" }]
  }
}
```

### Get All My Clinics
```http
GET /api/clinics
```

### Get Clinic by ID
```http
GET /api/clinics/:clinicId
```

### Update Clinic
```http
PATCH /api/clinics/:clinicId
```

### Invite Staff
```http
POST /api/clinics/:clinicId/invite
```

**Body**:
```json
{
  "email": "doctor@example.com",
  "role": "doctor"
}
```

### Accept Invitation
```http
POST /api/clinics/:clinicId/accept-invite
```

### Get Pending Invitations
```http
GET /api/clinics/invitations/pending
```

### Remove Staff
```http
DELETE /api/clinics/:clinicId/staff/:staffUserId
```

### Search Clinics (Public)
```http
GET /api/clinics/search?city=Mumbai&pin=400001&page=1&limit=20
```

---

## Patients

### Create Patient
```http
POST /api/patients
```

**Body**:
```json
{
  "name": "John Patient",
  "dob": "1990-01-15",
  "gender": "M",
  "phone": "+91-9876543210",
  "email": "patient@example.com",
  "clinic": "clinic_id",
  "doctor": "doctor_id",
  "addresses": [
    {
      "line1": "456 Park Ave",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pin": "400002"
    }
  ]
}
```

**Response** includes auto-generated patient code.

### Search Patients
```http
GET /api/patients/search?q=John&clinic=clinic_id&page=1&limit=20
```

### Get Patient by ID
```http
GET /api/patients/:patientId
```

### Get Patient History
```http
GET /api/patients/:patientId/history?page=1&limit=20
```

**Response**:
```json
{
  "patient": {...},
  "prescriptions": {
    "data": [...],
    "total": 10
  },
  "appointments": {
    "data": [...],
    "total": 5
  }
}
```

### Link Patient Code
```http
POST /api/patients/link-code
```

**Body**:
```json
{
  "patientCode": "ABC-DR-0001-X7K",
  "phone": "+91-9876543210",
  "otp": "123456"
}
```

### Get Linked Patients
```http
GET /api/patients/linked
```

### Update Patient
```http
PATCH /api/patients/:patientId
```

### Get Clinic Patients
```http
GET /api/clinics/:clinicId/patients?page=1&limit=20
```

---

## Appointments

### Create Appointment
```http
POST /api/appointments
```

**Body**:
```json
{
  "clinic": "clinic_id",
  "doctor": "doctor_id",
  "patient": "patient_id",
  "startAt": "2024-01-15T10:00:00Z",
  "endAt": "2024-01-15T10:30:00Z",
  "notes": "Follow-up visit"
}
```

**Conflict Detection**: Returns 409 if time slot conflicts with existing appointment.

### Get Appointments
```http
GET /api/appointments?clinic=xxx&doctor=xxx&date=2024-01-15&status=scheduled&page=1&limit=50
```

**Query Parameters**:
- `clinic`: Filter by clinic ID
- `doctor`: Filter by doctor ID
- `patient`: Filter by patient ID
- `date`: Single day filter (YYYY-MM-DD)
- `startDate` & `endDate`: Date range filter
- `status`: scheduled, completed, cancelled, no-show

### Get Appointment by ID
```http
GET /api/appointments/:appointmentId
```

### Update Appointment
```http
PATCH /api/appointments/:appointmentId
```

**Body**:
```json
{
  "startAt": "2024-01-15T11:00:00Z",
  "notes": "Rescheduled"
}
```

### Cancel Appointment
```http
POST /api/appointments/:appointmentId/cancel
```

**Body**:
```json
{
  "reason": "Patient requested cancellation"
}
```

### Complete Appointment
```http
POST /api/appointments/:appointmentId/complete
```

### Get Calendar View
```http
GET /api/appointments/calendar?doctor=xxx&startDate=2024-01-01&endDate=2024-01-31
```

**Response**:
```json
{
  "calendar": {
    "2024-01-15": [...appointments...],
    "2024-01-16": [...appointments...]
  },
  "appointments": [...all appointments...],
  "summary": {
    "total": 20,
    "scheduled": 15,
    "completed": 3,
    "cancelled": 2
  }
}
```

---

## Medications & Compositions

### Search Medications
```http
GET /api/medications/search?q=paracetamol&page=1&limit=20
```

**Query Parameters**:
- `q`: Search query (brand/generic name)
- `composition`: Filter by composition ID

### Get Medication by ID
```http
GET /api/medications/:medicationId
```

### Search Compositions
```http
GET /api/compositions/search?q=paracetamol&page=1&limit=20
```

### Check DDI (Medications)
```http
POST /api/medications/check-ddi
```

**Body**:
```json
{
  "medicationIds": ["med_id_1", "med_id_2", "med_id_3"]
}
```

**Response**:
```json
{
  "warnings": [
    {
      "severity": "major",
      "text": "Risk of bleeding",
      "compA": {...},
      "compB": {...},
      "recommendation": "Monitor closely"
    }
  ]
}
```

### Check DDI (Compositions)
```http
POST /api/compositions/check-ddi
```

**Body**:
```json
{
  "compositionIds": ["comp_id_1", "comp_id_2"]
}
```

---

## Prescriptions

### Create Prescription
```http
POST /api/prescriptions
```

**Body**:
```json
{
  "clinic": "clinic_id",
  "patient": "patient_id",
  "appointment": "appointment_id",
  "meds": [
    {
      "medication": "medication_id",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "5 days",
      "notes": "Take after food"
    }
  ],
  "diagnosis": [
    {
      "code": "J00",
      "text": "Acute nasopharyngitis (common cold)"
    }
  ],
  "notes": "Rest and fluids",
  "overrideDDI": false
}
```

**DDI Handling**:
- If severe DDI warnings found and `overrideDDI: false`, returns 400 with warnings
- If `overrideDDI: true`, creates prescription and logs override in audit log

**Response**:
```json
{
  "_id": "prescription_id",
  "clinic": {...},
  "doctor": {...},
  "patient": {...},
  "meds": [...],
  "ddiWarnings": [...],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Get Prescription by ID
```http
GET /api/prescriptions/:prescriptionId
```

### Get Patient Prescriptions
```http
GET /api/patients/:patientId/prescriptions?page=1&limit=20
```

### Get Clinic Prescriptions
```http
GET /api/clinics/:clinicId/prescriptions?page=1&limit=20&startDate=2024-01-01&endDate=2024-01-31
```

### Get Prescription PDF Data
```http
GET /api/prescriptions/:prescriptionId/pdf-data
```

**Response**: Structured data for client-side PDF generation
```json
{
  "prescriptionId": "xxx",
  "date": "2024-01-15T10:30:00Z",
  "clinic": {...},
  "doctor": {...},
  "patient": {...},
  "medications": [...],
  "diagnosis": [...],
  "notes": "...",
  "ddiWarnings": [...]
}
```

### Update Prescription PDF
```http
PATCH /api/prescriptions/:prescriptionId/pdf
```

**Body**:
```json
{
  "pdfUrl": "https://s3.amazonaws.com/bucket/key",
  "pdfS3Key": "prescriptions/12345_prescription.pdf"
}
```

### Get Prescription Stats
```http
GET /api/prescriptions/stats?doctor=xxx&clinic=xxx&startDate=2024-01-01&endDate=2024-01-31
```

**Response**:
```json
{
  "total": 150,
  "topMedications": [
    {
      "medication": {...},
      "count": 45
    }
  ],
  "topDiagnoses": [
    {
      "diagnosis": "Common cold",
      "count": 30
    }
  ]
}
```

---

## Uploads

### Generate Presigned PUT URL
```http
POST /api/uploads/presign
```

**Body**:
```json
{
  "folder": "prescriptions",
  "filename": "prescription.pdf",
  "contentType": "application/pdf"
}
```

**Allowed folders**: prescriptions, lab-reports, patient-documents, clinic-logos, doctor-signatures

**Response**:
```json
{
  "presignedUrl": "https://s3.amazonaws.com/...",
  "s3Key": "prescriptions/1234567890_prescription.pdf",
  "expiresIn": 300
}
```

**Usage**:
1. Get presigned URL from this endpoint
2. Upload file directly to S3 using the URL (PUT request)
3. Store the `s3Key` in your database

### Generate Presigned GET URL
```http
GET /api/uploads/signed-url?key=prescriptions/1234567890_prescription.pdf
```

**Response**:
```json
{
  "presignedUrl": "https://s3.amazonaws.com/...",
  "expiresIn": 3600
}
```

---

## Analytics

### Get Clinic Summary
```http
GET /api/analytics/clinic/:clinicId/summary?startDate=2024-01-01&endDate=2024-01-31
```

**Response**:
```json
{
  "patients": {
    "total": 500,
    "new": 50
  },
  "appointments": {
    "total": 200,
    "scheduled": 150,
    "completed": 40,
    "cancelled": 10
  },
  "prescriptions": {
    "total": 180
  },
  "doctorPerformance": [
    {
      "doctor": {...},
      "prescriptionCount": 80
    }
  ]
}
```

### Get Doctor Summary
```http
GET /api/analytics/doctor/:doctorId/summary?clinicId=xxx&startDate=2024-01-01&endDate=2024-01-31
```

**Response**:
```json
{
  "patients": {
    "total": 120
  },
  "prescriptions": {
    "total": 100
  },
  "appointments": {
    "total": 110,
    "completed": 95
  },
  "topMedications": [...],
  "topDiagnoses": [...]
}
```

### Get Patient Trends
```http
GET /api/analytics/clinic/:clinicId/patient-trends?period=daily&days=30
```

**Query Parameters**:
- `period`: daily or weekly
- `days`: Number of days to look back

---

## Admin

**All admin endpoints require `admin` role.**

### Get All Users
```http
GET /api/admin/users?page=1&limit=50&role=doctor&search=john
```

### Update User Status
```http
PATCH /api/admin/users/:userId/status
```

**Body**:
```json
{
  "enabled": false
}
```

### Delete User
```http
DELETE /api/admin/users/:userId
```

### Get System Stats
```http
GET /api/admin/stats
```

**Response**:
```json
{
  "users": {
    "total": 1000,
    "byRole": {
      "patient": 800,
      "doctor": 150,
      "clinic_owner": 40,
      "admin": 10
    }
  },
  "clinics": { "total": 50 },
  "patients": { "total": 5000 },
  "prescriptions": { "total": 10000 },
  "appointments": {...},
  "recentAuditLogs": [...]
}
```

### Get Audit Logs
```http
GET /api/admin/audit-logs?actor=xxx&action=CREATE_PRESCRIPTION&resource=prescription&page=1&limit=50
```

### Detect Fraud
```http
GET /api/admin/fraud-detection?days=7
```

**Response**:
```json
{
  "period": "Last 7 days",
  "suspiciousDoctors": [
    {
      "doctor": {...},
      "prescriptionCount": 200,
      "avgPerDay": "28.57"
    }
  ],
  "suspiciousPatients": [
    {
      "patient": {...},
      "visitCount": 10
    }
  ]
}
```

### Create Medication (Admin)
```http
POST /api/admin/medications
```

**Body**:
```json
{
  "brandName": "Crocin",
  "genericName": "Paracetamol",
  "compositions": ["composition_id"],
  "form": "Tablet",
  "strength": "500mg",
  "rxRequired": false
}
```

### Create Composition (Admin)
```http
POST /api/admin/compositions
```

**Body**:
```json
{
  "name": "Paracetamol",
  "synonyms": ["Acetaminophen"],
  "atcCode": "N02BE01",
  "description": "Analgesic and antipyretic"
}
```

### Create DDI Rule (Admin)
```http
POST /api/admin/ddi
```

**Body**:
```json
{
  "compA": "composition_id_1",
  "compB": "composition_id_2",
  "severity": "major",
  "description": "Risk of bleeding",
  "recommendation": "Monitor INR closely"
}
```

### Get All DDI Rules (Admin)
```http
GET /api/admin/ddi?page=1&limit=50
```

### Update DDI Rule (Admin)
```http
PATCH /api/admin/ddi/:ddiId
```

### Delete DDI Rule (Admin)
```http
DELETE /api/admin/ddi/:ddiId
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error message",
  "details": [...] // Optional, for validation errors
}
```

**Common HTTP Status Codes**:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (e.g., appointment time conflict, duplicate)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

---

## Rate Limits

- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- Search endpoints: 200 requests per 15 minutes
- Prescription creation: 50 requests per hour

---

## Webhooks

### Clerk Webhook
```http
POST /api/webhooks/clerk
```

**Events handled**:
- `user.created`
- `user.updated`
- `user.deleted`

**Signature Verification**: Uses Svix headers for verification
