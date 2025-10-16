# Resume CSV Seeding Guide

## Your Current Situation

✅ **Compositions** - Seeded successfully  
⚠️ **Medications** - Partially seeded (~125,000 out of 250,154)  
❌ **Substitutes** - Not yet linked  
📝 **New Data** - Updated compositions.csv needs to be imported

## Solution: Resume Seeder

The resume seeder (`csvSeederResume.js`) can:
- ✅ Update compositions WITHOUT clearing medications
- ✅ Continue medication seeding (skips already created ones)
- ✅ Link substitutes after all medications are loaded
- ✅ Handle network interruptions gracefully

---

## Quick Start - Your Use Case

Based on your situation, run these commands in order:

### Step 1: Update Compositions (with new data)
```bash
npm run seed:compositions
```
This will:
- Add new compositions from compositions.csv
- Update descriptions of existing compositions
- NOT touch any medications

### Step 2: Resume Medication Seeding
```bash
npm run seed:csv-resume
```
Or just medications:
```bash
npm run seed:medications
```
This will:
- Skip the ~125,000 medications already created
- Continue from where it stopped
- Add remaining ~125,154 medications

### Step 3: Link Substitutes (after all medications are done)
```bash
npm run seed:link
```
This will:
- Find all medications with substitute references
- Link them by matching brand names
- Clean up temporary fields

---

## All Available Commands

### Full Resume (Recommended for your case)
```bash
npm run seed:csv-resume
```
Does: Compositions (upsert) + Medications (resume) + Link substitutes

### Compositions Only
```bash
npm run seed:compositions
```
Updates/adds compositions without touching medications

### Medications Only
```bash
npm run seed:medications
```
Resumes medication seeding, skips existing ones

### Link Substitutes Only
```bash
npm run seed:link
```
Links substitutes for all medications (run after medications are complete)

---

## How It Works

### Composition Upserting
- Finds composition by `name`
- If exists: Updates `description` if changed
- If new: Creates new composition
- **Does NOT delete** existing compositions

### Medication Resume
- Checks if medication already exists by:
  - `brandName` (exact match) OR
  - `genericName` + `exact_composition` combination
- If exists: Skips it
- If new: Creates it
- Stores substitute names in temporary `_substituteNames` field

### Substitute Linking
- Finds all medications with `_substituteNames` field
- Builds a map of all brand names → ObjectIds
- Matches substitute names to medications
- Updates `substitutes` field with ObjectIds
- Removes temporary `_substituteNames` field

---

## Progress Tracking

The seeder shows detailed progress:

```
📦 Upserting compositions (update/insert mode)...
   Found 1913 compositions in CSV
   Processed 100 compositions...
✅ Created 50 new, updated 1863, skipped 0

💊 Resuming medication seeding (skip existing mode)...
   Found 250154 medications in CSV
   Found 125000 existing medications in database
   Skipped 1000 existing medications...
   Created 1000 new medications (skipped 125000 existing)...
✅ Created 125154 new medications
   Already existed: 125000

🔗 Linking substitute medications...
   Found 50000 medications needing substitute links
   Building medication name map...
   Mapped 250154 brand names
   Processed 1000 medications...
✅ Linked substitutes for 48500 medications
```

---

## Network Error Handling

If the seeder encounters a network error:
- It will show progress before exiting
- You can run it again - it will skip what's already done
- Safe to run multiple times

Example:
```
❌ Network connection lost!
📊 Progress: Created 10500 new medications, 125000 already existed
💡 Run this script again to resume from where it left off
```

Just run the same command again!

---

## Verification

After seeding completes, verify with:

```bash
# In MongoDB shell or Compass
db.compositions.countDocuments()  // Should show total compositions
db.medications.countDocuments()   // Should show ~250,154
db.medications.countDocuments({ substitutes: { $ne: [] } })  // Count with substitutes linked
```

Or check the final summary:
```
📊 Database Summary:
   - Total Compositions: 1913
   - Total Medications: 250154
   - New Medications Added: 125154
```

---

## Troubleshooting

### "Already exists" count seems wrong
- The seeder checks by `brandName` OR (`genericName` + `exact_composition`)
- If CSV has duplicates, they'll be counted as "already exists"

### Substitutes not linking
- Ensure all medications are seeded first
- Substitute names must match brand names exactly
- Run `npm run seed:link` after all medications are created

### Missing compositions warning
- Some medications reference compositions not in compositions.csv
- The medication will be created but without those composition links
- Add missing compositions to compositions.csv and re-run

### Network keeps disconnecting
- Run in smaller batches (modify the code to limit CSV rows)
- Or run during stable network hours
- The resume feature lets you continue safely

---

## Direct Command (No NPM)

```bash
# Full resume
node server/seeders/csvSeederResume.js

# Compositions only
node server/seeders/csvSeederResume.js --compositions-only

# Medications only  
node server/seeders/csvSeederResume.js --medications-only

# Link only
node server/seeders/csvSeederResume.js --link-only
```

---

## Important Notes

⚠️ **The resume seeder does NOT clear existing data**
- Original seeder (`csvSeeder.js`) clears everything first
- Resume seeder (`csvSeederResume.js`) is additive/update mode

✅ **Safe to run multiple times**
- Compositions: Updates existing, adds new
- Medications: Skips existing, adds new
- Linking: Re-processes all that need linking

🔄 **When to use which seeder**
- **Fresh start / Reset**: Use `npm run seed:csv` (clears all)
- **Resume / Update**: Use `npm run seed:csv-resume` (keeps existing)
