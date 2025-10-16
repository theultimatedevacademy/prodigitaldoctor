# DDI (Drug-Drug Interactions) Seeding Guide

## Overview

This guide explains how to seed drug-drug interaction data from your `db_drug_interactions.csv` file into the MongoDB database.

---

## What Changed

### 1. **DDI Model Updated**

Added support for `"unknown"` severity level:

```javascript
severity: {
  type: String,
  enum: ["minor", "moderate", "major", "contraindicated", "unknown"],
  default: "unknown"
}
```

**Severity Hierarchy (for UI sorting):**
1. `contraindicated` - Most severe, avoid combination
2. `major` - Serious interaction, requires close monitoring
3. `moderate` - May require dosage adjustment
4. `minor` - Clinically insignificant
5. `unknown` - Severity not determined (auto-inferred from description)

### 2. **DDI Seeder Created**

Located at: `server/seeders/ddiSeeder.js`

**Features:**
- ✅ Reads from `db_drug_interactions.csv`
- ✅ Maps drug names to compositions in your database
- ✅ Auto-infers severity from interaction description
- ✅ Handles duplicates gracefully (unique index on compA + compB)
- ✅ Batch processing for performance (100 records per batch)
- ✅ Shows missing composition warnings
- ✅ Provides severity breakdown statistics

### 3. **DDI Engine Updated**

Updated severity ordering to include `"unknown"` level in sorting logic.

---

## CSV File Structure

**Location:** `server/data/db_drug_interactions.csv`

**Required Columns:**
- `Drug 1` - Name of first drug/composition
- `Drug 2` - Name of second drug/composition  
- `Interaction Description` - Description of the interaction

**Example:**
```csv
Drug 1,Drug 2,Interaction Description
Paracetamol,Warfarin,Paracetamol may increase the anticoagulant activities of Warfarin.
Aspirin,Ibuprofen,Ibuprofen may reduce antiplatelet effect of low-dose aspirin
Metformin,Atorvastatin,The risk or severity of adverse effects can be increased when Metformin is combined with Atorvastatin.
```

---

## How It Works

### Step 1: Load Compositions
- Loads all compositions from your database
- Creates a map: `drug name (lowercase)` → `composition ObjectId`

### Step 2: Process CSV Rows
For each interaction:
1. Look up both drugs in the composition map
2. Skip if either drug not found (logs warning)
3. Normalize order (compA < compB) - handled by model hook
4. Auto-infer severity from description text
5. Create DDI record

### Step 3: Severity Inference

The seeder intelligently infers severity from the interaction description:

| Severity | Keywords Detected |
|----------|-------------------|
| **contraindicated** | contraindicated, should not be, must not be, avoid, do not use |
| **major** | serious, severe, significant, toxic, dangerous, life-threatening |
| **moderate** | increase, decrease, may enhance, may reduce, monitor |
| **minor** | minor, slight, negligible |
| **unknown** | (default if no patterns match) |

**Example:**
- "Aspirin may increase the risk of bleeding" → `moderate`
- "Severe interaction detected, avoid use" → `major`
- "Contraindicated in combination" → `contraindicated`

### Step 4: Handle Duplicates
- Uses batch insert with `{ ordered: false }`
- Continues inserting even if duplicates found
- Counts and reports duplicate entries

---

## Running the Seeder

### Replace Mode (Default - Clears existing DDI)
```bash
npm run seed:ddi
```

**What it does:**
- ❌ Deletes ALL existing DDI records
- ✅ Imports all interactions from CSV
- ✅ Best for fresh start or complete replacement

### Append Mode (Add to existing DDI)
```bash
npm run seed:ddi-append
```

**What it does:**
- ✅ Keeps existing DDI records
- ✅ Adds new interactions from CSV
- ⚠️ Skips duplicates (based on compA + compB unique index)
- ✅ Best for adding more interactions without losing manual entries

### Direct Command
```bash
# Replace mode
node server/seeders/ddiSeeder.js

# Append mode
node server/seeders/ddiSeeder.js --append
```

---

## Expected Output

```
🌱 Starting DDI CSV Seeder...

============================================================
MODE: Replace (clear existing data)
============================================================

✅ Connected to MongoDB

📖 Reading CSV file: .../server/data/db_drug_interactions.csv
   Found 191543 interactions in CSV

📦 Loading compositions from database...
   Loaded 2681 compositions

🗑️  Clearing existing DDI data...
✅ Cleared existing DDI data

💊 Processing drug interactions...
   Processed 10000 interactions (created: 9850, duplicates: 0)...
   Processed 20000 interactions (created: 19700, duplicates: 0)...
   ...

✅ DDI Processing Complete!
   - Created: 185430
   - Duplicates (skipped): 0
   - Missing compositions: 6113

⚠️  Warning: 2450 composition(s) not found in database:
   - Verteporfin
   - Trioxsalen
   - Titanium dioxide
   ... and 2447 more

💡 Tip: Add missing compositions to compositions.csv and re-seed compositions

============================================================
🎉 DDI SEEDING COMPLETED!
============================================================
📊 Database Summary:
   - Total DDI Rules: 185430
   - New Rules Added: 185430
============================================================

✨ DDI database updated!

📊 Severity Breakdown:
   - moderate: 125000
   - unknown: 45000
   - major: 10000
   - minor: 4500
   - contraindicated: 930
```

