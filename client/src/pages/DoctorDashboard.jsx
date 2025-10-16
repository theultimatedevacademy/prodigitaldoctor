/**
 * DoctorDashboard Component
 * Main dashboard for doctors with today's appointments and quick actions
 */

import { Link } from "react-router";
import {
  Plus,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Building2,
  Pill,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { Badge } from "../components/ui/Badge";
import { AppointmentCard } from "../features/appointments/AppointmentCard";
import { useAppointments } from "../api/hooks/useAppointments";
import { usePatients } from "../api/hooks/usePatients";
import { usePrescriptions } from "../api/hooks/usePrescriptions";
import { useClinicContext } from "../hooks/useClinicContext";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../utils/formatters";

const DoctorDashboard = () => {
  const { selectedClinicId } = useClinicContext();
  const { user } = useAuth();

  const today = new Date().toISOString().split("T")[0];

  const { data: appointmentsData, isLoading: loadingAppointments } =
    useAppointments(
      {
        clinicId: selectedClinicId,
        doctorId: user?._id,
        date: today,
      },
      {
        enabled: !!selectedClinicId, // Only fetch when clinic is selected
      }
    );

  const { data: patientsData, isLoading: loadingPatients } = usePatients(
    selectedClinicId,
    {
      limit: 5,
      enabled: !!selectedClinicId, // Only fetch when clinic is selected
    }
  );

  const { data: prescriptionsData } = usePrescriptions(
    {
      clinicId: selectedClinicId,
      limit: 5,
    },
    {
      enabled: !!selectedClinicId, // Only fetch when clinic is selected
    }
  );

  const todayAppointments = appointmentsData?.appointments || [];
  const recentPatients = patientsData?.patients || [];

  if (!selectedClinicId) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Welcome to ProDigitalDoctor!
        </h2>
        <p className="text-gray-600 mb-6">
          Create your first clinic to start managing patients and prescriptions
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/clinics/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create New Clinic
            </Button>
          </Link>
          <Link to="/clinics">
            <Button variant="outline">View All Clinics</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {formatDate(new Date(), "EEEE, MMMM dd, yyyy")}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/patients/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Patient
            </Button>
          </Link>
          <Link to="/appointments/new">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Calendar}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          label="Today's Appointments"
          value={todayAppointments.length}
          trend="+0 from yesterday"
        />
        <StatCard
          icon={Users}
          iconColor="text-green-600"
          bgColor="bg-green-50"
          label="Total Patients"
          value={patientsData?.total || 0}
          trend="Active patients"
        />
        <StatCard
          icon={FileText}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
          label="Prescriptions (Month)"
          value={prescriptionsData?.total || 0}
          trend="This month"
        />
        <StatCard
          icon={TrendingUp}
          iconColor="text-orange-600"
          bgColor="bg-orange-50"
          label="Completion Rate"
          value="0%"
          trend="No data available"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Today's Appointments</CardTitle>
                <Link to="/appointments">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAppointments ? (
                <div className="text-center py-8">
                  <Spinner />
                </div>
              ) : todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.slice(0, 5).map((appointment) => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment}
                      onClick={() =>
                        (window.location.href = `/appointments/${appointment._id}`)
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/patients/new" className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Plus className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-blue-700">
                      Add New Patient
                    </span>
                  </div>
                </Link>
                <Link to="/prescriptions/new" className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-purple-700">
                      Create Prescription
                    </span>
                  </div>
                </Link>
                <Link to="/meds" className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <Pill className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-green-700">
                      Search Medications
                    </span>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Patients</CardTitle>
                <Link to="/patients">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPatients ? (
                <div className="text-center py-8">
                  <Spinner />
                </div>
              ) : recentPatients.length > 0 ? (
                <div className="space-y-2">
                  {recentPatients.slice(0, 5).map((patient) => (
                    <Link
                      key={patient._id}
                      to={`/patients/${patient._id}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {patient.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {patient.patientCodes?.[0]?.code}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">No patients yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

function StatCard({ icon: Icon, iconColor, bgColor, label, value, trend }) {
  return (
    <Card
      className={`overflow-hidden hover:cursor-pointer transition-shadow ${bgColor}`}
    >
      <CardContent className="p-6">
        <div className={`flex items-center justify-between mb-4`}>
          <div className={`p-3 rounded-xl`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              {trend}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default DoctorDashboard;
