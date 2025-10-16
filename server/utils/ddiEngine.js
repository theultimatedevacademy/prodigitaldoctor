/**
 * Drug-Drug Interaction (DDI) Engine
 * Checks for interactions between medication compositions
 */

import DDI from '../models/ddi.js';
import Medication from '../models/medication.js';
import logger from './logger.js';

/**
 * Check for drug-drug interactions
 * @param {Array<string>} medicationIds - Array of medication IDs
 * @returns {Promise<Array>} Array of DDI warnings
 */
export async function checkDDI(medicationIds) {
  try {
    if (!medicationIds || medicationIds.length < 2) {
      return [];
    }

    // Fetch medications with their compositions
    const medications = await Medication.find({
      _id: { $in: medicationIds }
    }).populate('unique_composition');

    // Extract all unique composition IDs
    const compositionIds = new Set();
    medications.forEach(med => {
      med.unique_composition.forEach(comp => {
        compositionIds.add(comp._id.toString());
      });
    });

    const uniqueCompositions = Array.from(compositionIds);

    if (uniqueCompositions.length < 2) {
      return [];
    }

    // Generate all unique pairs
    const pairs = [];
    for (let i = 0; i < uniqueCompositions.length; i++) {
      for (let j = i + 1; j < uniqueCompositions.length; j++) {
        const [compA, compB] = [uniqueCompositions[i], uniqueCompositions[j]].sort();
        pairs.push({ compA, compB });
      }
    }

    // Check each pair against DDI database
    const warnings = [];
    for (const pair of pairs) {
      const interaction = await DDI.findOne({
        compA: pair.compA,
        compB: pair.compB,
      }).populate('compA compB');

      if (interaction) {
        warnings.push({
          severity: interaction.severity,
          description: interaction.description,
          compA: interaction.compA,
          compB: interaction.compB,
          recommendation: interaction.recommendation,
        });
      }
    }

    // Sort by severity (contraindicated > major > moderate > minor > unknown)
    const severityOrder = {
      contraindicated: 0,
      major: 1,
      moderate: 2,
      minor: 3,
      unknown: 4,
    };

    warnings.sort((a, b) => {
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    logger.info(
      { medicationCount: medicationIds.length, warningCount: warnings.length },
      'DDI check completed'
    );

    return warnings;
  } catch (error) {
    logger.error({ error, medicationIds }, 'Error checking DDI');
    throw error;
  }
}

/**
 * Check DDI for compositions directly
 * @param {Array<string>} compositionIds - Array of composition IDs
 * @returns {Promise<Array>} Array of DDI warnings
 */
export async function checkDDIByCompositions(compositionIds) {
  try {
    if (!compositionIds || compositionIds.length < 2) {
      return [];
    }

    const uniqueCompositions = [...new Set(compositionIds.map(id => id.toString()))];

    if (uniqueCompositions.length < 2) {
      return [];
    }

    // Generate all unique pairs with normalization (compA < compB)
    const pairs = [];
    for (let i = 0; i < uniqueCompositions.length; i++) {
      for (let j = i + 1; j < uniqueCompositions.length; j++) {
        const [compA, compB] = [uniqueCompositions[i], uniqueCompositions[j]].sort();
        pairs.push({ compA, compB });
      }
    }

    // Check each pair
    const warnings = [];
    for (const pair of pairs) {
      const interaction = await DDI.findOne({
        compA: pair.compA,
        compB: pair.compB,
      }).populate('compA compB');

      if (interaction) {
        warnings.push({
          severity: interaction.severity,
          description: interaction.description,
          compA: interaction.compA,
          compB: interaction.compB,
          recommendation: interaction.recommendation,
        });
      }
    }

    // Sort by severity (contraindicated > major > moderate > minor > unknown)
    const severityOrder = {
      contraindicated: 0,
      major: 1,
      moderate: 2,
      minor: 3,
      unknown: 4,
    };

    warnings.sort((a, b) => {
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    return warnings;
  } catch (error) {
    logger.error({ error, compositionIds }, 'Error checking DDI by compositions');
    throw error;
  }
}

export default {
  checkDDI,
  checkDDIByCompositions,
};
