/**
 * Medication and Composition Seeder
 * Seeds common medications, compositions, and DDI rules
 */

import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Medication from '../models/medication.js';
import Composition from '../models/composition.js';
import DDI from '../models/ddi.js';

dotenv.config();

// Sample compositions (active ingredients)
const compositions = [
  { name: 'Paracetamol', description: 'Analgesic and antipyretic' },
  { name: 'Ibuprofen', description: 'NSAID - pain and inflammation' },
  { name: 'Amoxicillin', description: 'Antibiotic - penicillin group' },
  { name: 'Metformin', description: 'Antidiabetic - biguanide' },
  { name: 'Aspirin', description: 'NSAID - antiplatelet' },
  { name: 'Omeprazole', description: 'Proton pump inhibitor' },
  { name: 'Atorvastatin', description: 'Statin - cholesterol lowering' },
  { name: 'Amlodipine', description: 'Calcium channel blocker - antihypertensive' },
  { name: 'Salbutamol', description: 'Beta-2 agonist - bronchodilator' },
  { name: 'Cetirizine', description: 'Antihistamine' },
  { name: 'Diclofenac', description: 'NSAID - pain and inflammation' },
  { name: 'Azithromycin', description: 'Antibiotic - macrolide' },
  { name: 'Losartan', description: 'Angiotensin II receptor blocker' },
  { name: 'Levothyroxine', description: 'Thyroid hormone' },
  { name: 'Warfarin', description: 'Anticoagulant' },
];

// Sample medications with new fields
const medications = [
  { 
    brandName: 'Crocin', 
    genericName: 'Paracetamol', 
    exact_composition: 'Paracetamol 500mg',
    form: 'Tablet', 
    manufacturer: 'GSK',
    usage: 'Treatment of mild to moderate pain and fever',
    sideEffects: 'Nausea, skin rash (rare), liver damage (overdose)',
    chemicalClass: 'Para-aminophenol derivative',
    habitForming: false,
    therapeuticClass: 'Analgesic, Antipyretic',
    actionClass: 'Non-narcotic analgesic'
  },
  { 
    brandName: 'Dolo 650', 
    genericName: 'Paracetamol', 
    exact_composition: 'Paracetamol 650mg',
    form: 'Tablet', 
    manufacturer: 'Micro Labs',
    usage: 'Treatment of mild to moderate pain and fever',
    sideEffects: 'Nausea, skin rash (rare), liver damage (overdose)',
    chemicalClass: 'Para-aminophenol derivative',
    habitForming: false,
    therapeuticClass: 'Analgesic, Antipyretic',
    actionClass: 'Non-narcotic analgesic'
  },
  { 
    brandName: 'Brufen', 
    genericName: 'Ibuprofen', 
    exact_composition: 'Ibuprofen 400mg',
    form: 'Tablet', 
    manufacturer: 'Abbott',
    usage: 'Pain relief, inflammation reduction, fever',
    sideEffects: 'Stomach upset, heartburn, dizziness, headache',
    chemicalClass: 'Propionic acid derivative',
    habitForming: false,
    therapeuticClass: 'NSAID',
    actionClass: 'COX-1 and COX-2 inhibitor'
  },
  { 
    brandName: 'Moxikind', 
    genericName: 'Amoxicillin', 
    exact_composition: 'Amoxicillin 500mg',
    form: 'Capsule', 
    manufacturer: 'Mankind Pharma',
    usage: 'Bacterial infections',
    sideEffects: 'Diarrhea, nausea, rash, allergic reactions',
    chemicalClass: 'Beta-lactam antibiotic',
    habitForming: false,
    therapeuticClass: 'Antibiotic',
    actionClass: 'Penicillin-type antibiotic'
  },
  { 
    brandName: 'Glycomet', 
    genericName: 'Metformin', 
    exact_composition: 'Metformin 500mg',
    form: 'Tablet', 
    manufacturer: 'USV Ltd',
    usage: 'Type 2 diabetes management',
    sideEffects: 'Nausea, diarrhea, stomach upset, vitamin B12 deficiency',
    chemicalClass: 'Biguanide',
    habitForming: false,
    therapeuticClass: 'Antidiabetic',
    actionClass: 'Insulin sensitizer'
  },
  { 
    brandName: 'Disprin', 
    genericName: 'Aspirin', 
    exact_composition: 'Aspirin 75mg',
    form: 'Tablet', 
    manufacturer: 'Reckitt Benckiser',
    usage: 'Pain relief, fever, inflammation, blood clot prevention',
    sideEffects: 'Stomach irritation, bleeding risk, nausea',
    chemicalClass: 'Salicylate',
    habitForming: false,
    therapeuticClass: 'NSAID, Antiplatelet',
    actionClass: 'COX inhibitor, antiplatelet'
  },
];

