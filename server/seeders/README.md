# Database Seeders

This directory contains seeder scripts to populate your MongoDB database with test data for development and testing.

## Available Seeders

### User Seeder (`userSeeder.js`)

Seeds the database with 5 test users covering all major roles in the application.

**Usage:**
```bash
npm run seed:users
```

**Test Users Created:**
- 1 Patient
- 1 Assistant (Staff)
- 1 Doctor
- 1 Doctor + Clinic Owner
- 1 Admin

**Features:**
- ✅ Automatically removes existing test users before seeding (idempotent)
- ✅ Uses predefined Clerk IDs for consistency
- ✅ Includes realistic Indian phone numbers
- ✅ Doctor profiles include qualifications, specializations, and HPR IDs
- ✅ Provides detailed console output

## How Seeders Work

1. **Connect to Database** - Uses the same `connectDB()` function as the main server
2. **Clean Existing Data** - Removes test data by matching predefined IDs (prevents duplicates)
3. **Insert New Data** - Uses Mongoose `insertMany()` for efficient bulk insertion
4. **Verify & Exit** - Displays success message and exits process

## Creating New Seeders

To create a new seeder (e.g., for clinics, medications):

1. **Create the seeder file** in `server/seeders/`:
   ```javascript
   import dotenv from "dotenv";
   import connectDB from "../config/db.js";
   import { YourModel } from "../models/index.js";
   import testData from "../data/yourData.js";
   
   dotenv.config();
   
   const seedYourData = async () => {
     try {
       await connectDB();
       console.log("✅ Connected to MongoDB");
       
       // Clear existing test data
       await YourModel.deleteMany({ /* your filter */ });
       
       // Insert new data
       const inserted = await YourModel.insertMany(testData);
       console.log(`✨ Seeded ${inserted.length} items`);
       
       process.exit(0);
     } catch (error) {
       console.error("❌ Error:", error.message);
       process.exit(1);
     }
   };
   
   seedYourData();
   ```

2. **Create test data file** in `server/data/`:
   ```javascript
   const testData = [
     { /* your test data */ },
   ];
   
   export default testData;
   ```

3. **Add npm script** in `package.json`:
   ```json
   "seed:yourdata": "node server/seeders/yourDataSeeder.js"
   ```

## Best Practices

- ✅ Always use `dotenv.config()` to load environment variables
- ✅ Include descriptive console logs for user feedback
- ✅ Use `process.exit(0)` on success and `process.exit(1)` on error
- ✅ Make seeders idempotent (can be run multiple times safely)
- ✅ Use unique identifiers to distinguish test data from production data
- ✅ Include error handling for database operations

## Running All Seeders

You can create a master seeder script to run all seeders in sequence:

```bash
# Future implementation
npm run seed:all
```

## Important Notes

⚠️ **Never run seeders in production** - These scripts delete data and are meant for development only

⚠️ **Check your `.env` file** - Ensure `MONGO_URI` points to your development database

⚠️ **Test users have fixed IDs** - The Clerk IDs in test users are for development only and won't work with actual Clerk authentication
