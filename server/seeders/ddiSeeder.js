/**
 * DDI (Drug-Drug Interactions) CSV Seeder
 * Imports drug interaction data from db_drug_interactions.csv
 * 
 * Run: node server/seeders/ddiSeeder.js [--append]
 * Use --append to add to existing DDI data instead of clearing first
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import connectDB from '../config/db.js';
import DDI from '../models/ddi.js';
import Composition from '../models/composition.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

// Parse command line arguments
const args = process.argv.slice(2);
const appendMode = args.includes('--append');

/**
 * Parse CSV file
 */
function parseCSV(filePath) {
  console.log(`📖 Reading CSV file: ${filePath}`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  return records;
}

/**
 * Infer severity from interaction description
 */
function inferSeverity(description) {
  if (!description) return 'unknown';
  
  const desc = description.toLowerCase();
  
  // Contraindicated patterns
  if (desc.includes('contraindicated') || 
      desc.includes('should not be') ||
      desc.includes('must not be') ||
      desc.includes('avoid') ||
      desc.includes('do not use')) {
    return 'contraindicated';
  }
  
  // Major patterns
  if (desc.includes('serious') ||
      desc.includes('severe') ||
      desc.includes('significant') ||
      desc.includes('toxic') ||
      desc.includes('dangerous') ||
      desc.includes('life-threatening')) {
    return 'major';
  }
  
  // Moderate patterns
  if (desc.includes('increase') ||
      desc.includes('decrease') ||
      desc.includes('may enhance') ||
      desc.includes('may reduce') ||
      desc.includes('monitor')) {
    return 'moderate';
  }
  
  // Minor patterns
  if (desc.includes('minor') ||
      desc.includes('slight') ||
      desc.includes('negligible')) {
    return 'minor';
  }
  
  return 'unknown';
}

/**
 * Seed DDI data from CSV
 */
async function seedDDI() {
  try {
    console.log('🌱 Starting DDI CSV Seeder...\n');
    console.log('='.repeat(60));
    
    if (appendMode) {
      console.log('MODE: Append (add to existing data)');
    } else {
      console.log('MODE: Replace (clear existing data)');
    }
    console.log('='.repeat(60));
    console.log('');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB\n');
    
    // Check if CSV file exists
    const ddiPath = path.join(dataDir, 'db_drug_interactions.csv');
    if (!fs.existsSync(ddiPath)) {
      console.error(`❌ File not found: ${ddiPath}`);
      process.exit(1);
    }
    
    // Parse CSV
    const ddiData = parseCSV(ddiPath);
    console.log(`   Found ${ddiData.length} interactions in CSV\n`);
    
    // Build composition map from database
    console.log('📦 Loading compositions from database...');
    const compositions = await Composition.find({});
    const compositionMap = {};
    compositions.forEach(comp => {
      compositionMap[comp.name.toLowerCase().trim()] = comp._id;
    });
    console.log(`   Loaded ${Object.keys(compositionMap).length} compositions\n`);
    
    // Clear existing DDI data if not in append mode
    if (!appendMode) {
      console.log('🗑️  Clearing existing DDI data...');
      await DDI.deleteMany({});
      console.log('✅ Cleared existing DDI data\n');
    }
    
    // Process interactions
    console.log('💊 Processing drug interactions...');
    let createdCount = 0;
    let skippedCount = 0;
    let duplicateCount = 0;
    let missingCompositions = new Set();
    const batchSize = 100;
    let batch = [];
    
    for (let i = 0; i < ddiData.length; i++) {
      const row = ddiData[i];
      
      // Skip if missing required fields
      if (!row['Drug 1'] || !row['Drug 2'] || !row['Interaction Description']) {
        skippedCount++;
        continue;
      }
      
      // Look up compositions
      const drug1Name = row['Drug 1'].toLowerCase().trim();
      const drug2Name = row['Drug 2'].toLowerCase().trim();
      
      const comp1Id = compositionMap[drug1Name];
      const comp2Id = compositionMap[drug2Name];
      
      if (!comp1Id) {
        missingCompositions.add(row['Drug 1']);
        skippedCount++;
        continue;
      }
      
      if (!comp2Id) {
        missingCompositions.add(row['Drug 2']);
        skippedCount++;
        continue;
      }
      
      // Normalize order (compA < compB) - will be handled by pre-validate hook
      const [compA, compB] = [comp1Id.toString(), comp2Id.toString()].sort();
      
      // Infer severity from description
      const severity = inferSeverity(row['Interaction Description']);
      
      // Add to batch
      batch.push({
        compA: compA,
        compB: compB,
        severity: severity,
        description: row['Interaction Description'].trim(),
        recommendation: '', // Not in CSV
        references: [],
        createdAt: new Date(),
      });
      
      // Insert batch when it reaches batchSize
      if (batch.length >= batchSize) {
        try {
          await DDI.insertMany(batch, { ordered: false }); // ordered: false continues on duplicate key errors
          createdCount += batch.length;
        } catch (error) {
          // Count duplicates from bulk write error
          if (error.code === 11000 && error.writeErrors) {
            duplicateCount += error.writeErrors.length;
            createdCount += batch.length - error.writeErrors.length;
          } else if (error.code === 11000) {
            duplicateCount += batch.length;
          } else {
            console.error('Error inserting batch:', error.message);
            skippedCount += batch.length;
          }
        }
        batch = [];
        
        if ((createdCount + duplicateCount) % 10000 === 0) {
          console.log(`   Processed ${createdCount + duplicateCount + skippedCount} interactions (created: ${createdCount}, duplicates: ${duplicateCount})...`);
        }
      }
    }
    
    // Insert remaining batch
    if (batch.length > 0) {
      try {
        await DDI.insertMany(batch, { ordered: false });
        createdCount += batch.length;
      } catch (error) {
        if (error.code === 11000 && error.writeErrors) {
          duplicateCount += error.writeErrors.length;
          createdCount += batch.length - error.writeErrors.length;
        } else if (error.code === 11000) {
          duplicateCount += batch.length;
        } else {
          console.error('Error inserting final batch:', error.message);
          skippedCount += batch.length;
        }
      }
    }
    
    console.log(`\n✅ DDI Processing Complete!`);
    console.log(`   - Created: ${createdCount}`);
    console.log(`   - Duplicates (skipped): ${duplicateCount}`);
    console.log(`   - Missing compositions: ${skippedCount}`);
    
    if (missingCompositions.size > 0) {
      console.log(`\n⚠️  Warning: ${missingCompositions.size} composition(s) not found in database:`);
      const missingArray = Array.from(missingCompositions).slice(0, 20);
      missingArray.forEach(name => console.log(`   - ${name}`));
      if (missingCompositions.size > 20) {
        console.log(`   ... and ${missingCompositions.size - 20} more`);
      }
      console.log(`\n💡 Tip: Add missing compositions to compositions.csv and re-seed compositions`);
    }
    
    // Final count
    const totalDDI = await DDI.countDocuments();
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DDI SEEDING COMPLETED!');
    console.log('='.repeat(60));
    console.log(`📊 Database Summary:`);
    console.log(`   - Total DDI Rules: ${totalDDI}`);
    console.log(`   - New Rules Added: ${createdCount}`);
    console.log('='.repeat(60));
    console.log('\n✨ DDI database updated!\n');
    
    // Severity breakdown
    console.log('📊 Severity Breakdown:');
    const severityStats = await DDI.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    severityStats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count}`);
    });
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding DDI:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

seedDDI();
