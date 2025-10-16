/**
 * Seed Substitutes - Complete Substitute Linking Solution
 *
 * Phase 1: Create missing substitutes by cloning parent medication data
 * Phase 2: Rebuild all substitute groups with bidirectional relationships
 *
 * Run: node server/seeders/seedSubstitutes.js
 */

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import connectDB from "../config/db.js";
import Medication from "../models/medication.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");

/**
 * Parse CSV file
 */
function parseCSV(filePath) {
  console.log(`📄 Reading CSV file: ${filePath}`);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  console.log(`   Found ${records.length} records in CSV\n`);
  return records;
}

/**
 * PHASE 1: Create Missing Substitutes by Cloning Parent Data
 */
async function createMissingSubstitutes(csvData, brandNameToIdMap) {
  console.log("\n" + "=".repeat(60));
  console.log("PHASE 1: Creating Missing Substitutes");
  console.log("=".repeat(60) + "\n");

  let createdCount = 0;
  let skippedCount = 0;
  let processedParents = 0;
  const createdBrandNames = [];

  for (const csvRow of csvData) {
    // Skip if no brand name or no substitutes
    if (!csvRow.brandName || csvRow.brandName.trim() === "") {
      continue;
    }
    if (!csvRow.substitutes || csvRow.substitutes.trim() === "") {
      continue;
    }

    const parentBrandName = csvRow.brandName.trim();
    const parentId = brandNameToIdMap[parentBrandName];

    // Skip if parent doesn't exist in DB
    if (!parentId) {
      continue;
    }

    // Get parent medication data
    const parent = await Medication.findById(parentId).lean();
    if (!parent) {
      continue;
    }

    // Parse substitute names
    const substituteNames = csvRow.substitutes
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    // Check each substitute
    for (const substituteName of substituteNames) {
      // Check if substitute already exists
      if (brandNameToIdMap[substituteName]) {
        continue; // Already exists
      }

      // CREATE new substitute by cloning parent
      try {
        const newSubstitute = await Medication.create({
          brandName: substituteName,

          // Clone all fields from parent
          genericName: parent.genericName,
          unique_composition: parent.unique_composition,
          exact_composition: parent.exact_composition,
          form: parent.form,
          sideEffects: parent.sideEffects,
          usage: parent.usage,
          chemicalClass: parent.chemicalClass,
          habitForming: parent.habitForming,
          therapeuticClass: parent.therapeuticClass,
          actionClass: parent.actionClass,

          // YOUR APPROACH: Parent + Parent's substitutes
          substitutes: [parent._id, ...(parent.substitutes || [])],

          // Only manufacturer is empty
          manufacturer: "",

          createdAt: new Date(),
        });

        // Add to map for phase 2
        brandNameToIdMap[substituteName] = newSubstitute._id;
        createdBrandNames.push(substituteName);
        createdCount++;

        if (createdCount % 100 === 0) {
          console.log(`   Created ${createdCount} new substitutes...`);
        }
      } catch (error) {
        console.error(`   Error creating "${substituteName}":`, error.message);
        skippedCount++;
      }
    }

    processedParents++;
    if (processedParents % 1000 === 0) {
      console.log(`   Processed ${processedParents} parent medications...`);
    }
  }

  console.log("\n✅ Phase 1 Complete!");
  console.log(`   Created: ${createdCount} new substitutes`);
  console.log(`   Skipped: ${skippedCount} (errors)`);

  return { createdCount, createdBrandNames };
}

/**
 * PHASE 2: Rebuild All Substitute Groups (Bidirectional + No Self-References)
 */
