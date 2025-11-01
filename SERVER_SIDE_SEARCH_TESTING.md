# Server-Side Search Testing Guide

## Overview
This document provides comprehensive testing instructions for the newly implemented server-side search functionality across Appointments, Patients, and Prescriptions pages.

## What Changed

### Backend Changes
1. **Appointments API** (`/api/appointments`)
   - Added `search` query parameter
   - Searches across patient name, patient code, and phone number
   - Uses MongoDB aggregation pipeline with $lookup

2. **Patients API** (`/api/patients`)
   - Enhanced existing search functionality
   - Searches across patient name, patient code, and phone number
   - Integrated with pagination

3. **Prescriptions API** (`/api/prescriptions`)
   - Added `search` query parameter
   - Searches across patient name, patient code, and phone number
   - Uses MongoDB aggregation pipeline with $lookup

### Frontend Changes
1. **AppointmentsPage** - Removed client-side filtering, now uses server-side search
2. **PatientsPage** - Removed client-side search filtering, now uses server-side search
3. **PrescriptionsPage** - Removed client-side filtering, now uses server-side search

### Database Changes
Added indexes for improved search performance:
- Patient: text index on name, compound indexes on clinic+name, clinic+phone
- Appointment: indexes on patient+clinic+startAt, clinic+status+startAt
- Prescription: indexes on doctor+clinic+createdAt, patient+clinic

---

## Testing Checklist

### 1. Appointments Page Testing

#### Basic Search Functionality
- [ ] **Test 1.1**: Search by patient name (full name)
  - Navigate to Appointments page
  - Enter a patient's full name in search box
  - Verify: Only appointments for that patient appear
  - Verify: Pagination count reflects search results

- [ ] **Test 1.2**: Search by patient name (partial name)
  - Enter first few letters of patient name
  - Verify: All patients with matching names appear
  - Verify: Search is case-insensitive

- [ ] **Test 1.3**: Search by patient code
  - Enter a patient code (e.g., "CLI-DOC-001")
  - Verify: Appointments for that patient appear
  - Verify: Partial code search works

- [ ] **Test 1.4**: Search by phone number
  - Enter a phone number
  - Verify: Appointments for that patient appear
  - Verify: Partial phone search works

#### Search with Filters
- [ ] **Test 1.5**: Search + Status filter
  - Enter search term
  - Select status filter (e.g., "Completed")
  - Verify: Results match both search AND status filter

- [ ] **Test 1.6**: Search + Visit Type filter
  - Enter search term
  - Select visit type (e.g., "First Visit")
  - Verify: Results match both search AND visit type

- [ ] **Test 1.7**: Search + Date Range
  - Enter search term
  - Select date range
  - Verify: Results match search within date range

- [ ] **Test 1.8**: Search + All filters combined
  - Apply search, status, visit type, and date range
  - Verify: Results match all criteria

#### Pagination
- [ ] **Test 1.9**: Search with pagination
  - Enter search term with many results
  - Verify: Pagination controls appear
  - Navigate to page 2
  - Verify: Different results appear, search term persists

- [ ] **Test 1.10**: Change page size during search
  - Enter search term
  - Change "Show per page" dropdown
  - Verify: Results update correctly

#### Edge Cases
- [ ] **Test 1.11**: Empty search
  - Clear search box
  - Verify: All appointments appear (with other filters)

- [ ] **Test 1.12**: No results
  - Enter non-existent search term
  - Verify: "No Matching Appointments" message appears

- [ ] **Test 1.13**: Special characters in search
  - Enter search with special chars (e.g., "John-Doe", "O'Brien")
  - Verify: Search works correctly, no errors

- [ ] **Test 1.14**: Very long search string
  - Enter very long search string (100+ chars)
  - Verify: No errors, handles gracefully

- [ ] **Test 1.15**: Search with < 2 characters
  - Enter single character
  - Verify: Search is not triggered (backend requires min 2 chars)

#### Performance
- [ ] **Test 1.16**: Search response time
  - Enter search term
  - Verify: Results appear within 500ms
  - Check browser network tab for response time

- [ ] **Test 1.17**: Search with large dataset
  - Test with clinic having 1000+ appointments
  - Verify: Search remains fast and responsive

---

### 2. Patients Page Testing

