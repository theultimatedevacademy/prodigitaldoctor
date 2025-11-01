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
  RefreshCw,
  BarChart3,
  UserX,
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
import { useClinicContext } from "../contexts/ClinicContext";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../utils/formatters";

const DoctorDashboard = () => {
  const { selectedClinicId } = useClinicContext();
  const { user } = useAuth();

  // Get today's date in local timezone (not UTC)
  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = getTodayDateString();

  // Get current month date range
  const getMonthDateRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    return {
      startDate: formatDate(firstDay),
      endDate: formatDate(lastDay),
    };
  };

  // Get last month date range for comparison
  const getLastMonthDateRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    return {
      startDate: formatDate(firstDay),
      endDate: formatDate(lastDay),
    };
  };

  const { startDate: monthStart, endDate: monthEnd } = getMonthDateRange();
  const { startDate: lastMonthStart, endDate: lastMonthEnd } =
    getLastMonthDateRange();

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

  // Fetch all appointments for the month to calculate stats
  const { data: monthAppointmentsData } = useAppointments(
    {
      clinicId: selectedClinicId,
      startDate: monthStart,
      endDate: monthEnd,
      limit: 1000,
    },
    {
      enabled: !!selectedClinicId,
    }
  );

  const { data: patientsData, isLoading: loadingPatients } = usePatients(
    selectedClinicId,
    {
      limit: 5,
      enabled: !!selectedClinicId, // Only fetch when clinic is selected
    }
  );

  // Fetch all patients count for stats
  const { data: allPatientsData } = usePatients(selectedClinicId, {
    limit: 1,
    enabled: !!selectedClinicId,
  });

  const { data: prescriptionsData } = usePrescriptions(
    {
      clinicId: selectedClinicId,
      startDate: monthStart,
      endDate: monthEnd,
      limit: 1000,
    },
    {
      enabled: !!selectedClinicId, // Only fetch when clinic is selected
    }
  );

  // Fetch recent prescriptions for display
  const { data: recentPrescriptionsData } = usePrescriptions(
    {
      clinicId: selectedClinicId,
      limit: 5,
    },
    {
      enabled: !!selectedClinicId,
    }
  );

  // Fetch last month's patients for growth calculation
  const { data: lastMonthPatientsData } = usePatients(selectedClinicId, {
    limit: 1,
    enabled: !!selectedClinicId,
  });

  const todayAppointments = appointmentsData?.appointments || [];
  const recentPatients = patientsData?.patients || [];
  const monthAppointments = monthAppointmentsData?.appointments || [];
  const monthPrescriptions = prescriptionsData?.data || [];

  // Calculate Patient Growth Rate
  const calculatePatientGrowth = () => {
    const currentTotal = allPatientsData?.total || 0;
    // For simplicity, we'll show the new patients this month
    // In a real scenario, you'd fetch last month's total and compare
    const newPatientsThisMonth = monthAppointments.filter(
      (apt) => apt.visitType === "first_visit"
    ).length;
    return newPatientsThisMonth;
  };

  // Calculate Follow-up Rate
  const calculateFollowUpRate = () => {
    if (monthAppointments.length === 0) return 0;
    const followUps = monthAppointments.filter(
      (apt) => apt.visitType === "follow_up"
    ).length;
    return Math.round((followUps / monthAppointments.length) * 100);
  };

  // Calculate Average Appointments Per Day
  const calculateAvgAppointmentsPerDay = () => {
    if (monthAppointments.length === 0) return 0;
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const daysPassed =
      Math.ceil((today - firstDayOfMonth) / (1000 * 60 * 60 * 24)) + 1;
    return (monthAppointments.length / daysPassed).toFixed(1);
  };

  // Calculate Cancelled/NoShow Rate
  const calculateCancelledRate = () => {
    if (monthAppointments.length === 0) return 0;
    const cancelled = monthAppointments.filter(
      (apt) => apt.status === "cancelled"
    ).length;
    return Math.round((cancelled / monthAppointments.length) * 100);
  };

  // Calculate Average Medications Per Prescription
  const calculateAvgMedications = () => {
    if (monthPrescriptions.length === 0) return 0;
    const totalMeds = monthPrescriptions.reduce(
      (sum, rx) => sum + (rx.meds?.length || 0),
      0
    );
    return (totalMeds / monthPrescriptions.length).toFixed(1);
  };

  const patientGrowth = calculatePatientGrowth();
  const followUpRate = calculateFollowUpRate();
  const avgAppointmentsPerDay = calculateAvgAppointmentsPerDay();
  const cancelledRate = calculateCancelledRate();
  const avgMedications = calculateAvgMedications();

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {formatDate(new Date(), "EEEE, MMMM dd, yyyy")}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/appointments/new">
            <Button>
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
          trend={`${monthAppointments.length} this month`}
        />
        <StatCard
          icon={Users}
          iconColor="text-green-600"
          bgColor="bg-green-50"
          label="Total Patients"
          value={allPatientsData?.pagination?.total || 0}
          trend={`+${patientGrowth} new this month`}
        />
        <StatCard
          icon={FileText}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
          label="Prescriptions (Month)"
          value={monthPrescriptions.length}
          trend="This month"
        />
        <StatCard
          icon={TrendingUp}
          iconColor="text-orange-600"
          bgColor="bg-orange-50"
          label="Patient Growth"
          value={`+${patientGrowth}`}
          trend="New patients this month"
        />
        <StatCard
          icon={RefreshCw}
          iconColor="text-teal-600"
          bgColor="bg-teal-50"
          label="Follow-up Rate"
          value={`${followUpRate}%`}
          trend="Returning patients"
        />
        <StatCard
          icon={BarChart3}
          iconColor="text-indigo-600"
          bgColor="bg-indigo-50"
          label="Avg Appointments/Day"
          value={avgAppointmentsPerDay}
          trend="This month average"
        />
        <StatCard
          icon={UserX}
          iconColor="text-rose-600"
          bgColor="bg-rose-50"
          label="Cancelled Rate"
          value={`${cancelledRate}%`}
          trend="Cancelled appointments"
        />
        <StatCard
          icon={Pill}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
          label="Avg Meds/Prescription"
          value={avgMedications}
          trend="Per prescription"
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
                <Link to="/appointments/new" className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-blue-700">
                      New Appointment
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
