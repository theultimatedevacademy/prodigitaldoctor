/**
 * CSV Seeder for Medications and Compositions
 * Reads CSV files from server/data folder and seeds the database
 * 
 * Run: node server/seeders/csvSeeder.js
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import connectDB from '../config/db.js';
import Medication from '../models/medication.js';
import Composition from '../models/composition.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

/**
 * Parse CSV file
 */
function parseCSV(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  return records;
}

/**
 * Seed Compositions
 */
async function seedCompositions() {
  console.log('📦 Seeding compositions...');
  
  const compositionsPath = path.join(dataDir, 'compositions.csv');
  const compositionData = parseCSV(compositionsPath);
  
  console.log(`   Found ${compositionData.length} compositions in CSV`);
  
  // Clear existing compositions
  await Composition.deleteMany({});
  console.log('   Cleared existing compositions');
  
  // Create composition map
  const compositionMap = {};
  let createdCount = 0;
  let skippedCount = 0;
  
  for (const row of compositionData) {
    if (!row.name || row.name.trim() === '') {
      skippedCount++;
      continue;
    }
    
    try {
      const composition = await Composition.create({
        name: row.name.trim(),
        description: row.description ? row.description.trim() : '',
        createdAt: new Date(),
      });
      
      compositionMap[row.name.trim()] = composition._id;
      createdCount++;
      
      if (createdCount % 100 === 0) {
        console.log(`   Created ${createdCount} compositions...`);
      }
    } catch (error) {
      console.error(`   Error creating composition "${row.name}":`, error.message);
      skippedCount++;
    }
  }
  
  console.log(`✅ Created ${createdCount} compositions (skipped ${skippedCount})\n`);
  return compositionMap;
}

/**
 * Seed Medications
 */
async function seedMedications(compositionMap) {
  console.log('💊 Seeding medications...');
  
  const medicationsPath = path.join(dataDir, 'medication.csv');
  const medicationData = parseCSV(medicationsPath);
  
  console.log(`   Found ${medicationData.length} medications in CSV`);
  
  // Clear existing medications
  await Medication.deleteMany({});
  console.log('   Cleared existing medications');
  
  let createdCount = 0;
  let skippedCount = 0;
  let missingCompositions = new Set();
  
  for (const row of medicationData) {
    // Skip if no brand name or generic name
    if ((!row.brandName || row.brandName.trim() === '') && 
        (!row.genericName || row.genericName.trim() === '')) {
      skippedCount++;
      continue;
    }
    
    try {
      // Parse unique_composition field (semicolon-separated)
      let compositionIds = [];
      if (row.unique_composition && row.unique_composition.trim() !== '') {
        const compositionNames = row.unique_composition
          .split(';')
          .map(name => name.trim())
          .filter(name => name !== '');
        
        compositionIds = compositionNames
          .map(name => {
            if (!compositionMap[name]) {
              missingCompositions.add(name);
              return null;
            }
            return compositionMap[name];
          })
          .filter(id => id !== null);
      }
      
      // Parse substitutes (semicolon-separated) - will link later
      const substituteNames = row.substitutes && row.substitutes.trim() !== ''
        ? row.substitutes.split(';').map(s => s.trim()).filter(s => s !== '')
        : [];
      
      // Parse habitForming
      const habitForming = row.habitForming === 'Yes' || 
                          row.habitForming === 'yes' || 
                          row.habitForming === 'TRUE' || 
                          row.habitForming === 'true' ||
                          row.habitForming === '1';
      
      // Create medication
      const medication = await Medication.create({
        brandName: row.brandName ? row.brandName.trim() : '',
        genericName: row.genericName ? row.genericName.trim() : '',
        unique_composition: compositionIds,
        exact_composition: row.exact_composition ? row.exact_composition.trim() : '',
        form: row.form ? row.form.trim() : '',
        manufacturer: row.manufacturer ? row.manufacturer.trim() : '',
        substitutes: [], // Will populate in second pass
        sideEffects: row.sideEffects ? row.sideEffects.trim() : '',
        usage: row.usage ? row.usage.trim() : '',
        chemicalClass: row.chemicalClass ? row.chemicalClass.trim() : '',
        habitForming: habitForming,
        therapeuticClass: row.therapeuticClass ? row.therapeuticClass.trim() : '',
        actionClass: row.actionClass ? row.actionClass.trim() : '',
        createdAt: new Date(),
        _substituteNames: substituteNames, // Temporary field for linking
      });
      
      createdCount++;
      
      if (createdCount % 1000 === 0) {
        console.log(`   Created ${createdCount} medications...`);
      }
    } catch (error) {
      console.error(`   Error creating medication "${row.brandName || row.genericName}":`, error.message);
      skippedCount++;
    }
  }
  
  console.log(`✅ Created ${createdCount} medications (skipped ${skippedCount})`);
  
  if (missingCompositions.size > 0) {
    console.log(`⚠️  Warning: ${missingCompositions.size} composition(s) referenced but not found:`);
    const missingArray = Array.from(missingCompositions).slice(0, 10);
    missingArray.forEach(name => console.log(`   - ${name}`));
    if (missingCompositions.size > 10) {
      console.log(`   ... and ${missingCompositions.size - 10} more`);
    }
  }
  
  console.log('');
  return createdCount;
}

/**
 * Link Substitutes
 */
async function linkSubstitutes() {
  console.log('🔗 Linking substitute medications...');
  
  // Get all medications
  const allMedications = await Medication.find({});
  
  // Create brand name to ID map
  const medicationNameMap = {};
  allMedications.forEach(med => {
    if (med.brandName) {
      medicationNameMap[med.brandName] = med._id;
    }
  });
  
  let linkedCount = 0;
  let notFoundCount = 0;
  
  for (const med of allMedications) {
    if (med._substituteNames && med._substituteNames.length > 0) {
      const substituteIds = med._substituteNames
        .map(name => {
          if (!medicationNameMap[name]) {
            notFoundCount++;
            return null;
          }
          return medicationNameMap[name];
        })
        .filter(id => id !== null);
      
      if (substituteIds.length > 0) {
        await Medication.findByIdAndUpdate(med._id, {
          substitutes: substituteIds,
          $unset: { _substituteNames: "" }
        });
        linkedCount++;
      }
    }
  }
  
  console.log(`✅ Linked substitutes for ${linkedCount} medications`);
  if (notFoundCount > 0) {
    console.log(`⚠️  Warning: ${notFoundCount} substitute reference(s) not found`);
  }
  console.log('');
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  try {
    console.log('🌱 Starting CSV seeding...\n');
    console.log('='.repeat(60));
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB\n');
    
    // Check if CSV files exist
    const compositionsPath = path.join(dataDir, 'compositions.csv');
    const medicationsPath = path.join(dataDir, 'medication.csv');
    
    if (!fs.existsSync(compositionsPath)) {
      console.error(`❌ File not found: ${compositionsPath}`);
      process.exit(1);
    }
    
    if (!fs.existsSync(medicationsPath)) {
      console.error(`❌ File not found: ${medicationsPath}`);
      process.exit(1);
    }
    
    // Seed compositions first
    const compositionMap = await seedCompositions();
    
    // Seed medications
    const medicationCount = await seedMedications(compositionMap);
    
    // Link substitutes
    await linkSubstitutes();
    
    // Summary
    console.log('='.repeat(60));
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - Compositions: ${Object.keys(compositionMap).length}`);
    console.log(`   - Medications: ${medicationCount}`);
    console.log('='.repeat(60));
    console.log('\n✨ Database seeded from CSV files!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

seedDatabase();
