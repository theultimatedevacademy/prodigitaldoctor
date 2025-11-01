/**
 * AppointmentsPage Component
 * Lists all appointments for the selected clinic
 */

import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { Calendar, Plus, X } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { SearchInput } from "../components/ui/SearchInput";
import { Spinner } from "../components/ui/Spinner";
import { DateRangePicker } from "../components/ui/DateRangePicker";
import { CustomSelect } from "../components/ui/CustomSelect";
import { AppointmentCard } from "../features/appointments/AppointmentCard";
import { useAppointments } from "../api/hooks/useAppointments";
import { useClinicContext } from '../contexts/ClinicContext';

const AppointmentsPage = () => {
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
  const statusFilter = searchParams.get('status') || 'all';
  const visitTypeFilter = searchParams.get('visitType') || 'all';
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
          // Only add date to URL if it's different from today
          if (value !== today) {
            newParams.set(key, value);
          } else {
            newParams.delete(key);
          }
        } else if (key === 'status' && value === 'all') {
          newParams.delete(key);
        } else if (key === 'visitType' && value === 'all') {
          newParams.delete(key);
        } else if (key === 'page' && value === 1) {
          newParams.delete(key);
        } else if (key === 'pageSize' && value === 12) {
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

  const { data: appointmentsData, isLoading } = useAppointments(
    {
      clinic: selectedClinicId,
      status: statusFilter !== "all" ? statusFilter : undefined,
      visitType: visitTypeFilter !== "all" ? visitTypeFilter : undefined,
      startDate,
      endDate,
      page,
      limit: pageSize,
    },
    {
      enabled: !!selectedClinicId,
    }
  );

  const appointments = appointmentsData?.appointments || [];
  const pagination = appointmentsData?.pagination || { total: 0, page: 1, pages: 1 };
  
  // Fetch all appointments for counts (without pagination)
  const { data: allAppointmentsData } = useAppointments(
    {
      clinic: selectedClinicId,
      startDate,
      endDate,
      limit: 1000, // Get all for counts
    },
    {
      enabled: !!selectedClinicId,
    }
  );
  
  const allAppointments = allAppointmentsData?.appointments || [];
  
  // Calculate counts for each status
  const statusCounts = useMemo(() => {
    const counts = {
      all: allAppointments.length,
      scheduled: 0,
      'in-progress': 0,
      completed: 0,
      cancelled: 0,
    };
    
    allAppointments.forEach(apt => {
      if (counts.hasOwnProperty(apt.status)) {
        counts[apt.status]++;
      }
    });
    
    return counts;
  }, [allAppointments]);
  
  // Calculate counts for each visit type
  const visitTypeCounts = useMemo(() => {
    const counts = {
      all: allAppointments.length,
      first_visit: 0,
      follow_up: 0,
    };
    
    allAppointments.forEach(apt => {
      if (apt.visitType === 'first_visit') {
        counts.first_visit++;
      } else if (apt.visitType === 'follow_up') {
        counts.follow_up++;
      }
    });
    
    return counts;
  }, [allAppointments]);

  // Filter appointments by search term (client-side for current page)
  const filteredAppointments = appointments.filter((apt) => {
    const searchLower = searchTerm.toLowerCase();
    
    // Get patient code
    const patientCode = apt.patient?.patientCodes?.[0]?.code || '';
    
    // Get phone number
    const phoneNumber = apt.patient?.phone || '';
    
    return (
      apt.patient?.name?.toLowerCase().includes(searchLower) ||
      patientCode.toLowerCase().includes(searchLower) ||
      phoneNumber.includes(searchLower)
    );
  });
  
  // Clear all filters - remove all URL params
  const handleClearFilters = () => {
    setSearchParams({});
  };
  
  // Check if any filters are active (different from defaults)
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || visitTypeFilter !== 'all' || (startDate !== today) || (endDate !== today);

  if (!selectedClinicId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Clinic Selected
            </h2>
            <p className="text-gray-600 mb-6">
              Please select a clinic to view appointments
            </p>
            <Link to="/clinics">
              <Button>Select Clinic</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
            Appointments
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage all clinic appointments</p>
        </div>
        <Link to="/appointments/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </Link>
      </div>

      {/* Filters Section */}
      <div className="space-y-4">
        {/* Search, Date Range, Visit Type, and Clear Filters */}
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
          
          {/* Visit Type Filter */}
          <CustomSelect
            id="visit-type-filter"
            name="visitType"
            value={visitTypeFilter}
            onChange={(e) => updateFilters({ visitType: e.target.value, page: 1 })}
            ariaLabel="Filter by visit type"
            options={[
              { value: 'all', label: `All Visits (${visitTypeCounts.all})` },
              { value: 'first_visit', label: `First Visit (${visitTypeCounts.first_visit})` },
              { value: 'follow_up', label: `Follow Up (${visitTypeCounts.follow_up})` },
            ]}
          />
          
          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium whitespace-nowrap"
              title="Clear all filters"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
        
        {/* Status Badge Filter Bar */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilters({ status: 'all', page: 1 })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All <span className="ml-1.5 font-semibold">{statusCounts.all}</span>
          </button>
          <button
            onClick={() => updateFilters({ status: 'scheduled', page: 1 })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              statusFilter === 'scheduled'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            Scheduled <span className="ml-1.5 font-semibold">{statusCounts.scheduled}</span>
          </button>
          <button
            onClick={() => updateFilters({ status: 'in-progress', page: 1 })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              statusFilter === 'in-progress'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            In Progress <span className="ml-1.5 font-semibold">{statusCounts['in-progress']}</span>
          </button>
          <button
            onClick={() => updateFilters({ status: 'completed', page: 1 })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              statusFilter === 'completed'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            Completed <span className="ml-1.5 font-semibold">{statusCounts.completed}</span>
          </button>
          <button
            onClick={() => updateFilters({ status: 'cancelled', page: 1 })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              statusFilter === 'cancelled'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Cancelled <span className="ml-1.5 font-semibold">{statusCounts.cancelled}</span>
          </button>
        </div>
      </div>

      {/* Appointments Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Spinner size="lg" />
          <p className="text-gray-600 mt-4">Loading appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div>
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {appointments.length === 0
                ? "No Appointments Yet"
                : "No Matching Appointments"}
            </h2>
            <p className="text-gray-600 mb-6">
              {appointments.length === 0
                ? "Create your first appointment to get started"
                : "Try adjusting your search or filters"}
            </p>
            {appointments.length === 0 && (
              <Link to="/appointments/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Appointment
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAppointments.map((appointment) => (
            <Link key={appointment._id} to={`/appointments/${appointment._id}`}>
              <AppointmentCard appointment={appointment} />
            </Link>
          ))}
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

export default AppointmentsPage;