#### Basic Search Functionality
- [ ] **Test 2.1**: Search by patient name (full name)
  - Navigate to Patients page
  - Enter patient's full name
  - Verify: Only matching patients appear

- [ ] **Test 2.2**: Search by patient name (partial)
  - Enter first few letters
  - Verify: All matching patients appear

- [ ] **Test 2.3**: Search by patient code
  - Enter patient code
  - Verify: Correct patient appears

- [ ] **Test 2.4**: Search by phone number
  - Enter phone number
  - Verify: Correct patient appears

#### Search with Client-Side Filters
Note: Gender, blood group, age range, and date range filters remain client-side

- [ ] **Test 2.5**: Search + Gender filter
  - Enter search term
  - Select gender filter
  - Verify: Results match search AND gender

- [ ] **Test 2.6**: Search + Blood Group filter
  - Enter search term
  - Select blood group
  - Verify: Results match both criteria

- [ ] **Test 2.7**: Search + Age Range filter
  - Enter search term
  - Select age range
  - Verify: Results match both criteria

- [ ] **Test 2.8**: Search + Date Range filter
  - Enter search term
  - Select registration date range
  - Verify: Results match both criteria

#### Pagination
- [ ] **Test 2.9**: Search with pagination
  - Enter search term with many results
  - Verify: Pagination works correctly
  - Navigate between pages

- [ ] **Test 2.10**: Change page size during search
  - Enter search term
  - Change page size
  - Verify: Results update correctly

#### Edge Cases
- [ ] **Test 2.11**: Empty search
  - Clear search box
  - Verify: All patients appear

- [ ] **Test 2.12**: No results
  - Enter non-existent search term
  - Verify: "No Matching Patients" message

- [ ] **Test 2.13**: Special characters
  - Test with special characters in names
  - Verify: Search works correctly

#### Performance
- [ ] **Test 2.14**: Search response time
  - Verify: Results within 500ms

- [ ] **Test 2.15**: Large dataset performance
  - Test with 1000+ patients
  - Verify: Search remains responsive

---

### 3. Prescriptions Page Testing

#### Basic Search Functionality
- [ ] **Test 3.1**: Search by patient name
  - Navigate to Prescriptions page
  - Enter patient name
  - Verify: Only prescriptions for that patient appear

- [ ] **Test 3.2**: Search by patient code
  - Enter patient code
  - Verify: Correct prescriptions appear

- [ ] **Test 3.3**: Search by phone number
  - Enter phone number
  - Verify: Correct prescriptions appear

#### Search with Filters
- [ ] **Test 3.4**: Search + Date Range
  - Enter search term
  - Select date range
  - Verify: Results match both criteria

#### Pagination
- [ ] **Test 3.5**: Search with pagination
  - Enter search term with many results
  - Verify: Pagination works correctly

- [ ] **Test 3.6**: Change page size during search
  - Change page size during search
  - Verify: Results update correctly

#### Edge Cases
- [ ] **Test 3.7**: Empty search
  - Clear search box
  - Verify: All prescriptions appear

- [ ] **Test 3.8**: No results
  - Enter non-existent search term
  - Verify: "No Matching Prescriptions" message

#### Performance
- [ ] **Test 3.9**: Search response time
  - Verify: Results within 500ms

---

### 4. Cross-Page Testing

#### URL State Management
- [ ] **Test 4.1**: Search persists in URL
  - Enter search term
  - Verify: URL updates with `?search=term`
  - Refresh page
  - Verify: Search term persists

- [ ] **Test 4.2**: Clear filters removes search from URL
  - Enter search term
  - Click "Clear Filters"
  - Verify: URL is clean, search is cleared

- [ ] **Test 4.3**: Browser back/forward with search
  - Enter search term
  - Navigate to another page
  - Click browser back button
  - Verify: Search term is restored

#### Debouncing
- [ ] **Test 4.4**: Search debouncing works
  - Type quickly in search box
  - Verify: API call only made after 300ms pause
  - Check network tab for request count

#### Loading States
- [ ] **Test 4.5**: Loading indicator during search
  - Enter search term
  - Verify: Loading spinner appears briefly
  - Verify: "Loading..." message shows

#### Error Handling
- [ ] **Test 4.6**: Network error during search
  - Simulate network error (disconnect internet)
  - Enter search term
  - Verify: Error message appears gracefully

- [ ] **Test 4.7**: Server error (500)
  - Simulate server error
  - Verify: Appropriate error message

