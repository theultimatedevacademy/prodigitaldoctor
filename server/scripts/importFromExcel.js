/**
 * Excel Import Script
 * Imports medications and compositions from Excel sheets
 * 
 * Install: npm install xlsx
 * Run: node server/scripts/importFromExcel.js path/to/excel.xlsx
 */

import dotenv from 'dotenv';
import XLSX from 'xlsx';
import connectDB from '../config/db.js';
import Medication from '../models/medication.js';
import Composition from '../models/composition.js';

dotenv.config();

async function importFromExcel(filePath) {
  try {
    console.log('📊 Starting Excel import...\n');

    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    
    // ===== Import Compositions =====
    console.log('📦 Importing compositions...');
    const compositionSheet = workbook.Sheets['Compositions'];
    if (!compositionSheet) {
      console.error('❌ Sheet "Compositions" not found in Excel file');
      process.exit(1);
    }
    
    const compositionData = XLSX.utils.sheet_to_json(compositionSheet);
    
    const compositionMap = {};
    for (const row of compositionData) {
      if (!row.name) continue;
      
      const composition = await Composition.findOneAndUpdate(
        { name: row.name },
        {
          name: row.name,
          description: row.description || '',
          createdAt: new Date(),
        },
        { upsert: true, new: true }
      );
      
      compositionMap[row.name] = composition._id;
    }
    console.log(`✅ Imported ${compositionData.length} compositions\n`);

    // ===== Import Medications =====
    console.log('💊 Importing medications...');
    const medicationSheet = workbook.Sheets['Medications'];
    if (!medicationSheet) {
      console.error('❌ Sheet "Medications" not found in Excel file');
      process.exit(1);
    }
    
    const medicationData = XLSX.utils.sheet_to_json(medicationSheet);
    
    let importedCount = 0;
    for (const row of medicationData) {
      if (!row.brandName && !row.genericName) continue;
      
      // Parse compositions
      const compositionNames = row.compositions ? row.compositions.split(';').map(s => s.trim()) : [];
      const compositionIds = compositionNames
        .map(name => compositionMap[name])
        .filter(Boolean);
      
      // Parse substitutes (we'll resolve after all medications are imported)
      const substituteNames = row.substitutes ? row.substitutes.split(';').map(s => s.trim()) : [];
      
      const medication = await Medication.create({
        brandName: row.brandName || '',
        genericName: row.genericName || '',
        unique_composition: compositionIds,
        exact_composition: row.exact_composition || '',
        form: row.form || '',
        manufacturer: row.manufacturer || '',
        substitutes: [], // Will be populated in second pass
        sideEffects: row.sideEffects || '',
        usage: row.usage || '',
        chemicalClass: row.chemicalClass || '',
        habitForming: row.habitForming === 'TRUE' || row.habitForming === true,
        therapeuticClass: row.therapeuticClass || '',
        actionClass: row.actionClass || '',
        createdAt: new Date(),
        _substituteNames: substituteNames, // Temporary field for processing
      });
      
      importedCount++;
    }
    console.log(`✅ Imported ${importedCount} medications\n`);

    // ===== Link Substitutes =====
    console.log('🔗 Linking substitute medications...');
    const allMedications = await Medication.find({});
    const medicationNameMap = {};
    
    allMedications.forEach(med => {
      if (med.brandName) medicationNameMap[med.brandName] = med._id;
    });
    
    let linkedCount = 0;
    for (const med of allMedications) {
      if (med._substituteNames && med._substituteNames.length > 0) {
        const substituteIds = med._substituteNames
          .map(name => medicationNameMap[name])
          .filter(Boolean);
        
        if (substituteIds.length > 0) {
          await Medication.findByIdAndUpdate(med._id, {
            substitutes: substituteIds,
            $unset: { _substituteNames: "" }
          });
          linkedCount++;
        }
      }
    }
    console.log(`✅ Linked substitutes for ${linkedCount} medications\n`);

    // ===== Summary =====
    console.log('='.repeat(60));
    console.log('🎉 IMPORT COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - Compositions: ${compositionData.length}`);
    console.log(`   - Medications: ${importedCount}`);
    console.log(`   - Substitutes linked: ${linkedCount}`);
    console.log('='.repeat(60));
    console.log('\n✨ Your database is now populated with Excel data!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing from Excel:', error);
    process.exit(1);
  }
}

const filePath = process.argv[2];
if (!filePath) {
  console.error('❌ Please provide Excel file path');
  console.log('Usage: node server/scripts/importFromExcel.js path/to/excel.xlsx');
  process.exit(1);
}

importFromExcel(filePath);
