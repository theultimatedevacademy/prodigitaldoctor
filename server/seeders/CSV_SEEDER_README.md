# CSV Seeder for Medications and Compositions

## Overview
This seeder reads CSV files from the `server/data` folder and populates the MongoDB database with medications and compositions.

## Prerequisites

Install the required CSV parsing package:
```bash
npm install csv-parse
```

## CSV File Structure

### 1. compositions.csv
Located at: `server/data/compositions.csv`

**Required columns:**
- `name` - Composition name (required)
- `description` - Description of the composition (optional)

**Example:**
```csv
name,description
Paracetamol,Analgesic and antipyretic
Ibuprofen,NSAID - pain and inflammation
```

### 2. medication.csv
Located at: `server/data/medication.csv`

**Columns:**
- `brandName` - Brand/trade name
- `genericName` - Generic name
- `exact_composition` - Raw composition string (e.g., "Paracetamol 500mg")
- `form` - Form (Tablet, Capsule, Syrup, etc.)
- `manufacturer` - Manufacturer name
- `substitutes` - Semicolon-separated list of substitute brand names
- `sideEffects` - Side effects description
- `usage` - Therapeutic usage
- `chemicalClass` - Chemical classification
- `habitForming` - Yes/No or TRUE/FALSE
- `therapeuticClass` - Therapeutic classification
- `actionClass` - Action classification
- `unique_composition` - Semicolon-separated composition names (must match names in compositions.csv)

**Example:**
```csv
brandName,genericName,exact_composition,form,manufacturer,substitutes,sideEffects,usage,chemicalClass,habitForming,therapeuticClass,actionClass,unique_composition
Crocin,Paracetamol,Paracetamol 500mg,Tablet,GSK,Dolo 650;Calpol,Nausea...,Pain relief,Para-aminophenol derivative,No,Analgesic,Non-narcotic analgesic,Paracetamol
```

## How It Works

1. **Reads compositions.csv** - Creates all composition documents first
2. **Creates composition map** - Maps composition names to MongoDB ObjectIds
3. **Reads medication.csv** - Creates medication documents
4. **Links compositions** - Uses the composition map to link medications to compositions via `unique_composition` field
5. **Links substitutes** - Second pass to link substitute medications by matching brand names

## Running the Seeder

### Using npm script (recommended):
```bash
npm run seed:csv
```

### Direct execution:
```bash
node server/seeders/csvSeeder.js
```

## Important Notes

### ⚠️ Warning
- **This seeder CLEARS existing data** before importing
- All existing medications and compositions will be deleted
- Make sure to backup your database if needed

### 📝 Field Parsing

**habitForming field:**
- Accepts: `Yes`, `yes`, `TRUE`, `true`, `1` as true
- Everything else is treated as false

**unique_composition field:**
- Semicolon-separated composition names
- Example: `Paracetamol;Caffeine`
- Must match composition names in compositions.csv exactly

**substitutes field:**
- Semicolon-separated brand names
- Example: `Dolo 650;Calpol;Crocin`
- Linking happens in second pass after all medications are created

### 🐛 Troubleshooting

**Missing compositions error:**
If you see warnings about missing compositions:
- Check that composition names in `unique_composition` column match exactly with names in `compositions.csv`
- Names are case-sensitive
- Check for extra spaces or special characters

**Substitutes not linking:**
- Ensure substitute brand names match exactly with brand names in the medication.csv
- Check for spelling errors

**File not found errors:**
- Ensure CSV files are in `server/data/` folder
- File names must be exactly: `compositions.csv` and `medication.csv`

## Output

The seeder provides detailed progress logs:
```
🌱 Starting CSV seeding...
============================================================
✅ Connected to MongoDB

📦 Seeding compositions...
   Found 1913 compositions in CSV
   Cleared existing compositions
   Created 100 compositions...
   Created 200 compositions...
   ...
✅ Created 1913 compositions (skipped 0)

💊 Seeding medications...
   Found 250154 medications in CSV
   Cleared existing medications
   Created 1000 medications...
   Created 2000 medications...
   ...
✅ Created 250154 medications (skipped 0)

🔗 Linking substitute medications...
✅ Linked substitutes for 12345 medications

============================================================
🎉 SEEDING COMPLETED SUCCESSFULLY!
============================================================
📊 Summary:
   - Compositions: 1913
   - Medications: 250154
============================================================

✨ Database seeded from CSV files!
```

## Performance

- Large CSV files (100k+ rows) may take several minutes
- Progress is logged every 100 compositions and every 1000 medications
- Consider running during off-peak hours for production databases

## Database Schema

After seeding, your collections will have:

**Composition:**
```javascript
{
  name: String,
  description: String,
  createdAt: Date
}
```

**Medication:**
```javascript
{
  brandName: String,
  genericName: String,
  unique_composition: [ObjectId], // References to Composition
  exact_composition: String,
  form: String,
  manufacturer: String,
  substitutes: [ObjectId], // References to other Medications
  sideEffects: String,
  usage: String,
  chemicalClass: String,
  habitForming: Boolean,
  therapeuticClass: String,
  actionClass: String,
  createdAt: Date
}
```
