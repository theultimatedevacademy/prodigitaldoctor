/**
 * Seed All Data
 * Runs all seeders in sequence
 */

import { execSync } from 'child_process';

console.log('🌱 Starting complete database seeding...\n');

try {
  // Seed users
  console.log('👥 Seeding users...');
  execSync('node server/seeders/userSeeder.js', { stdio: 'inherit' });
  
  // Seed medications
  console.log('\n💊 Seeding medications and compositions...');
  execSync('node server/seeders/medicationSeeder.js', { stdio: 'inherit' });
  
  console.log('\n🎉 All seeding completed successfully!');
} catch (error) {
  console.error('❌ Error running seeders:', error.message);
  process.exit(1);
}
