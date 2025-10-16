# Quick Reference: Medicine Import

## Step-by-Step Instructions

### 1️⃣ Install Package
```bash
npm install xlsx
```

### 2️⃣ Migrate Existing Database (Optional - if you have data)
```bash
node server/scripts/migrateMedicationSchema.js
```

### 3️⃣ Create Excel File

**Two sheets required:**
- Sheet 1: `Compositions`
- Sheet 2: `Medications`

### 4️⃣ Import Your Data
```bash
node server/scripts/importFromExcel.js your-file.xlsx
```

---

## Excel Column Headers

### Compositions Sheet
```
name | description
```

### Medications Sheet
```
brandName | genericName | unique_composition | exact_composition | form | manufacturer | substitutes | sideEffects | usage | chemicalClass | habitForming | therapeuticClass | actionClass
```

---

## Key Points

✅ **Required Fields:**
- Medications: `brandName` OR `genericName` (at least one)
- Compositions: `name`

✅ **Multiple Values:**
- Use semicolon (`;`) to separate multiple compositions or substitutes
- Example: `Paracetamol;Caffeine` or `Crocin;Dolo 650`

✅ **Boolean Fields:**
- `habitForming`: Use `TRUE` or `FALSE`

✅ **Sheet Names:**
- Must be exactly: `Compositions` and `Medications` (case-sensitive)

---

## Quick Test with Sample Data
```bash
node server/seeders/medicationSeeder.js
```
This seeds 6 sample medications to verify everything works.

---

## Fields Removed from Schema
- ❌ `strength`
- ❌ `schedule`
- ❌ `rxRequired`
- ❌ `atcCode`
- ❌ `ndcCode`
- ❌ `synonyms` (from Composition)

## Fields Added to Medication
- ✅ `unique_composition` (Composition refs) - renamed from `compositions`
- ✅ `exact_composition` (string) - raw composition string
- ✅ `substitutes` (alternate medicines)
- ✅ `sideEffects`
- ✅ `usage`
- ✅ `chemicalClass`
- ✅ `habitForming`
- ✅ `therapeuticClass`
- ✅ `actionClass`
