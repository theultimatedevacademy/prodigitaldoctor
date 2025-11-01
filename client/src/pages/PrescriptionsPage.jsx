/**
 * PrescriptionsPage Component
 * Lists all prescriptions for the selected clinic
 */

import { useSearchParams, useNavigate, Link } from "react-router";
import { FileText, X, Eye } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { SearchInput } from "../components/ui/SearchInput";
import { DateRangePicker } from "../components/ui/DateRangePicker";
import { Spinner } from "../components/ui/Spinner";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { usePrescriptions } from "../api/hooks/usePrescriptions";
import { useClinicContext } from '../contexts/ClinicContext';
import { formatDate } from "../utils/formatters";

const PrescriptionsPage = () => {
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
  
  // Read filters from URL params (with defaults)
  const searchTerm = searchParams.get('search') || '';
  const startDate = searchParams.get('startDate') || today;
  const endDate = searchParams.get('endDate') || today;
  const page = parseInt(searchParams.get('page')) || 1;
  const pageSize = parseInt(searchParams.get('pageSize')) || 12;
  
  // Helper to update URL params
  const updateFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        // Special handling for default values - don't add to URL
        if (key === 'startDate' || key === 'endDate') {
          // Only add date to URL if it's different from today or if we're clearing filters
          if (value !== today) {
            newParams.set(key, value);
          } else {
            newParams.delete(key);
          }
        } else if (key === 'page' && value === 1) {
          // Don't add page=1 to URL (it's the default)
          newParams.delete(key);
        } else if (key === 'pageSize' && value === 12) {
          // Don't add pageSize=12 to URL (it's the default)
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

  // Build query params - only include dates if they have values
  const queryParams = {
    clinicId: selectedClinicId,
    page,
    limit: pageSize,
  };
  
  // Only add date filters if they're set
  if (startDate && endDate) {
    queryParams.startDate = startDate;
    queryParams.endDate = endDate;
  }

  const { data: prescriptionsData, isLoading } = usePrescriptions(
    queryParams,
    {
      enabled: !!selectedClinicId,
    }
  );

  const prescriptions = prescriptionsData?.data || [];
  const pagination = prescriptionsData?.pagination || { total: 0, page: 1, pages: 1 };

  // Filter prescriptions by search term (client-side)
  const filteredPrescriptions = prescriptions.filter((rx) => {
    const searchLower = searchTerm.toLowerCase();
    
    // Get patient code
    const patientCode = rx.patient?.patientCodes?.[0]?.code || '';
    
    // Get phone number
    const phoneNumber = rx.patient?.phone || '';
    
    return (
      rx.patient?.name?.toLowerCase().includes(searchLower) ||
      patientCode.toLowerCase().includes(searchLower) ||
      phoneNumber.includes(searchLower)
    );
  });
  
  // Clear all filters - remove all URL params
  const handleClearFilters = () => {
    setSearchParams({});
  };
  
  // Check if any filters are active (different from defaults)
  const hasActiveFilters = searchTerm || (startDate !== today) || (endDate !== today);

  if (!selectedClinicId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Clinic Selected
            </h2>
            <p className="text-gray-600 mb-6">
              Please select a clinic to view prescriptions
            </p>
            <Link to="/clinics">
              <Button>Select Clinic</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Spinner size="lg" />
          <p className="text-gray-600 mt-4">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
          Prescriptions
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage all clinic prescriptions</p>
      </div>

      {/* Filters Section */}
      <div className="space-y-4">
        {/* Search and Date Range */}
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

      {/* Prescriptions Table */}
      {filteredPrescriptions.length === 0 ? (
        <div>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {prescriptions.length === 0
                ? "No Prescriptions Yet"
                : "No Matching Prescriptions"}
            </h2>
            <p className="text-gray-600">
              {prescriptions.length === 0
                ? "Prescriptions will appear here once created from appointments"
                : "Try adjusting your search"}
            </p>
          </div>
        </div>
      ) : (
        <PrescriptionsTable prescriptions={filteredPrescriptions} />
      )}

      {/* Helper Text - Show record count */}
      {!isLoading && filteredPrescriptions.length > 0 && (
        <div className="text-sm text-gray-600">
          Showing {filteredPrescriptions.length} of {pagination.total} total prescriptions
        </div>
      )}
      
      {/* Pagination */}
      {!isLoading && pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={pageSize}
              onChange={(e) => updateFilters({ pageSize: Number(e.target.value), page: 1 })}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value={6}>6 per page</option>
              <option value={12}>12 per page</option>
              <option value={24}>24 per page</option>
              <option value={48}>48 per page</option>
            </select>
            <span className="text-sm text-gray-600">
              {pagination.total} total prescriptions
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilters({ page: page - 1 })}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilters({ page: page + 1 })}
              disabled={page === pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

function PrescriptionsTable({ prescriptions }) {
  const navigate = useNavigate();
  
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getVisitTypeStyle = (visitType) => {
    const normalizedType = visitType?.toLowerCase() || 'first_visit';
    
    switch (normalizedType) {
      case 'first_visit':
        return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'follow_up':
        return 'bg-teal-100 text-teal-700 border border-teal-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };
  
  const formatVisitType = (visitType) => {
    const normalizedType = visitType?.toLowerCase() || 'first_visit';
    
    if (normalizedType === 'first_visit') {
      return 'First Visit';
    } else if (normalizedType === 'follow_up') {
      return 'Follow Up';
    }
    
    return 'Unknown';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Patient Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Patient Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Medications
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Visit Type
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {prescriptions.map((prescription, index) => {
              const patientCode = prescription.patient?.patientCodes?.[0]?.code || 'N/A';
              const medsCount = prescription.meds?.length || 0; // Fixed: use 'meds' not 'medications'
              const visitType = prescription.appointment?.visitType || 'first_visit'; // Get from appointment
              const isEven = index % 2 === 0;
              
              return (
                <tr
                  key={prescription._id}
                  className={`${
                    isEven ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50 transition-colors`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {prescription.patient?.name || 'Unknown Patient'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-700">
                      {patientCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDateTime(prescription.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {medsCount} med{medsCount !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${getVisitTypeStyle(visitType)}`}>
                      {formatVisitType(visitType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => navigate(`/prescriptions/${prescription._id}`)}
                      className="inline-flex items-center justify-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                      title="View Prescription"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PrescriptionsPage;
