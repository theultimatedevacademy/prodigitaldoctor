/**
 * Fix Duplicate Emails Script
 * 
 * This script:
 * 1. Finds and removes duplicate email entries
 * 2. Rebuilds the email unique index
 * 
 * Run: node server/scripts/fixDuplicateEmails.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.js';

// Load environment variables
dotenv.config();

const fixDuplicateEmails = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGO_URI environment variable is not set');
      console.log('Please check your .env file has MONGO_URI defined');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Step 1: Find duplicate emails
    console.log('\n🔍 Searching for duplicate emails...');
    
    const duplicates = await User.aggregate([
      {
        $match: {
          email: { $ne: null, $exists: true }
        }
      },
      {
        $group: {
          _id: '$email',
          count: { $sum: 1 },
          users: { $push: { _id: '$_id', clerkId: '$clerkId', createdAt: '$createdAt' } }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    if (duplicates.length === 0) {
      console.log('✅ No duplicate emails found!');
    } else {
      console.log(`⚠️  Found ${duplicates.length} duplicate email(s):\n`);
      
      // Show duplicates
      duplicates.forEach((dup, index) => {
        console.log(`${index + 1}. Email: ${dup._id} (${dup.count} occurrences)`);
        dup.users.forEach((user, i) => {
          console.log(`   ${i === 0 ? '✅ Keep' : '❌ Remove'}: ${user.clerkId} (created: ${user.createdAt})`);
        });
      });

      console.log('\n📝 Removing duplicates (keeping the oldest record)...');

      // Remove duplicates (keep oldest, remove newer ones)
      for (const dup of duplicates) {
        // Sort by createdAt (oldest first)
        const sortedUsers = dup.users.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );

        // Keep the first one, remove the rest
        for (let i = 1; i < sortedUsers.length; i++) {
          await User.findByIdAndDelete(sortedUsers[i]._id);
          console.log(`   ❌ Deleted user: ${sortedUsers[i].clerkId}`);
        }
      }

      console.log('\n✅ Duplicates removed!');
    }

    // Step 2: Drop existing email index if it exists
    console.log('\n🔧 Rebuilding email index...');
    
    try {
      const indexes = await User.collection.getIndexes();
      
      // Drop old email index if it exists
      if (indexes.email_1) {
        await User.collection.dropIndex('email_1');
        console.log('   🗑️  Dropped old email index');
      }
    } catch (err) {
      // Index might not exist, that's okay
      console.log('   ℹ️  No existing email index to drop');
    }

    // Step 3: Create new unique sparse index
    await User.collection.createIndex(
      { email: 1 }, 
      { 
        unique: true, 
        sparse: true,
        name: 'email_unique_sparse'
      }
    );
    console.log('   ✅ Created new unique sparse email index');

    // Step 4: Verify the fix
    console.log('\n🔍 Verifying...');
    const totalUsers = await User.countDocuments();
    const usersWithEmail = await User.countDocuments({ email: { $ne: null, $exists: true } });
    const uniqueEmails = await User.distinct('email', { email: { $ne: null, $exists: true } });

    console.log(`   📊 Total users: ${totalUsers}`);
    console.log(`   📧 Users with email: ${usersWithEmail}`);
    console.log(`   ✅ Unique emails: ${uniqueEmails.length}`);

    if (usersWithEmail === uniqueEmails.length) {
      console.log('\n✅ SUCCESS! All emails are now unique.');
    } else {
      console.log('\n⚠️  WARNING: Some duplicates might still exist.');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('\n👋 Done! Database connection closed.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the script
fixDuplicateEmails();
