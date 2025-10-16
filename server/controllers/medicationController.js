/**
 * Medication Controller
 * Handles medication search, composition search, and DDI checks
 */

import Medication from '../models/medication.js';
import Composition from '../models/composition.js';
import DDI from '../models/ddi.js';
import { checkDDI, checkDDIByCompositions } from '../utils/ddiEngine.js';
import logger from '../utils/logger.js';

/**
 * Smart search medications by brand name, generic name, or composition name
 * GET /api/medications/search?q=paracetamol&page=1&limit=20
 */
export const searchMedications = async (req, res) => {
  try {
    const { q, composition, page = 1, limit = 20 } = req.query;

    if (!q && !composition) {
      return res.status(400).json({ 
        error: 'Search query (q) or composition is required' 
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let medications = [];
    let total = 0;

    if (composition) {
      // Search by composition ID (existing behavior)
      const filter = { unique_composition: composition };
      medications = await Medication.find(filter)
        .populate('unique_composition')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ brandName: 1 });
      total = await Medication.countDocuments(filter);
    } else if (q) {
      // Advanced search: partial matching on brand name, generic name, OR composition name
      const searchRegex = new RegExp(q, 'i'); // Case-insensitive partial match
      
      // 1. Search by brand name and generic name using regex
      const nameSearchResults = await Medication.find({
        $or: [
          { brandName: searchRegex },
          { genericName: searchRegex }
        ]
      })
        .populate('unique_composition')
        .limit(parseInt(limit) * 2) // Get more to account for composition matches
        .sort({ brandName: 1 })
        .lean();

      // 2. Search compositions by name (partial match)
      const compositionMatches = await Composition.find({
        name: searchRegex
      }).limit(20);

      // 3. If compositions found, get medications with those compositions
      let compositionSearchResults = [];
      if (compositionMatches.length > 0) {
        const compositionIds = compositionMatches.map(c => c._id);
        compositionSearchResults = await Medication.find({
          unique_composition: { $in: compositionIds }
        })
          .populate('unique_composition')
          .limit(parseInt(limit))
          .sort({ brandName: 1 })
          .lean();
      }

      // 4. Combine and deduplicate results
      const combinedResults = [...nameSearchResults, ...compositionSearchResults];
      const uniqueResults = [];
      const seenIds = new Set();

      for (const med of combinedResults) {
        const id = med._id.toString();
        if (!seenIds.has(id)) {
          seenIds.add(id);
          uniqueResults.push(med);
        }
      }

      // 5. Sort by relevance (exact matches first, then partial matches)
      uniqueResults.sort((a, b) => {
        const aExactBrand = a.brandName.toLowerCase() === q.toLowerCase();
        const bExactBrand = b.brandName.toLowerCase() === q.toLowerCase();
        const aExactGeneric = a.genericName?.toLowerCase() === q.toLowerCase();
        const bExactGeneric = b.genericName?.toLowerCase() === q.toLowerCase();
        
        // Exact brand name matches first
        if (aExactBrand && !bExactBrand) return -1;
        if (!aExactBrand && bExactBrand) return 1;
        
        // Then exact generic name matches
        if (aExactGeneric && !bExactGeneric) return -1;
        if (!aExactGeneric && bExactGeneric) return 1;
        
        // Then alphabetical by brand name
        return a.brandName.localeCompare(b.brandName);
      });

      // 6. Paginate combined results
      medications = uniqueResults.slice(skip, skip + parseInt(limit));
      total = uniqueResults.length;
    }

    res.json({
      medications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error searching medications');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get medication by ID
 * GET /api/medications/:medicationId
 */
export const getMedicationById = async (req, res) => {
  try {
    const { medicationId } = req.params;

    const medication = await Medication.findById(medicationId)
      .populate('unique_composition')
      .populate('substitutes');

    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    res.json(medication);
  } catch (error) {
    logger.error({ error }, 'Error fetching medication');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Search compositions
 * GET /api/compositions/search?q=paracetamol
 */
export const searchCompositions = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ 
        error: 'Search query must be at least 2 characters' 
      });
    }

    const filter = {
      name: new RegExp(q, 'i')
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const compositions = await Composition.find(filter)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ name: 1 });

    const total = await Composition.countDocuments(filter);

    res.json({
      compositions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error searching compositions');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Check DDI for list of medications
 * POST /api/medications/check-ddi
 * Body: { medicationIds: [...] }
 */
export const checkMedicationDDI = async (req, res) => {
  try {
    const { medicationIds } = req.body;

    if (!medicationIds || !Array.isArray(medicationIds)) {
      return res.status(400).json({ 
        error: 'medicationIds array is required' 
      });
    }

    if (medicationIds.length < 2) {
      return res.json({ warnings: [] });
    }

    const warnings = await checkDDI(medicationIds);

    res.json({ warnings });
  } catch (error) {
    logger.error({ error }, 'Error checking DDI');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Check DDI for list of compositions
 * POST /api/compositions/check-ddi
 * Body: { compositionIds: [...] }
 */
export const checkCompositionDDI = async (req, res) => {
  try {
    const { compositionIds } = req.body;

    if (!compositionIds || !Array.isArray(compositionIds)) {
      return res.status(400).json({ 
        error: 'compositionIds array is required' 
      });
    }

    if (compositionIds.length < 2) {
      return res.json({ warnings: [] });
    }

    const warnings = await checkDDIByCompositions(compositionIds);

    res.json({ warnings });
  } catch (error) {
    logger.error({ error }, 'Error checking DDI');
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ===== ADMIN ENDPOINTS =====

/**
 * Create medication (admin only)
 * POST /api/admin/medications
 */
export const createMedication = async (req, res) => {
  try {
    const {
      brandName,
      genericName,
      unique_composition,
      exact_composition,
      form,
      manufacturer,
      substitutes,
      sideEffects,
      usage,
      chemicalClass,
      habitForming,
      therapeuticClass,
      actionClass,
    } = req.body;

    if (!brandName && !genericName) {
      return res.status(400).json({ 
        error: 'Brand name or generic name is required' 
      });
    }

    const medication = await Medication.create({
      brandName,
      genericName,
      unique_composition: unique_composition || [],
      exact_composition,
      form,
      manufacturer,
      substitutes: substitutes || [],
      sideEffects,
      usage,
      chemicalClass,
      habitForming: habitForming || false,
      therapeuticClass,
      actionClass,
      createdAt: new Date(),
    });

    const populated = await Medication.findById(medication._id)
      .populate('unique_composition')
      .populate('substitutes');

    logger.info({ medicationId: medication._id }, 'Medication created');
    res.status(201).json(populated);
  } catch (error) {
    logger.error({ error }, 'Error creating medication');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create composition (admin only)
 * POST /api/admin/compositions
 */
export const createComposition = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const composition = await Composition.create({
      name,
      description,
      createdAt: new Date(),
    });

    logger.info({ compositionId: composition._id }, 'Composition created');
    res.status(201).json(composition);
  } catch (error) {
    logger.error({ error }, 'Error creating composition');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create DDI rule (admin only)
 * POST /api/admin/ddi
 */
export const createDDI = async (req, res) => {
  try {
    const {
      compA,
      compB,
      severity,
      description,
      recommendation,
      references,
    } = req.body;

    if (!compA || !compB || !severity) {
      return res.status(400).json({ 
        error: 'compA, compB, and severity are required' 
      });
    }

    if (!['minor', 'moderate', 'major', 'contraindicated'].includes(severity)) {
      return res.status(400).json({ error: 'Invalid severity level' });
    }

    // Verify compositions exist
    const [compositionA, compositionB] = await Promise.all([
      Composition.findById(compA),
      Composition.findById(compB),
    ]);

    if (!compositionA || !compositionB) {
      return res.status(404).json({ error: 'One or both compositions not found' });
    }

    // Create DDI (pre-validate hook will normalize compA/compB order)
    const ddi = await DDI.create({
      compA,
      compB,
      severity,
      description,
      recommendation,
      references: references || [],
    });

    const populated = await DDI.findById(ddi._id)
      .populate('compA compB');

    logger.info({ ddiId: ddi._id }, 'DDI rule created');
    res.status(201).json(populated);
  } catch (error) {
    logger.error({ error }, 'Error creating DDI rule');
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'DDI rule already exists for these compositions' 
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all DDI rules (admin only)
 * GET /api/admin/ddi?page=1&limit=50
 */
export const getAllDDI = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const ddiRules = await DDI.find()
      .populate('compA compB')
      .sort({ severity: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await DDI.countDocuments();

    res.json({
      ddiRules,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching DDI rules');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update DDI rule (admin only)
 * PATCH /api/admin/ddi/:ddiId
 */
export const updateDDI = async (req, res) => {
  try {
    const { ddiId } = req.params;
    const updates = req.body;

    // Prevent changing composition references
    delete updates.compA;
    delete updates.compB;

    const ddi = await DDI.findByIdAndUpdate(
      ddiId,
      updates,
      { new: true, runValidators: true }
    ).populate('compA compB');

    if (!ddi) {
      return res.status(404).json({ error: 'DDI rule not found' });
    }

    logger.info({ ddiId }, 'DDI rule updated');
    res.json(ddi);
  } catch (error) {
    logger.error({ error }, 'Error updating DDI rule');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete DDI rule (admin only)
 * DELETE /api/admin/ddi/:ddiId
 */
export const deleteDDI = async (req, res) => {
  try {
    const { ddiId } = req.params;

    const ddi = await DDI.findByIdAndDelete(ddiId);

    if (!ddi) {
      return res.status(404).json({ error: 'DDI rule not found' });
    }

    logger.info({ ddiId }, 'DDI rule deleted');
    res.json({ message: 'DDI rule deleted successfully' });
  } catch (error) {
    logger.error({ error }, 'Error deleting DDI rule');
    res.status(500).json({ error: 'Internal server error' });
  }
};