---

## Handling Missing Compositions

If you see warnings about missing compositions:

### Option 1: Add Missing Compositions

1. Add the missing drug names to your `compositions.csv`
2. Re-run composition seeder:
   ```bash
   npm run seed:compositions
   ```
3. Re-run DDI seeder in append mode:
   ```bash
   npm run seed:ddi-append
   ```

### Option 2: Accept Data Loss

Some drugs in the interaction CSV may not be in your medication database. This is OK if:
- They're specialized/rare drugs not in your formulary
- They're supplements or non-prescription items you don't track
- They're outdated drug names

---

## Verifying the Import

### Check Total Count
```javascript
// In MongoDB shell or Compass
db.ddis.countDocuments()
```

### Check Severity Distribution
```javascript
db.ddis.aggregate([
  { $group: { _id: '$severity', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

### Sample Random Interactions
```javascript
db.ddis.aggregate([
  { $sample: { size: 10 } },
  { $lookup: { from: 'compositions', localField: 'compA', foreignField: '_id', as: 'drugA' } },
  { $lookup: { from: 'compositions', localField: 'compB', foreignField: '_id', as: 'drugB' } }
])
```

### Check for Specific Drug Interaction
```javascript
// Find interaction between two drugs
const paracetamol = db.compositions.findOne({ name: 'Paracetamol' });
const warfarin = db.compositions.findOne({ name: 'Warfarin' });

db.ddis.findOne({
  $or: [
    { compA: paracetamol._id, compB: warfarin._id },
    { compA: warfarin._id, compB: paracetamol._id }
  ]
})
```

---

## Performance Notes

- **Large files**: Your 191k+ interactions will take several minutes
- **Batch processing**: Inserts 100 records at a time for optimal speed
- **Progress logging**: Updates every 10,000 records
- **Memory usage**: Efficient streaming, won't overwhelm memory

**Typical Performance:**
- ~1,000 interactions per second
- ~190 seconds for 190k interactions
- ~3-5 minutes total including lookups and duplicate checking

---

## Troubleshooting

### "File not found" Error
- Ensure file is at: `server/data/db_drug_interactions.csv`
- Check exact filename (case-sensitive on Linux/Mac)

### Many Missing Compositions
- Your CSV has drug names not in your composition database
- Run composition seeder first: `npm run seed:compositions`
- Check that drug names match exactly (case-insensitive matching used)

### High Duplicate Count
- You ran the seeder multiple times in append mode
- This is safe - duplicates are skipped due to unique index
- To clean up, run in replace mode: `npm run seed:ddi`

### Network Errors During Import
- The seeder processes in batches
- You may lose the current batch (~100 records)
- Just re-run with `--append` flag to continue

### Wrong Severity Inferred
- The auto-inference is heuristic-based
- You can manually update severity via API or admin UI
- Or improve the `inferSeverity()` function in `ddiSeeder.js`

---

## API Integration

After seeding, DDI checking works automatically:

### Check DDI for Medications
```javascript
POST /api/medications/check-ddi
{
  "medicationIds": ["med1_id", "med2_id", "med3_id"]
}
```

### Response
```json
{
  "warnings": [
    {
      "severity": "major",
      "text": "Aspirin may increase the risk of bleeding when combined with Warfarin",
      "compA": { "name": "Aspirin", ... },
      "compB": { "name": "Warfarin", ... },
      "recommendation": "Monitor INR closely"
    }
  ]
}
```

Warnings are automatically sorted by severity (contraindicated → major → moderate → minor → unknown).

---

## Next Steps

After seeding DDI data:

1. ✅ **Test DDI Checking**: Create a prescription with interacting medications
2. ✅ **Update UI**: Display severity badges with appropriate colors
3. ✅ **Add Overrides**: Implement doctor override workflow for major/contraindicated interactions
4. ✅ **Admin UI**: Create interface to view/edit/add DDI rules
5. ✅ **Audit Logs**: Track when doctors override DDI warnings

---

## Recommended Seeding Order

For a complete database setup:

```bash
# 1. Seed compositions first
npm run seed:compositions

# 2. Seed medications (will take longest)
npm run seed:csv-resume

# 3. Link substitutes
npm run seed:link

# 4. Seed DDI data
npm run seed:ddi

# 5. Seed users (if needed)
npm run seed:users
```

---

## Summary

✅ **DDI Model**: Updated with `"unknown"` severity  
✅ **DDI Seeder**: Created with auto-inference and batch processing  
✅ **DDI Engine**: Updated to handle new severity level  
✅ **NPM Scripts**: Added `seed:ddi` and `seed:ddi-append`  
✅ **Documentation**: This guide!

Your drug interaction database is now ready to help prevent adverse drug events! 🎉
