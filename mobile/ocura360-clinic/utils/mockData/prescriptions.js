/**
 * Mock Prescriptions Data
 * 15+ prescription records
 */

export const MOCK_PRESCRIPTIONS = [
  {
    _id: 'rx1',
    patient: 'p2',
    patientName: 'Jane Smith',
    doctor: 'd1',
    doctorName: 'Dr. Sarah Smith',
    appointment: 'apt2',
    clinic: 'clinic1',
    date: '2024-03-20',
    diagnosis: 'Type 2 Diabetes - Well controlled',
    clinicalNotes: 'Blood sugar levels stable, continue current medication',
    medications: [
      {
        drug: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '30 days',
        instructions: 'Take with meals',
      },
    ],
    createdAt: '2024-03-20',
  },
  {
    _id: 'rx2',
    patient: 'p2',
    patientName: 'Jane Smith',
    doctor: 'd1',
    doctorName: 'Dr. Sarah Smith',
    appointment: 'apt2',
    clinic: 'clinic1',
    date: '2024-03-20',
    diagnosis: 'Type 2 Diabetes',
    clinicalNotes: 'Additional medication for better control',
    medications: [
      {
        drug: 'Glimepiride',
        dosage: '2mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take before breakfast',
      },
    ],
    createdAt: '2024-03-20',
  },
  {
    _id: 'rx3',
    patient: 'p3',
    patientName: 'Michael Johnson',
    doctor: 'd2',
    doctorName: 'Dr. John Williams',
    appointment: 'apt3',
    clinic: 'clinic1',
    date: '2024-03-20',
    diagnosis: 'Hypertension',
    clinicalNotes: 'BP slightly elevated, adjust medication dosage',
    medications: [
      {
        drug: 'Amlodipine',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take in the morning',
      },
      {
        drug: 'Losartan',
        dosage: '50mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take with or without food',
      },
    ],
    createdAt: '2024-03-20',
  },
  {
    _id: 'rx4',
    patient: 'p6',
    patientName: 'Sarah Brown',
    doctor: 'd1',
    doctorName: 'Dr. Sarah Smith',
    appointment: 'apt6',
    clinic: 'clinic1',
    date: '2024-03-19',
    diagnosis: 'Asthma - Controlled',
    clinicalNotes: 'No recent attacks, continue inhaler as needed',
    medications: [
      {
        drug: 'Albuterol Inhaler',
        dosage: '90mcg',
        frequency: 'As needed',
        duration: '90 days',
        instructions: '2 puffs when needed for breathing difficulty',
      },
    ],
    createdAt: '2024-03-19',
  },
  {
    _id: 'rx5',
    patient: 'p8',
    patientName: 'Lisa Anderson',
    doctor: 'd1',
    doctorName: 'Dr. Sarah Smith',
    appointment: 'apt8',
    clinic: 'clinic1',
    date: '2024-03-18',
    diagnosis: 'Hypothyroidism',
    clinicalNotes: 'TSH levels normal, continue current dosage',
    medications: [
      {
        drug: 'Levothyroxine',
        dosage: '75mcg',
        frequency: 'Once daily',
        duration: '90 days',
        instructions: 'Take on empty stomach in the morning',
      },
    ],
    createdAt: '2024-03-18',
  },
  {
    _id: 'rx6',
    patient: 'p10',
    patientName: 'Patricia Thomas',
    doctor: 'd1',
    doctorName: 'Dr. Sarah Smith',
    appointment: 'apt10',
    clinic: 'clinic1',
    date: '2024-03-17',
    diagnosis: 'Chronic Migraine',
    clinicalNotes: 'Reduced frequency of attacks, continue preventive medication',
    medications: [
      {
        drug: 'Topiramate',
        dosage: '50mg',
        frequency: 'Twice daily',
        duration: '30 days',
        instructions: 'Take with food',
      },
      {
        drug: 'Sumatriptan',
        dosage: '50mg',
        frequency: 'As needed',
        duration: '30 days',
        instructions: 'Take at onset of migraine',
      },
    ],
    createdAt: '2024-03-17',
  },
  {
    _id: 'rx7',
    patient: 'p12',
    patientName: 'Jennifer White',
    doctor: 'd1',
    doctorName: 'Dr. Sarah Smith',
    appointment: 'apt12',
    clinic: 'clinic1',
    date: '2024-03-16',
    diagnosis: 'Allergic Dermatitis',
    clinicalNotes: 'Mild inflammation observed, topical steroid prescribed',
    medications: [
      {
        drug: 'Hydrocortisone Cream',
        dosage: '1%',
        frequency: 'Twice daily',
        duration: '14 days',
        instructions: 'Apply thin layer to affected areas',
      },
      {
        drug: 'Cetirizine',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '14 days',
        instructions: 'Take at bedtime',
      },
    ],
    createdAt: '2024-03-16',
  },
  {
    _id: 'rx8',
    patient: 'p14',
    patientName: 'Nancy Clark',
    doctor: 'd1',
    doctorName: 'Dr. Sarah Smith',
    appointment: 'apt14',
    clinic: 'clinic1',
    date: '2024-03-15',
    diagnosis: 'Osteoporosis',
    clinicalNotes: 'Bone density stable, continue calcium and vitamin D',
    medications: [
      {
        drug: 'Calcium Carbonate',
        dosage: '600mg',
        frequency: 'Twice daily',
        duration: '90 days',
        instructions: 'Take with meals',
      },
      {
        drug: 'Vitamin D3',
        dosage: '1000 IU',
        frequency: 'Once daily',
        duration: '90 days',
        instructions: 'Take with food',
      },
    ],
    createdAt: '2024-03-15',
  },
  {
    _id: 'rx9',
    patient: 'p18',
    patientName: 'Betty Allen',
    doctor: 'd1',
    doctorName: 'Dr. Sarah Smith',
    appointment: 'apt18',
    clinic: 'clinic1',
    date: '2024-03-13',
    diagnosis: 'Hyperlipidemia',
    clinicalNotes: 'Lipid panel improved, continue statin therapy',
    medications: [
      {
        drug: 'Atorvastatin',
        dosage: '20mg',
        frequency: 'Once daily',
        duration: '90 days',
        instructions: 'Take at bedtime',
      },
    ],
    createdAt: '2024-03-13',
  },
  {
    _id: 'rx10',
    patient: 'p20',
    patientName: 'Dorothy King',
    doctor: 'd1',
    doctorName: 'Dr. Sarah Smith',
    appointment: 'apt20',
    clinic: 'clinic1',
    date: '2024-03-12',
    diagnosis: 'CKD Stage 3',
    clinicalNotes: 'Creatinine levels stable, continue current regimen',
    medications: [
      {
        drug: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take in the morning',
      },
      {
        drug: 'Furosemide',
        dosage: '40mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take in the morning',
      },
    ],
    createdAt: '2024-03-12',
  },
];

/**
 * Get prescription by ID
 */
export const getPrescriptionById = (id) => {
  return MOCK_PRESCRIPTIONS.find(p => p._id === id);
};

/**
 * Get prescriptions by patient ID
 */
export const getPrescriptionsByPatient = (patientId) => {
  return MOCK_PRESCRIPTIONS.filter(p => p.patient === patientId);
};

/**
 * Get prescriptions by appointment ID
 */
export const getPrescriptionsByAppointment = (appointmentId) => {
  return MOCK_PRESCRIPTIONS.filter(p => p.appointment === appointmentId);
};
