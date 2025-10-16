/**
 * Resume CSV Seeder for Medications and Compositions
 * Can continue seeding after interruption and update compositions without clearing medications
 * 
 * Run: node server/seeders/csvSeederResume.js [--compositions-only] [--medications-only] [--link-only]
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

// Parse command line arguments
const args = process.argv.slice(2);
const compositionsOnly = args.includes('--compositions-only');
const medicationsOnly = args.includes('--medications-only');
const linkOnly = args.includes('--link-only');

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
 * Seed or Update Compositions (UPSERT mode - doesn't clear existing)
 * COMMENTED OUT - Not updating compositions from CSV
 */
// async function upsertCompositions() {
//   console.log('📦 Upserting compositions (update/insert mode)...');
//   
//   const compositionsPath = path.join(dataDir, 'compositions.csv');
//   const compositionData = parseCSV(compositionsPath);
//   
//   console.log(`   Found ${compositionData.length} compositions in CSV`);
//   
//   // Don't clear - just upsert
//   const compositionMap = {};
//   let createdCount = 0;
//   let updatedCount = 0;
//   let skippedCount = 0;
//   
//   for (const row of compositionData) {
//     if (!row.name || row.name.trim() === '') {
//       skippedCount++;
//       continue;
//     }
//     
//     try {
//       // Find and update, or create new
//       const existing = await Composition.findOne({ name: row.name.trim() });
//       
//       if (existing) {
//         // Update if description changed
//         if (row.description && row.description.trim() !== existing.description) {
//           existing.description = row.description.trim();
//           await existing.save();
//           updatedCount++;
//         }
//         compositionMap[row.name.trim()] = existing._id;
//       } else {
//         // Create new
//         const composition = await Composition.create({
//           name: row.name.trim(),
//           description: row.description ? row.description.trim() : '',
//           createdAt: new Date(),
//         });
//         compositionMap[row.name.trim()] = composition._id;
//         createdCount++;
//       }
//       
//       const totalProcessed = createdCount + updatedCount + skippedCount;
//       if (totalProcessed % 100 === 0) {
//         console.log(`   Processed ${totalProcessed} compositions...`);
//       }
//     } catch (error) {
//       console.error(`   Error upserting composition "${row.name}":`, error.message);
//       skippedCount++;
//     }
//   }
//   
//   console.log(`✅ Created ${createdCount} new, updated ${updatedCount}, skipped ${skippedCount}\n`);
//   return compositionMap;
// }

/**
 * Seed Medications (RESUME mode - skips existing)
 */
