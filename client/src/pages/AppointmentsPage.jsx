/**
 * AppointmentsPage Component
 * Lists all appointments for the selected clinic
 */

import { useState } from "react";
import { Link } from "react-router";
import { Calendar, Plus, Filter } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { SearchInput } from "../components/ui/SearchInput";
import { Spinner } from "../components/ui/Spinner";
import { AppointmentCard } from "../features/appointments/AppointmentCard";
import { useAppointments } from "../api/hooks/useAppointments";
import { useClinicContext } from "../hooks/useClinicContext";

const AppointmentsPage = () => {
  const { selectedClinicId } = useClinicContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: appointmentsData, isLoading } = useAppointments(
    {
      clinicId: selectedClinicId,
      status: statusFilter !== "all" ? statusFilter : undefined,
    },
    {
      enabled: !!selectedClinicId,
    }
  );

  const appointments = appointmentsData?.appointments || [];

  // Filter appointments by search term
  const filteredAppointments = appointments.filter((apt) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      apt.patient?.name?.toLowerCase().includes(searchLower) ||
      apt.doctor?.name?.toLowerCase().includes(searchLower) ||
      apt.reason?.toLowerCase().includes(searchLower)
    );
  });

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Spinner size="lg" />
          <p className="text-gray-600 mt-4">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            Appointments
          </h1>
          <p className="text-gray-600 mt-1">Manage all clinic appointments</p>
        </div>
        <Link to="/appointments/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-3xl">
        <div className="flex-1">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by patient, doctor, or reason..."
          />
        </div>
        <div className="relative sm:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
          </select>
        </div>
      </div>

      {/* Appointments Grid */}
      {filteredAppointments.length === 0 ? (
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.map((appointment) => (
            <Link key={appointment._id} to={`/appointments/${appointment._id}`}>
              <AppointmentCard appointment={appointment} />
            </Link>
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredAppointments.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {filteredAppointments.length} of {appointments.length}{" "}
          appointments
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