// Sample DDI rules (drug interactions)
const ddiRules = [
  {
    comp1Name: 'Aspirin',
    comp2Name: 'Warfarin',
    severity: 'major',
    description: 'Increased risk of bleeding when aspirin is combined with warfarin',
    recommendation: 'Monitor INR closely. Consider alternative analgesic.',
  },
  {
    comp1Name: 'Ibuprofen',
    comp2Name: 'Aspirin',
    severity: 'moderate',
    description: 'Ibuprofen may reduce antiplatelet effect of low-dose aspirin',
    recommendation: 'Take aspirin at least 2 hours before ibuprofen if both are needed.',
  },
  {
    comp1Name: 'Metformin',
    comp2Name: 'Ibuprofen',
    severity: 'moderate',
    description: 'NSAIDs may decrease kidney function affecting metformin clearance',
    recommendation: 'Monitor kidney function. Use lowest effective dose of NSAID.',
  },
  {
    comp1Name: 'Warfarin',
    comp2Name: 'Omeprazole',
    severity: 'moderate',
    description: 'Omeprazole may increase warfarin levels',
    recommendation: 'Monitor INR when starting or stopping omeprazole.',
  },
  {
    comp1Name: 'Atorvastatin',
    comp2Name: 'Amlodipine',
    severity: 'minor',
    description: 'Amlodipine may increase atorvastatin levels slightly',
    recommendation: 'Usually safe to use together. Monitor for muscle pain.',
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting medication seeding...\n');

    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await DDI.deleteMany({});
    await Medication.deleteMany({});
    await Composition.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Seed compositions
    console.log('📦 Seeding compositions...');
    const createdCompositions = await Composition.insertMany(compositions);
    console.log(`✅ Created ${createdCompositions.length} compositions\n`);

    // Create composition name-to-ID map
    const compositionMap = {};
    createdCompositions.forEach(comp => {
      compositionMap[comp.name] = comp._id;
    });

    // Seed medications with composition references
    console.log('💊 Seeding medications...');
    const medicationsWithComps = medications.map(med => {
      const compName = med.genericName;
      const compId = compositionMap[compName];
      
      return {
        ...med,
        unique_composition: compId ? [compId] : [],
        createdAt: new Date(),
      };
    });

    const createdMedications = await Medication.insertMany(medicationsWithComps);
    console.log(`✅ Created ${createdMedications.length} medications\n`);

    // Seed DDI rules
    console.log('⚠️  Seeding DDI rules...');
    const ddiWithIds = ddiRules.map(rule => {
      const compA = compositionMap[rule.comp1Name];
      const compB = compositionMap[rule.comp2Name];

      if (!compA || !compB) {
        console.warn(`⚠️  Skipping DDI rule: ${rule.comp1Name} - ${rule.comp2Name} (composition not found)`);
        return null;
      }

      // Normalize order (compA < compB)
      const [normalizedA, normalizedB] = [compA.toString(), compB.toString()].sort();

      return {
        compA: normalizedA,
        compB: normalizedB,
        severity: rule.severity,
        description: rule.description,
        recommendation: rule.recommendation,
        references: [],
      };
    }).filter(Boolean);

    const createdDDI = await DDI.insertMany(ddiWithIds);
    console.log(`✅ Created ${createdDDI.length} DDI rules\n`);

    // Summary
    console.log('='.repeat(60));
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - Compositions: ${createdCompositions.length}`);
    console.log(`   - Medications: ${createdMedications.length}`);
    console.log(`   - DDI Rules: ${createdDDI.length}`);
    console.log('='.repeat(60));
    console.log('\n✨ You can now search medications and check DDI in the app!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