async function resumeMedications(compositionMap) {
  console.log('💊 Resuming medication seeding (skip existing mode)...');
  
  const medicationsPath = path.join(dataDir, 'medication.csv');
  const medicationData = parseCSV(medicationsPath);
  
  console.log(`   Found ${medicationData.length} medications in CSV`);
  
  // Count existing medications
  const existingCount = await Medication.countDocuments();
  console.log(`   Found ${existingCount} existing medications in database`);
  
  let createdCount = 0;
  let skippedCount = 0;
  let alreadyExistsCount = 0;
  let missingCompositions = new Set();
  
  for (const row of medicationData) {
    // Skip if no brand name or generic name
    if ((!row.brandName || row.brandName.trim() === '') && 
        (!row.genericName || row.genericName.trim() === '')) {
      skippedCount++;
      continue;
    }
    
    try {
      // Check if medication already exists (by brandName or genericName + exact_composition)
      const existingMed = await Medication.findOne({
        $or: [
          { brandName: row.brandName ? row.brandName.trim() : null },
          { 
            genericName: row.genericName ? row.genericName.trim() : null,
            exact_composition: row.exact_composition ? row.exact_composition.trim() : null
          }
        ]
      });
      
      if (existingMed) {
        alreadyExistsCount++;
        if (alreadyExistsCount % 1000 === 0) {
          console.log(`   Skipped ${alreadyExistsCount} existing medications...`);
        }
        continue;
      }
      
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
      await Medication.create({
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
        console.log(`   Created ${createdCount} new medications (skipped ${alreadyExistsCount} existing)...`);
      }
    } catch (error) {
      console.error(`   Error creating medication "${row.brandName || row.genericName}":`, error.message);
      skippedCount++;
      
      // If network error, save progress and exit
      if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
        console.error('\n❌ Network connection lost!');
        console.log(`📊 Progress: Created ${createdCount} new medications, ${alreadyExistsCount} already existed`);
        console.log('💡 Run this script again to resume from where it left off');
        process.exit(1);
      }
    }
  }
  
  console.log(`✅ Created ${createdCount} new medications`);
  console.log(`   Already existed: ${alreadyExistsCount}`);
  console.log(`   Skipped/errors: ${skippedCount}`);
  
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
  
  // Get all medications that have _substituteNames field
  const medicationsNeedingLinks = await Medication.find({ 
    _substituteNames: { $exists: true, $ne: [] } 
  });
  
  console.log(`   Found ${medicationsNeedingLinks.length} medications needing substitute links`);
  
  if (medicationsNeedingLinks.length === 0) {
    console.log('   No medications need linking (all done or none have substitutes)');
    console.log('');
    return;
  }
  
  // Create brand name to ID map for ALL medications
  console.log('   Building medication name map...');
  const allMedications = await Medication.find({}, { brandName: 1 });
  const medicationNameMap = {};
  allMedications.forEach(med => {
    if (med.brandName) {
      medicationNameMap[med.brandName] = med._id;
    }
  });
  console.log(`   Mapped ${Object.keys(medicationNameMap).length} brand names`);
  
  let linkedCount = 0;
  let notFoundCount = 0;
  let processedCount = 0;
  
  for (const med of medicationsNeedingLinks) {
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
      } else {
        // No valid substitutes found, just remove the field
        await Medication.findByIdAndUpdate(med._id, {
          $unset: { _substituteNames: "" }
        });
      }
      
      processedCount++;
      if (processedCount % 1000 === 0) {
        console.log(`   Processed ${processedCount} medications...`);
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
    console.log('🌱 Starting Resume CSV Seeder...\n');
    console.log('='.repeat(60));
    
    if (compositionsOnly) {
      console.log('MODE: Compositions only');
    } else if (medicationsOnly) {
      console.log('MODE: Medications only');
    } else if (linkOnly) {
      console.log('MODE: Link substitutes only');
    } else {
      console.log('MODE: Full resume (compositions + medications + linking)');
    }
    console.log('='.repeat(60));
    console.log('');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB\n');
    
    let compositionMap = {};
    let medicationCount = 0;
    
    // Upsert compositions (COMMENTED OUT - Not updating from CSV)
    // if (!medicationsOnly && !linkOnly) {
    //   const compositionsPath = path.join(dataDir, 'compositions.csv');
    //   if (!fs.existsSync(compositionsPath)) {
    //     console.error(`❌ File not found: ${compositionsPath}`);
    //     process.exit(1);
    //   }
    //   compositionMap = await upsertCompositions();
    // } else {
      // Build composition map from database
      console.log('📦 Loading compositions from database...');
      const compositions = await Composition.find({});
      compositions.forEach(comp => {
        compositionMap[comp.name] = comp._id;
      });
      console.log(`   Loaded ${Object.keys(compositionMap).length} compositions\n`);
    // }
    
    // Resume medications (unless compositions-only or link-only)
    if (!compositionsOnly && !linkOnly) {
      const medicationsPath = path.join(dataDir, 'medication.csv');
      if (!fs.existsSync(medicationsPath)) {
        console.error(`❌ File not found: ${medicationsPath}`);
        process.exit(1);
      }
      medicationCount = await resumeMedications(compositionMap);
    }
    
    // Link substitutes (unless compositions-only)
    if (!compositionsOnly) {
      await linkSubstitutes();
    }
    
    // Final count
    const totalCompositions = await Composition.countDocuments();
    const totalMedications = await Medication.countDocuments();
    
    // Summary
    console.log('='.repeat(60));
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`📊 Database Summary:`);
    console.log(`   - Total Compositions: ${totalCompositions}`);
    console.log(`   - Total Medications: ${totalMedications}`);
    if (!compositionsOnly && !linkOnly) {
      console.log(`   - New Medications Added: ${medicationCount}`);
    }
    console.log('='.repeat(60));
    console.log('\n✨ Database updated from CSV files!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

seedDatabase();
