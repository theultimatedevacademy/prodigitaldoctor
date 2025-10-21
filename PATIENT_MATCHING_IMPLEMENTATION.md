# Patient Matching Implementation

## Overview
This document describes the smart patient matching system implemented to prevent duplicate patient records while supporting family members with shared phone numbers.

## Problem Statement
Previously, when a patient's appointment was cancelled and they rebooked, a new patient record was created, resulting in duplicate patients with different codes but the same phone number.

## Solution
Implemented a smart patient matching algorithm that uses:
- **100% phone number match** (exact)
- **80%+ name similarity** (fuzzy matching using Jaro-Winkler algorithm)
- **Only matches patients with cancelled or no appointments** (excludes scheduled, in-progress, or completed)

### Algorithm Logic
1. When creating a patient, search for existing patients with the same phone in the clinic
2. Filter: Keep only patients with **cancelled appointments or no appointments**
   - ❌ Exclude patients with scheduled appointments
   - ❌ Exclude patients with in-progress appointments
   - ❌ Exclude patients with completed appointments
3. Calculate name similarity for eligible patients
4. If similarity ≥ 80% → **Reuse existing patient** (update name and details to latest)
5. If similarity < 80% → **Create new patient** (family member or different person)

## Implementation Details

### Environment Configuration
Add to your `.env` file:
```bash
# Patient name matching threshold (0-100)
# Default: 80
# Lower value = more lenient matching (catches more variations)
# Higher value = stricter matching (requires closer name match)
PATIENT_NAME_MATCH_THRESHOLD=80
```

### Files Modified

#### Backend
1. **`server/models/patient.js`**
   - Removed compound unique index on `(patientCode + phone)`
   - Kept unique index on `patientCode` only
   - Added index on `phone` for fast lookups

2. **`server/utils/patientCodeGenerator.js`**
   - Updated to use `customAlphabet` from nanoid
   - Restricts patient code suffix to alphanumeric only (0-9, A-Z)
   - No special characters (underscores, extra dashes)

3. **`server/services/patientMatchingService.js`** (NEW)
   - `calculateNameSimilarity(name1, name2)` - Jaro-Winkler algorithm
   - `normalizeName(name)` - Removes titles, normalizes spacing
   - `findEligiblePatients(phone, clinicId)` - Finds patients with cancelled or no appointments
   - `findMatchingPatient(phone, name, clinicId)` - Finds matching patients among eligible
   - `findOrCreatePatient(...)` - Main service function that updates patient data on match

4. **`server/controllers/patientController.js`**
   - Updated `createPatient` to use `findOrCreatePatient` service
   - Returns `reused: true/false` in response
   - Changed from `dob` to `age` field

5. **`server/controllers/appointmentController.js`** ⚠️ **CRITICAL FIX**
   - Updated `createFirstVisitAppointment` to use `findOrCreatePatient` service
   - Replaced direct patient creation with smart matching
   - Returns patient reuse info in response
   - **This was the root cause of duplicate Arun Nair issue - now fixed**

#### Frontend
6. **`client/src/pages/NewAppointmentPage.jsx`**
   - Updated success handler to detect patient reuse
   - Shows info toast: "Existing patient record found and reused"
   - Shows success toast for new patients

### Name Normalization Rules
The algorithm normalizes names before comparing:
- Converts to lowercase
- Trims whitespace
- Removes common Indian titles: Dr., Mr., Mrs., Ms., Shri, Smt.
- Removes "Kumari" suffix
- Normalizes multiple spaces to single space

### Matching Eligibility Criteria

**Eligible for Matching (Can be reused):**
- ✅ Patient with **no appointments** at all (fresh patient code, never used)
- ✅ Patient with **only cancelled** appointments (never actually visited)

**NOT Eligible for Matching (Will create new patient):**
- ❌ Patient with any **scheduled** appointments (active upcoming booking)
- ❌ Patient with any **in-progress** appointments (currently being seen)
- ❌ Patient with any **completed** appointments (has visit history)

### Example Matching Scenarios

| Phone Match | Name 1 | Name 2 | Patient Status | Similarity | Result |
|-------------|---------|---------|----------------|------------|---------|
| ✅ 100% | "Ashish Anand" | "asish anand" | Cancelled only | ~95% | **Reuse** (typo) |
| ✅ 100% | "Shweta Kumari" | "sweta kumari" | No appointments | ~92% | **Reuse** (spelling) |
| ✅ 100% | "Roshan Kumar" | "raushan kumar" | Cancelled only | ~90% | **Reuse** (variation) |
| ✅ 100% | "Karan Goyal" | "Karani Goyal" | **Completed: 1** | ~92% | **New** ❌ (has history) |
| ✅ 100% | "Ramesh Kumar" | "Priya Kumar" | Cancelled only | ~45% | **New** (family) |
| ✅ 100% | "John Doe" | "Jane Doe" | **Scheduled: 1** | ~65% | **New** ❌ (active booking) |
| ❌ 0% | Any | Any | Any | N/A | **New** (different phone) |

