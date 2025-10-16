/**
 * Rebuild MongoDB Indexes
 * Drops old indexes and creates new ones based on current schema
 * 
 * Run: node server/scripts/rebuildIndexes.js
 */

import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Medication from '../models/medication.js';
import Composition from '../models/composition.js';
import DDI from '../models/ddi.js';

dotenv.config();

async function rebuildIndexes() {
  try {
    console.log('🔧 Starting index rebuild...\n');
    console.log('='.repeat(60));
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB\n');
    
    // Rebuild Medication indexes
    console.log('💊 Rebuilding Medication indexes...');
    try {
      await Medication.collection.dropIndexes();
      console.log('   Dropped old indexes');
    } catch (error) {
      console.log('   No indexes to drop or error:', error.message);
    }
    
    await Medication.syncIndexes();
    console.log('✅ Medication indexes rebuilt\n');
    
    // Show Medication indexes
    const medicationIndexes = await Medication.collection.getIndexes();
    console.log('📋 Medication Indexes:');
    Object.keys(medicationIndexes).forEach(indexName => {
      console.log(`   - ${indexName}`);
    });
    console.log('');
    
    // Rebuild Composition indexes
    console.log('📦 Rebuilding Composition indexes...');
    try {
      await Composition.collection.dropIndexes();
      console.log('   Dropped old indexes');
    } catch (error) {
      console.log('   No indexes to drop or error:', error.message);
    }
    
    await Composition.syncIndexes();
    console.log('✅ Composition indexes rebuilt\n');
    
    // Rebuild DDI indexes
    console.log('⚠️  Rebuilding DDI indexes...');
    try {
      await DDI.collection.dropIndexes();
      console.log('   Dropped old indexes');
    } catch (error) {
      console.log('   No indexes to drop or error:', error.message);
    }
    
    await DDI.syncIndexes();
    console.log('✅ DDI indexes rebuilt\n');
    
    // Summary
    console.log('='.repeat(60));
    console.log('🎉 INDEX REBUILD COMPLETED!');
    console.log('='.repeat(60));
    console.log('\n✨ All indexes have been rebuilt successfully!\n');
    console.log('💡 Tip: Indexes improve query performance significantly.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error rebuilding indexes:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

rebuildIndexes();
