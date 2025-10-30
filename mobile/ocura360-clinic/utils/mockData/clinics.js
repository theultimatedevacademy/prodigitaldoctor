/**
 * Mock Clinics Data
 * 3+ clinics with different user roles
 */

export const MOCK_CLINICS = [
  {
    _id: 'clinic1',
    name: 'Main Medical Clinic',
    address: '123 Healthcare Ave, New York, NY 10001',
    phone: '+1234567890',
    email: 'contact@mainmedical.com',
    logo: null,
    userRole: 'clinic_owner',
    doctors: ['d1', 'd2'],
    staff: ['s1', 's2'],
    subscription: {
      plan: 'professional',
      status: 'active',
      expiresAt: '2024-12-31',
    },
    createdAt: '2023-01-15',
  },
  {
    _id: 'clinic2',
    name: 'Downtown Health Center',
    address: '456 Medical Plaza, Brooklyn, NY 11201',
    phone: '+1234567891',
    email: 'info@downtownhealth.com',
    logo: null,
    userRole: 'doctor',
    doctors: ['d1', 'd3'],
    staff: ['s3'],
    subscription: {
      plan: 'basic',
      status: 'active',
      expiresAt: '2024-10-15',
    },
    createdAt: '2023-06-20',
  },
  {
    _id: 'clinic3',
    name: 'Family Care Clinic',
    address: '789 Wellness St, Queens, NY 11354',
    phone: '+1234567892',
    email: 'hello@familycare.com',
    logo: null,
    userRole: 'staff',
    doctors: ['d2', 'd4'],
    staff: ['s1', 's4'],
    subscription: {
      plan: 'professional',
      status: 'active',
      expiresAt: '2025-03-30',
    },
    createdAt: '2023-03-10',
  },
];

export const MOCK_DOCTORS = [
  { _id: 'd1', name: 'Dr. Sarah Smith', specialization: 'General Medicine', phone: '+1234567800' },
  { _id: 'd2', name: 'Dr. John Williams', specialization: 'Internal Medicine', phone: '+1234567801' },
  { _id: 'd3', name: 'Dr. Emily Brown', specialization: 'Pediatrics', phone: '+1234567802' },
  { _id: 'd4', name: 'Dr. Michael Davis', specialization: 'Cardiology', phone: '+1234567803' },
];

export const MOCK_STAFF = [
  { _id: 's1', name: 'Alice Johnson', role: 'staff', email: 'alice@clinic.com', phone: '+1234567810' },
  { _id: 's2', name: 'Bob Martinez', role: 'staff', email: 'bob@clinic.com', phone: '+1234567811' },
  { _id: 's3', name: 'Carol White', role: 'staff', email: 'carol@clinic.com', phone: '+1234567812' },
  { _id: 's4', name: 'David Lee', role: 'staff', email: 'david@clinic.com', phone: '+1234567813' },
];

/**
 * Get clinic by ID
 */
export const getClinicById = (id) => {
  return MOCK_CLINICS.find(c => c._id === id);
};

/**
 * Get doctors by clinic ID
 */
export const getDoctorsByClinic = (clinicId) => {
  const clinic = getClinicById(clinicId);
  if (!clinic) return [];
  return MOCK_DOCTORS.filter(d => clinic.doctors.includes(d._id));
};

/**
 * Get staff by clinic ID
 */
export const getStaffByClinic = (clinicId) => {
  const clinic = getClinicById(clinicId);
  if (!clinic) return [];
  return MOCK_STAFF.filter(s => clinic.staff.includes(s._id));
};
