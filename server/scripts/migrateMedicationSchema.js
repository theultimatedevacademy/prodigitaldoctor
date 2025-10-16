/**
 * Database Migration Script
 * Removes old fields and adds new fields to Medication and Composition schemas
 * 
 * Run with: node server/scripts/migrateMedicationSchema.js
 */

import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Medication from '../models/medication.js';
import Composition from '../models/composition.js';

dotenv.config();

async function migrateMedicationSchema() {
  try {
    console.log('🔄 Starting schema migration...\n');

    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // ===== Migrate Composition Schema =====
    console.log('📦 Migrating Composition schema...');
    
    // Remove old fields from Composition
    const compositionResult = await Composition.updateMany(
      {},
      {
        $unset: {
          synonyms: "",
          atcCode: ""
        }
      }
    );
    
    console.log(`✅ Updated ${compositionResult.modifiedCount} composition documents\n`);

    // ===== Migrate Medication Schema =====
    console.log('💊 Migrating Medication schema...');
    
    // Rename compositions to unique_composition and add new fields
    const medicationResult = await Medication.updateMany(
      {},
      {
        $rename: {
          compositions: 'unique_composition'
        },
        $set: {
          exact_composition: ''
        }
      }
    );
    
    console.log(`✅ Updated ${medicationResult.modifiedCount} medication documents\n`);

    // ===== Summary =====
    console.log('='.repeat(60));
    console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - Compositions updated: ${compositionResult.modifiedCount}`);
    console.log(`   - Medications updated: ${medicationResult.modifiedCount}`);
    console.log('='.repeat(60));
    console.log('\n✨ Schema migration complete!\n');
    console.log('⚠️  Note: New fields are set to empty/default values.');
    console.log('   You need to populate them via seeding or manual updates.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

migrateMedicationSchema();