## Logging & Monitoring

### Events Logged

#### Patient Matched
```json
{
  "event": "patient_matched",
  "phone": "9876543210",
  "nameSearched": "Ramesh Kumar",
  "nameMatched": "Ramesh Kumar",
  "similarity": "95.0%",
  "patientId": "abc123",
  "patientCode": "TC-AA-0014-9VV",
  "clinicId": "clinic123"
}
```

#### New Patient Created
```json
{
  "event": "patient_created",
  "phone": "9876543210",
  "name": "Priya Kumar",
  "patientId": "def456",
  "patientCode": "TC-AA-0015-3XY",
  "clinicId": "clinic123"
}
```

#### Multiple Matches Warning
```json
{
  "event": "multiple_patient_matches",
  "phone": "9876543210",
  "nameSearched": "Ramesh Kumar",
  "matchCount": 2,
  "matches": [...],
  "selectedMatch": "abc123"
}
```

## Testing Checklist

### Manual Testing
- [ ] Create first appointment with new patient → verify new patient code
- [ ] Cancel appointment, rebook with exact name → verify patient reused + name updated
- [ ] Cancel appointment, rebook with minor typo → verify patient reused + name updated + toast
- [ ] Patient with completed visit, book family member (same phone) → verify new patient code
- [ ] Patient with scheduled appointment, book another (same phone, similar name) → verify new patient code
- [ ] Verify patient codes contain only alphanumeric + dashes
- [ ] Check logs for all matching decisions
- [ ] Test threshold adjustment via environment variable
- [ ] Verify name is updated to latest value when patient is reused

### Edge Cases Tested
- [ ] Same phone, exact name match, cancelled status
- [ ] Same phone, 90%+ similarity (typo), cancelled status
- [ ] Same phone, < 80% similarity (family), any status
- [ ] Same phone, high similarity, but completed appointment exists
- [ ] Same phone, high similarity, but scheduled appointment exists
- [ ] Different phone numbers
- [ ] Multiple eligible patients with same phone
- [ ] Empty or missing phone number
- [ ] Names with titles (Dr., Mr., etc.)
- [ ] Names with special characters
- [ ] Patient with no appointments (fresh code never used)

## Performance

### Optimization Strategy
1. Phone number indexed for fast lookup
2. Single aggregation query with $lookup to join appointments
3. Appointment status filtering done at database level
4. Clinic-specific filtering reduces search space
5. Name similarity calculated only for eligible candidates
6. Typical case: 1-5 eligible patients per phone (family), very fast

### Expected Performance
- Phone lookup with aggregation: ~20-30ms (indexed + join)
- Name similarity calculation: < 1ms per comparison
- Patient update (if matched): ~10ms
- **Total matching time: < 50ms for typical case**

### Database Indexes Required
```javascript
// Patient collection
db.patients.createIndex({ phone: 1 })
db.patients.createIndex({ "patientCodes.code": 1 }, { unique: true, sparse: true })
db.patients.createIndex({ "patientCodes.clinic": 1 })

// Appointment collection
db.appointments.createIndex({ patient: 1, status: 1 })
```

## Tuning the Threshold

### Current Setting: 80%

### If Too Many Duplicates (False Negatives)
**Problem:** Same person treated as different patients  
**Solution:** Lower threshold to 70-75%  
**Caution:** May increase false positives

### If Wrong Matches (False Positives)
**Problem:** Different people treated as same patient  
**Solution:** Increase threshold to 85-90%  
**Caution:** May increase duplicates for typos

### Monitoring Metrics
- Match rate (% of patients reused)
- New patient rate (% of patients created)
- Multiple match warnings (should be rare)
- User reports of wrong matches

## Rollback Plan

### Emergency Disable
Set threshold to 99% in environment:
```bash
PATIENT_NAME_MATCH_THRESHOLD=99
```
This effectively disables fuzzy matching while keeping the system functional.

### Full Revert
If major issues occur:
1. Revert `patientController.js` to original logic
2. Remove matching service calls
3. Redeploy

## Future Enhancements

### Potential Improvements
1. **Admin Dashboard**: View matched patients, split incorrectly merged records
2. **Manual Override**: UI checkbox to force new patient creation
3. **Advanced Matching**: Include age/gender in similarity score
4. **Learning System**: Track false positives/negatives to auto-tune threshold
5. **Bulk Deduplication**: Background job to merge existing duplicates

## Support

### Configuration Issues
Check environment variable is set and loaded properly.

### False Matches
Review logs to see similarity scores, adjust threshold if needed.

### Missing Logs
Ensure logger is configured properly in your environment.

---

**Implementation Date:** October 21, 2025  
**Version:** 1.0  
**Status:** ✅ Active
