/**
 * User Seeder Script
 * Imports test users into the database
 * Run with: npm run seed:users
 */

import dotenv from "dotenv";
import connectDB from "../config/db.js";
import { User } from "../models/index.js";
import testUsers from "../data/users.js";

// Load environment variables
dotenv.config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Optional: Clear existing test users
    const testClerkIds = testUsers.map((user) => user.clerkId);
    const deletedCount = await User.deleteMany({
      clerkId: { $in: testClerkIds },
    });
    console.log(`🗑️  Removed ${deletedCount.deletedCount} existing test users`);

    // Insert test users
    const insertedUsers = await User.insertMany(testUsers);
    console.log(`✨ Successfully seeded ${insertedUsers.length} test users:`);

    // Display seeded users
    insertedUsers.forEach((user) => {
      console.log(
        `   - ${user.name} (${user.roles.join(", ")}) - ${user.email}`
      );
    });

    console.log("\n🎉 User seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding users:", error.message);
    process.exit(1);
  }
};

// Run the seeder
seedUsers();
