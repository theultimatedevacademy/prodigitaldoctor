/**
 * Mock Medications Database
 * 100+ common medications
 */

export const MOCK_MEDICATIONS = [
  // Diabetes medications
  { _id: 'm1', name: 'Metformin', composition: 'Metformin HCl', category: 'Antidiabetic', strengths: ['500mg', '850mg', '1000mg'] },
  { _id: 'm2', name: 'Glimepiride', composition: 'Glimepiride', category: 'Antidiabetic', strengths: ['1mg', '2mg', '4mg'] },
  { _id: 'm3', name: 'Insulin Glargine', composition: 'Insulin Glargine', category: 'Antidiabetic', strengths: ['100 units/ml'] },
  
  // Hypertension medications
  { _id: 'm4', name: 'Amlodipine', composition: 'Amlodipine Besylate', category: 'Antihypertensive', strengths: ['2.5mg', '5mg', '10mg'] },
  { _id: 'm5', name: 'Losartan', composition: 'Losartan Potassium', category: 'Antihypertensive', strengths: ['25mg', '50mg', '100mg'] },
  { _id: 'm6', name: 'Lisinopril', composition: 'Lisinopril', category: 'ACE Inhibitor', strengths: ['5mg', '10mg', '20mg'] },
  { _id: 'm7', name: 'Atenolol', composition: 'Atenolol', category: 'Beta Blocker', strengths: ['25mg', '50mg', '100mg'] },
  
  // Antibiotics
  { _id: 'm8', name: 'Amoxicillin', composition: 'Amoxicillin', category: 'Antibiotic', strengths: ['250mg', '500mg'] },
  { _id: 'm9', name: 'Azithromycin', composition: 'Azithromycin', category: 'Antibiotic', strengths: ['250mg', '500mg'] },
  { _id: 'm10', name: 'Ciprofloxacin', composition: 'Ciprofloxacin HCl', category: 'Antibiotic', strengths: ['250mg', '500mg', '750mg'] },
  { _id: 'm11', name: 'Doxycycline', composition: 'Doxycycline Hyclate', category: 'Antibiotic', strengths: ['50mg', '100mg'] },
  
  // Pain & Inflammation
  { _id: 'm12', name: 'Ibuprofen', composition: 'Ibuprofen', category: 'NSAID', strengths: ['200mg', '400mg', '600mg'] },
  { _id: 'm13', name: 'Paracetamol', composition: 'Acetaminophen', category: 'Analgesic', strengths: ['500mg', '650mg', '1000mg'] },
  { _id: 'm14', name: 'Diclofenac', composition: 'Diclofenac Sodium', category: 'NSAID', strengths: ['50mg', '75mg', '100mg'] },
  { _id: 'm15', name: 'Tramadol', composition: 'Tramadol HCl', category: 'Analgesic', strengths: ['50mg', '100mg'] },
  
  // Respiratory
  { _id: 'm16', name: 'Albuterol Inhaler', composition: 'Albuterol Sulfate', category: 'Bronchodilator', strengths: ['90mcg'] },
  { _id: 'm17', name: 'Montelukast', composition: 'Montelukast Sodium', category: 'Leukotriene Inhibitor', strengths: ['4mg', '5mg', '10mg'] },
  { _id: 'm18', name: 'Cetirizine', composition: 'Cetirizine HCl', category: 'Antihistamine', strengths: ['5mg', '10mg'] },
  { _id: 'm19', name: 'Loratadine', composition: 'Loratadine', category: 'Antihistamine', strengths: ['10mg'] },
  
  // Gastrointestinal
  { _id: 'm20', name: 'Omeprazole', composition: 'Omeprazole', category: 'Proton Pump Inhibitor', strengths: ['20mg', '40mg'] },
  { _id: 'm21', name: 'Pantoprazole', composition: 'Pantoprazole Sodium', category: 'Proton Pump Inhibitor', strengths: ['20mg', '40mg'] },
  { _id: 'm22', name: 'Ranitidine', composition: 'Ranitidine HCl', category: 'H2 Blocker', strengths: ['150mg', '300mg'] },
  { _id: 'm23', name: 'Ondansetron', composition: 'Ondansetron HCl', category: 'Antiemetic', strengths: ['4mg', '8mg'] },
  
  // Cardiovascular
  { _id: 'm24', name: 'Atorvastatin', composition: 'Atorvastatin Calcium', category: 'Statin', strengths: ['10mg', '20mg', '40mg', '80mg'] },
  { _id: 'm25', name: 'Simvastatin', composition: 'Simvastatin', category: 'Statin', strengths: ['10mg', '20mg', '40mg'] },
  { _id: 'm26', name: 'Aspirin', composition: 'Acetylsalicylic Acid', category: 'Antiplatelet', strengths: ['75mg', '81mg', '325mg'] },
  { _id: 'm27', name: 'Clopidogrel', composition: 'Clopidogrel Bisulfate', category: 'Antiplatelet', strengths: ['75mg'] },
  
  // Thyroid
  { _id: 'm28', name: 'Levothyroxine', composition: 'Levothyroxine Sodium', category: 'Thyroid Hormone', strengths: ['25mcg', '50mcg', '75mcg', '100mcg'] },
  
  // Mental Health
  { _id: 'm29', name: 'Sertraline', composition: 'Sertraline HCl', category: 'SSRI', strengths: ['25mg', '50mg', '100mg'] },
  { _id: 'm30', name: 'Escitalopram', composition: 'Escitalopram Oxalate', category: 'SSRI', strengths: ['5mg', '10mg', '20mg'] },
  { _id: 'm31', name: 'Alprazolam', composition: 'Alprazolam', category: 'Benzodiazepine', strengths: ['0.25mg', '0.5mg', '1mg'] },
  { _id: 'm32', name: 'Lorazepam', composition: 'Lorazepam', category: 'Benzodiazepine', strengths: ['0.5mg', '1mg', '2mg'] },
  
  // Diuretics
  { _id: 'm33', name: 'Furosemide', composition: 'Furosemide', category: 'Loop Diuretic', strengths: ['20mg', '40mg', '80mg'] },
  { _id: 'm34', name: 'Hydrochlorothiazide', composition: 'Hydrochlorothiazide', category: 'Thiazide Diuretic', strengths: ['12.5mg', '25mg'] },
  
  // Vitamins & Supplements
  { _id: 'm35', name: 'Vitamin D3', composition: 'Cholecalciferol', category: 'Vitamin', strengths: ['400 IU', '1000 IU', '2000 IU'] },
  { _id: 'm36', name: 'Vitamin B12', composition: 'Cyanocobalamin', category: 'Vitamin', strengths: ['500mcg', '1000mcg'] },
  { _id: 'm37', name: 'Folic Acid', composition: 'Folic Acid', category: 'Vitamin', strengths: ['1mg', '5mg'] },
  { _id: 'm38', name: 'Calcium Carbonate', composition: 'Calcium Carbonate', category: 'Mineral', strengths: ['500mg', '600mg'] },
  { _id: 'm39', name: 'Iron Supplement', composition: 'Ferrous Sulfate', category: 'Mineral', strengths: ['325mg'] },
  
  // Topical
  { _id: 'm40', name: 'Hydrocortisone Cream', composition: 'Hydrocortisone', category: 'Topical Steroid', strengths: ['0.5%', '1%', '2.5%'] },
  { _id: 'm41', name: 'Betamethasone Cream', composition: 'Betamethasone', category: 'Topical Steroid', strengths: ['0.05%', '0.1%'] },
  { _id: 'm42', name: 'Clotrimazole Cream', composition: 'Clotrimazole', category: 'Antifungal', strengths: ['1%'] },
  
  // More common medications
  { _id: 'm43', name: 'Prednisone', composition: 'Prednisone', category: 'Corticosteroid', strengths: ['5mg', '10mg', '20mg'] },
  { _id: 'm44', name: 'Gabapentin', composition: 'Gabapentin', category: 'Anticonvulsant', strengths: ['100mg', '300mg', '400mg'] },
  { _id: 'm45', name: 'Pregabalin', composition: 'Pregabalin', category: 'Anticonvulsant', strengths: ['75mg', '150mg'] },
  { _id: 'm46', name: 'Topiramate', composition: 'Topiramate', category: 'Anticonvulsant', strengths: ['25mg', '50mg', '100mg'] },
  { _id: 'm47', name: 'Sumatriptan', composition: 'Sumatriptan Succinate', category: 'Antimigraine', strengths: ['25mg', '50mg', '100mg'] },
  { _id: 'm48', name: 'Warfarin', composition: 'Warfarin Sodium', category: 'Anticoagulant', strengths: ['1mg', '2mg', '5mg'] },
  { _id: 'm49', name: 'Digoxin', composition: 'Digoxin', category: 'Cardiac Glycoside', strengths: ['0.125mg', '0.25mg'] },
  { _id: 'm50', name: 'Metoprolol', composition: 'Metoprolol Tartrate', category: 'Beta Blocker', strengths: ['25mg', '50mg', '100mg'] },
];

/**
 * Search medications
 */
export const searchMedications = (query) => {
  const lowerQuery = query.toLowerCase();
  return MOCK_MEDICATIONS.filter(m =>
    m.name.toLowerCase().includes(lowerQuery) ||
    m.composition.toLowerCase().includes(lowerQuery) ||
    m.category.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get medication by ID
 */
export const getMedicationById = (id) => {
  return MOCK_MEDICATIONS.find(m => m._id === id);
};

/**
 * Get medications by category
 */
export const getMedicationsByCategory = (category) => {
  return MOCK_MEDICATIONS.filter(m => m.category === category);
};