---

### 5. Role-Based Access Testing

#### Doctor Role
- [ ] **Test 5.1**: Doctor searches appointments
  - Login as doctor
  - Search appointments
  - Verify: Only sees their own appointments in results

- [ ] **Test 5.2**: Doctor searches prescriptions
  - Login as doctor
  - Search prescriptions
  - Verify: Only sees their own prescriptions in results

#### Clinic Owner/Staff Role
- [ ] **Test 5.3**: Owner searches appointments
  - Login as clinic owner
  - Search appointments
  - Verify: Sees all clinic appointments in results

- [ ] **Test 5.4**: Staff searches patients
  - Login as staff
  - Search patients
  - Verify: Sees all clinic patients in results

---

### 6. Database Performance Testing

#### Index Verification
- [ ] **Test 6.1**: Verify indexes created
  - Connect to MongoDB
  - Run: `db.patients.getIndexes()`
  - Verify: Text index on name exists
  - Verify: Compound indexes exist

- [ ] **Test 6.2**: Query execution plan
  - Run search query with `.explain()`
  - Verify: Indexes are being used (not COLLSCAN)

#### Load Testing
- [ ] **Test 6.3**: Concurrent searches
  - Simulate 10+ concurrent search requests
  - Verify: All complete successfully
  - Verify: Response times remain acceptable

- [ ] **Test 6.4**: Large result sets
  - Search term matching 500+ records
  - Verify: Pagination handles correctly
  - Verify: No memory issues

---

## API Testing (Manual/Postman)

### Appointments Endpoint
```bash
# Test basic search
GET /api/appointments?clinic=<clinicId>&search=John

# Test search with filters
GET /api/appointments?clinic=<clinicId>&search=John&status=completed

# Test search with pagination
GET /api/appointments?clinic=<clinicId>&search=John&page=2&limit=10

# Test search with date range
GET /api/appointments?clinic=<clinicId>&search=John&startDate=2024-01-01&endDate=2024-12-31
```

### Patients Endpoint
```bash
# Test basic search
GET /api/patients?clinicId=<clinicId>&search=John

# Test search with pagination
GET /api/patients?clinicId=<clinicId>&search=John&page=1&limit=20
```

### Prescriptions Endpoint
```bash
# Test basic search
GET /api/prescriptions?clinicId=<clinicId>&search=John

# Test search with date range
GET /api/prescriptions?clinicId=<clinicId>&search=John&startDate=2024-01-01&endDate=2024-12-31
```

---

## Known Limitations

1. **Minimum Search Length**: Search requires minimum 2 characters (backend validation)
2. **Client-Side Filters on Patients**: Gender, blood group, age range, and date filters remain client-side
3. **Search Fields**: Currently searches only patient name, code, and phone (not doctor name or other fields)
4. **Case Sensitivity**: Search is case-insensitive (uses regex with 'i' flag)

---

## Troubleshooting

### Search Not Working
1. Check browser console for errors
2. Check network tab - verify API call is made
3. Verify search parameter is in URL
4. Check server logs for errors

### Slow Search Performance
1. Verify database indexes are created
2. Check query execution plan
3. Monitor server resource usage
4. Check network latency

### No Results When Expected
1. Verify data exists in database
2. Check if filters are too restrictive
3. Verify clinic context is correct
4. Check role-based access restrictions

---

## Success Criteria

✅ All search tests pass
✅ Search response time < 500ms for typical datasets
✅ No console errors during search
✅ Pagination works correctly with search
✅ URL state management works
✅ Role-based access is enforced
✅ Database indexes are utilized
✅ Edge cases handled gracefully

---

## Rollback Plan

If issues are discovered:

1. **Backend Rollback**: Remove `search` parameter handling, revert to previous version
2. **Frontend Rollback**: Restore client-side filtering logic
3. **Database Rollback**: Drop new indexes if causing issues

The implementation is non-breaking - search parameter is optional, so old behavior continues if search is not provided.

---

## Next Steps (Future Enhancements)

1. Add search across more fields (doctor name, appointment notes, etc.)
2. Implement fuzzy search for typo tolerance
3. Add search suggestions/autocomplete
4. Move remaining client-side filters (gender, blood group) to backend
5. Add search analytics and logging
6. Implement full-text search with MongoDB Atlas Search
7. Add search result highlighting