async function rebuildSubstituteGroups(csvData, brandNameToIdMap) {
  console.log("\n" + "=".repeat(60));
  console.log("PHASE 2: Rebuilding Substitute Groups");
  console.log("=".repeat(60) + "\n");

  let updatedCount = 0;
  let processedCount = 0;
  let noSubstitutesCount = 0;
  let notFoundCount = 0;

  for (const csvRow of csvData) {
    // Skip if no brand name
    if (!csvRow.brandName || csvRow.brandName.trim() === "") {
      continue;
    }

    const brandName = csvRow.brandName.trim();
    const medicationId = brandNameToIdMap[brandName];

    // Skip if medication doesn't exist
    if (!medicationId) {
      notFoundCount++;
      continue;
    }

    // Parse substitutes from CSV
    if (!csvRow.substitutes || csvRow.substitutes.trim() === "") {
      noSubstitutesCount++;
      processedCount++;

      // Clear substitutes array if CSV has none
      await Medication.findByIdAndUpdate(medicationId, {
        substitutes: [],
      });

      if (processedCount % 10000 === 0) {
        console.log(`   Processed ${processedCount} medications...`);
      }
      continue;
    }

    const substituteNames = csvRow.substitutes
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    // Convert substitute names to IDs
    const substituteIds = substituteNames
      .map((name) => brandNameToIdMap[name])
      .filter((id) => id !== undefined && id !== null)
      .filter((id) => id.toString() !== medicationId.toString()); // REMOVE SELF-REFERENCE

    // Update medication with complete substitute group
    try {
      await Medication.findByIdAndUpdate(medicationId, {
        substitutes: substituteIds,
      });
      updatedCount++;
    } catch (error) {
      console.error(`   Error updating "${brandName}":`, error.message);
    }

    processedCount++;

    if (processedCount % 10000 === 0) {
      console.log(
        `   Processed ${processedCount} medications (${updatedCount} updated)...`
      );
    }
  }

  console.log("\n✅ Phase 2 Complete!");
  console.log(`   Processed: ${processedCount} medications`);
  console.log(`   Updated: ${updatedCount} with substitutes`);
  console.log(`   No substitutes: ${noSubstitutesCount}`);
  console.log(`   Not found: ${notFoundCount}`);

  return { updatedCount };
}

/**
 * Main function
 */
async function seedSubstitutes() {
  try {
    console.log("🌱 Starting Substitute Seeding Process...\n");
    console.log("=".repeat(60));
    console.log("Strategy: Clone Parent + Rebuild Groups");
    console.log("=".repeat(60));

    // Connect to database
    await connectDB();
    console.log("\n✅ Connected to MongoDB\n");

    // Read CSV file
    const medicationsPath = path.join(dataDir, "medication.csv");
    if (!fs.existsSync(medicationsPath)) {
      console.error(`❌ File not found: ${medicationsPath}`);
      process.exit(1);
    }

    const csvData = parseCSV(medicationsPath);

    // Build brand name to ID map
    console.log("🗺️  Building medication brand name map...");
    const allMedications = await Medication.find({}, { brandName: 1 }).lean();
    const brandNameToIdMap = {};
    allMedications.forEach((med) => {
      if (med.brandName) {
        brandNameToIdMap[med.brandName.trim()] = med._id;
      }
    });
    console.log(
      `   Mapped ${Object.keys(brandNameToIdMap).length} brand names`
    );

    // Get initial count
    const initialCount = await Medication.countDocuments();
    console.log(`   Initial medications in DB: ${initialCount}`);

    // PHASE 1: Create missing substitutes
    const phase1Result = await createMissingSubstitutes(
      csvData,
      brandNameToIdMap
    );

    // Get count after Phase 1
    const afterPhase1Count = await Medication.countDocuments();
    console.log(`\n   Medications in DB after Phase 1: ${afterPhase1Count}`);

    // PHASE 2: Rebuild all substitute groups
    const phase2Result = await rebuildSubstituteGroups(
      csvData,
      brandNameToIdMap
    );

    // Final statistics
    const finalCount = await Medication.countDocuments();
    const medsWithSubstitutes = await Medication.countDocuments({
      substitutes: { $exists: true, $ne: [] },
    });

    // Print final summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 SUBSTITUTE SEEDING COMPLETED!");
    console.log("=".repeat(60));
    console.log("\n📊 Final Summary:");
    console.log("=".repeat(60));
    console.log(`Initial medications:           ${initialCount}`);
    console.log(`New substitutes created:       ${phase1Result.createdCount}`);
    console.log(`Final medications:             ${finalCount}`);
    console.log(`Medications with substitutes:  ${medsWithSubstitutes}`);
    console.log(`Substitute groups updated:     ${phase2Result.updatedCount}`);
    console.log("=".repeat(60));

    console.log("\n✨ All substitutes have been linked successfully!\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding substitutes:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

seedSubstitutes();
