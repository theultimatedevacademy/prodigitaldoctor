# Medicine Database Seeding Guide

## Overview
This guide explains how to structure your Excel file and seed your medicine database with the updated schema.

## Schema Changes Applied

### Removed Fields
**From Medication Model:**
- `strength`
- `schedule`
- `rxRequired`
- `atcCode`
- `ndcCode`

**From Composition Model:**
- `synonyms`
- `atcCode`

### Added Fields to Medication Model
- `substitutes` - Array of alternate medicine references
- `sideEffects` - Common side effects description
- `usage` - Therapeutic usage/indications
- `chemicalClass` - Chemical classification
- `habitForming` - Boolean flag (default: false)
- `therapeuticClass` - Therapeutic classification
- `actionClass` - Action/pharmacological classification

---

## Excel File Structure

Your Excel file should contain **TWO sheets** with the following structure:

### Sheet 1: "Compositions"

| Column Name | Type | Required | Example | Notes |
|------------|------|----------|---------|-------|
| **name** | String | Yes | Paracetamol | Canonical ingredient name |
| **description** | String | No | Analgesic and antipyretic | Brief description |

**Example Rows:**
```
name                description
Paracetamol         Analgesic and antipyretic
Ibuprofen           NSAID - pain and inflammation
Amoxicillin         Antibiotic - penicillin group
Metformin           Antidiabetic - biguanide
```

---

### Sheet 2: "Medications"

| Column Name | Type | Required | Example | Notes |
|------------|------|----------|---------|-------|
| **brandName** | String | No | Crocin | Brand/trade name (indexed for search) |
| **genericName** | String | No | Paracetamol | Generic name (indexed for search) |
| **unique_composition** | String | No | Paracetamol;Caffeine | Semicolon-separated composition names (links to Composition collection) |
| **exact_composition** | String | No | Paracetamol 500mg + Caffeine 50mg | Raw composition string as it appears on packaging |
| **form** | String | No | Tablet | e.g., Tablet, Capsule, Syrup, Injection, Inhaler |
| **manufacturer** | String | No | GSK | Manufacturer name |
| **substitutes** | String | No | Dolo 650;Calpol | Semicolon-separated alternate medicine brand names |
| **sideEffects** | String | No | Nausea, skin rash, liver damage (overdose) | Common side effects description |
| **usage** | String | No | Treatment of mild to moderate pain and fever | Therapeutic usage/indications |
| **chemicalClass** | String | No | Para-aminophenol derivative | Chemical classification |
| **habitForming** | Boolean | No | FALSE | TRUE or FALSE (defaults to FALSE) |
| **therapeuticClass** | String | No | Analgesic, Antipyretic | Therapeutic classification |
| **actionClass** | String | No | Non-narcotic analgesic | Action/pharmacological classification |

**Example Rows:**
```
brandName | genericName | unique_composition | exact_composition            | form   | manufacturer | substitutes      | sideEffects                  | usage                               | chemicalClass                | habitForming | therapeuticClass      | actionClass
Crocin    | Paracetamol | Paracetamol        | Paracetamol 500mg           | Tablet | GSK          | Dolo 650;Calpol  | Nausea, skin rash, liver... | Treatment of mild to moderate pain  | Para-aminophenol derivative  | FALSE        | Analgesic, Antipyretic | Non-narcotic analgesic
Dolo 650  | Paracetamol | Paracetamol        | Paracetamol 650mg           | Tablet | Micro Labs   | Crocin;Calpol    | Nausea, skin rash, liver... | Treatment of mild to moderate pain  | Para-aminophenol derivative  | FALSE        | Analgesic, Antipyretic | Non-narcotic analgesic
```

---

## Implementation Steps

### Step 1: Install Required Package
```bash
npm install xlsx
```

### Step 2: Run Database Migration (if you have existing data)
This will remove old fields and add new fields with default values:

```bash
node server/scripts/migrateMedicationSchema.js
```

**What this does:**
- Removes old fields: `strength`, `schedule`, `rxRequired`, `atcCode`, `ndcCode`, `synonyms`
- Adds new fields with default/empty values
- Preserves all other existing data

### Step 3: Prepare Your Excel File

1. Create an Excel file (e.g., `medicines-data.xlsx`)
2. Create two sheets named exactly: `Compositions` and `Medications`
3. Add column headers as shown in the tables above
4. Fill in your medicine data

**Important Notes:**
- Sheet names must be exactly `Compositions` and `Medications` (case-sensitive)
- At least one of `brandName` or `genericName` is required for medications
- `name` is required for compositions
- For multiple compositions or substitutes, separate with semicolon (`;`)
- Use `TRUE` or `FALSE` for the `habitForming` column

### Step 4: Import Data from Excel

```bash
node server/scripts/importFromExcel.js path/to/your/medicines-data.xlsx
```

**What this does:**
1. Imports all compositions from the "Compositions" sheet
2. Imports all medications from the "Medications" sheet
3. Links medications to their compositions by name
4. Links substitute medications by matching brand names
5. Shows a summary of imported data

### Step 5: Verify Import (Optional)

You can test with the sample seeder first:
```bash
node server/seeders/medicationSeeder.js
```

This will seed 6 sample medications with the new structure to verify everything works.

---

## API Changes

### Medication Search Response
Now includes new fields:
```json
{
  "_id": "...",
  "brandName": "Crocin",
  "genericName": "Paracetamol",
  "form": "Tablet",
  "manufacturer": "GSK",
  "compositions": [...],
  "substitutes": [...],
  "sideEffects": "Nausea, skin rash (rare), liver damage (overdose)",
  "usage": "Treatment of mild to moderate pain and fever",
  "chemicalClass": "Para-aminophenol derivative",
  "habitForming": false,
  "therapeuticClass": "Analgesic, Antipyretic",
  "actionClass": "Non-narcotic analgesic"
}
```

### Composition Search
No longer includes `synonyms` or `atcCode` fields.

---

## Troubleshooting

### Error: Sheet not found
- Ensure your sheet names are exactly `Compositions` and `Medications` (case-sensitive)

### Substitutes not linking
- Make sure the substitute brand names in the Excel match exactly with medication brand names
- Check for extra spaces or typos

### Compositions not linking
- Ensure composition names in the Medications sheet match exactly with names in the Compositions sheet
- Composition linking is case-sensitive

### Migration issues
- Back up your database before running migration
- If migration fails, check MongoDB connection in `.env` file
- You can re-run the migration script safely; it's idempotent

---

## Sample Excel Template

You can create a sample Excel file with this structure:

**Compositions Sheet:**
```
name          | description
Paracetamol   | Analgesic and antipyretic
Ibuprofen     | NSAID - pain and inflammation
Amoxicillin   | Antibiotic - penicillin group
```

**Medications Sheet:**
```
brandName | genericName | compositions | form   | manufacturer | sideEffects              | usage                  | chemicalClass            | habitForming | therapeuticClass | actionClass
Crocin    | Paracetamol | Paracetamol  | Tablet | GSK          | Nausea, liver damage... | Pain and fever relief  | Para-aminophenol deriv.  | FALSE        | Analgesic       | Non-narcotic
```

---

## Next Steps

After seeding:
1. Test medicine search functionality in your app
2. Verify all new fields are displayed correctly
3. Update frontend components to show new fields (substitutes, side effects, etc.)
4. Consider adding admin UI to manage medicines

---

## Support

If you encounter any issues:
1. Check MongoDB connection
2. Verify Excel file structure
3. Review console logs for specific errors
4. Ensure all dependencies are installed (`npm install`)
