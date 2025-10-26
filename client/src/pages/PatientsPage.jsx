/**
 * PatientsPage Component
 * List and search patients with table view, filters, and pagination
 */

import { useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router';
import { Plus, User, Eye, Edit2, X, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { SearchInput } from '../components/ui/SearchInput';
import { DateRangePicker } from '../components/ui/DateRangePicker';
import { usePatients } from '../api/hooks/usePatients';
import { useClinicContext } from '../contexts/ClinicContext';
import { formatDate, formatPhone } from '../utils/formatters';

export default function PatientsPage() {
  const navigate = useNavigate();
  const { selectedClinicId } = useClinicContext();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get today's date for default
  const getTodayLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const today = getTodayLocal();
  
  // Read filters from URL params
  const searchTerm = searchParams.get('search') || '';
  const genderFilter = searchParams.get('gender') || 'all';
  const bloodGroupFilter = searchParams.get('bloodGroup') || 'all';
  const ageRangeFilter = searchParams.get('ageRange') || 'all';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const page = parseInt(searchParams.get('page')) || 1;
  const pageSize = parseInt(searchParams.get('pageSize')) || 20;
  
  // Helper to update URL params
  const updateFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'gender' && value === 'all') {
          newParams.delete(key);
        } else if (key === 'bloodGroup' && value === 'all') {
          newParams.delete(key);
        } else if (key === 'ageRange' && value === 'all') {
          newParams.delete(key);
        } else if (key === 'page' && value === 1) {
          newParams.delete(key);
        } else if (key === 'pageSize' && value === 20) {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      } else {
        newParams.delete(key);
      }
    });
    
    setSearchParams(newParams);
  };
  
  // Fetch data
  const { data: patientsData, isLoading } = usePatients(selectedClinicId, {
    page,
    limit: pageSize,
  });
  
  const patients = patientsData?.patients || [];
  const pagination = patientsData?.pagination || { total: 0, page: 1, pages: 1 };
  
  // Check if age is in range
  const isInAgeRange = (age, range) => {
    if (range === 'all' || !age) return true;
    if (range === '0-18') return age >= 0 && age <= 18;
    if (range === '19-30') return age >= 19 && age <= 30;
    if (range === '31-45') return age >= 31 && age <= 45;
    if (range === '46-60') return age >= 46 && age <= 60;
    if (range === '60+') return age > 60;
    return true;
  };
  
  // Check if date is in range
  const isInDateRange = (dateStr) => {
    if (!startDate || !endDate) return true;
    const date = new Date(dateStr).setHours(0, 0, 0, 0);
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(0, 0, 0, 0);
    return date >= start && date <= end;
  };
  
  // Apply client-side filters
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const patientCode = patient.patientCodes?.[0]?.code || '';
        const phoneNumber = patient.phone || '';
        
        const matchesSearch = 
          patient.name?.toLowerCase().includes(searchLower) ||
          patientCode.toLowerCase().includes(searchLower) ||
          phoneNumber.includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // Gender filter
      if (genderFilter !== 'all' && patient.gender !== genderFilter) {
        return false;
      }
      
      // Blood group filter
      if (bloodGroupFilter !== 'all' && patient.bloodGroup !== bloodGroupFilter) {
        return false;
      }
      
      // Age range filter
      if (ageRangeFilter !== 'all') {
        if (!isInAgeRange(patient.age, ageRangeFilter)) {
          return false;
        }
      }
      
      // Date range filter (registered date)
      if (startDate && endDate) {
        if (!isInDateRange(patient.createdAt)) {
          return false;
        }
      }
      
      return true;
    });
  }, [patients, searchTerm, genderFilter, bloodGroupFilter, ageRangeFilter, startDate, endDate]);
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchParams({});
  };
  
  // Check if any filters are active
  const hasActiveFilters = searchTerm || genderFilter !== 'all' || bloodGroupFilter !== 'all' || ageRangeFilter !== 'all' || startDate || endDate;
  
  if (!selectedClinicId) {
    return (
      <Alert variant="warning">
        Please select a clinic to view patients
      </Alert>
    );
  }
  
  const totalPages = pagination?.pages || 1;
  const totalPatients = pagination?.total || 0;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Patients
          </h1>
          <p className="text-gray-600 mt-1">Manage all clinic patients</p>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="space-y-4">
        {/* Search, Date Range, and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={(value) => updateFilters({ search: value, page: 1 })}
              placeholder="Search by patient name, code, or phone..."
            />
          </div>
          
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={({ startDate: newStart, endDate: newEnd }) => {
              updateFilters({ startDate: newStart, endDate: newEnd, page: 1 });
            }}
          />
          
          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => updateFilters({ gender: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium text-gray-700 min-w-[140px]"
          >
            <option value="all">All Genders</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
            <option value="U">Not Specified</option>
          </select>
          
          {/* Blood Group Filter */}
          <select
            value={bloodGroupFilter}
            onChange={(e) => updateFilters({ bloodGroup: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium text-gray-700 min-w-[140px]"
          >
            <option value="all">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
          
          {/* Age Range Filter */}
          <select
            value={ageRangeFilter}
            onChange={(e) => updateFilters({ ageRange: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium text-gray-700 min-w-[140px]"
          >
            <option value="all">All Ages</option>
            <option value="0-18">0-18 years</option>
            <option value="19-30">19-30 years</option>
            <option value="31-45">31-45 years</option>
            <option value="46-60">46-60 years</option>
            <option value="60+">60+ years</option>
          </select>
          
          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium whitespace-nowrap"
              title="Clear all filters"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>
      
      {/* Patients Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading patients...</p>
        </div>
      ) : filteredPatients.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Patient Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    No of Visits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPatients.map((patient, index) => {
                  // Count completed visits
                  const completedVisits = patient.visitStats?.completedCount || 0;
                  const lastVisitDate = patient.visitStats?.lastVisitDate;
                  const isEven = index % 2 === 0;
                  
                  return (
                    <tr key={patient._id} className={`${
                      isEven ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-blue-50 transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.name}
                            </div>
                            {patient.email && (
                              <div className="text-sm text-gray-500">
                                {patient.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">
                          {patient.patientCodes?.[0]?.code || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPhone(patient.phone)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full">
                          {completedVisits}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lastVisitDate ? formatDate(lastVisitDate) : (
                          <span className="text-gray-400">No visits yet</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(patient.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => navigate(`/patients/${patient._id}`)}
                            className="inline-flex items-center justify-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Patient"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => navigate(`/patients/${patient._id}/edit`)}
                            className="inline-flex items-center justify-center p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                            title="Edit Patient"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {hasActiveFilters ? 'No patients found' : 'No patients yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters
                ? 'Try adjusting your search or filters'
                : 'No patients found. Patients are created automatically when booking appointments.'
              }
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Helper Text - Show record count */}
      {!isLoading && filteredPatients.length > 0 && (
        <div className="text-sm text-gray-600">
          Showing {filteredPatients.length} of {totalPatients} total patients
        </div>
      )}
      
      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-6">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={pageSize}
              onChange={(e) => updateFilters({ pageSize: Number(e.target.value), page: 1 })}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            <span className="text-sm text-gray-600">
              {totalPatients} total patients
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilters({ page: page - 1 })}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilters({ page: page + 1 })}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
