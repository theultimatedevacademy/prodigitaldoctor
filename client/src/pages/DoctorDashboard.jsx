/**
 * DoctorDashboard Component
 * Main dashboard for doctors with today's appointments and quick actions
 */

import { Link } from "react-router";
import { Plus, Users, Calendar, FileText, TrendingUp } from "lucide-react";
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
    useAppointments({
      clinicId: selectedClinicId,
      doctorId: user?._id,
      date: today,
    });

  const { data: patientsData, isLoading: loadingPatients } = usePatients(
    selectedClinicId,
    { limit: 5 }
  );
  const { data: prescriptionsData } = usePrescriptions({
    clinicId: selectedClinicId,
    limit: 5,
  });

  const todayAppointments = appointmentsData?.appointments || [];
  const recentPatients = patientsData?.patients || [];

  if (!selectedClinicId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-clinical-700 mb-4">
          Please select a clinic to continue
        </h2>
        <Link to="/clinics/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New Clinic
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-clinical-900">Dashboard</h1>
          <p className="text-clinical-600 mt-1">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Calendar className="w-6 h-6 text-primary-600" />}
          label="Today's Appointments"
          value={todayAppointments.length}
          trend="+2 from yesterday"
        />
        <StatCard
          icon={<Users className="w-6 h-6 text-green-600" />}
          label="Total Patients"
          value={patientsData?.total || 0}
          trend="Active patients"
        />
        <StatCard
          icon={<FileText className="w-6 h-6 text-blue-600" />}
          label="Prescriptions (Month)"
          value={prescriptionsData?.total || 0}
          trend="This month"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          label="Completion Rate"
          value="94%"
          trend="+3% from last month"
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
                <div className="text-center py-8 text-clinical-600">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-clinical-400" />
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
              <div className="space-y-2">
                <Link to="/patients/new" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Patient
                  </Button>
                </Link>
                <Link to="/prescriptions/new" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Create Prescription
                  </Button>
                </Link>
                <Link to="/meds" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Search Medications
                  </Button>
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
                <Spinner />
              ) : recentPatients.length > 0 ? (
                <div className="space-y-3">
                  {recentPatients.slice(0, 5).map((patient) => (
                    <Link
                      key={patient._id}
                      to={`/patients/${patient._id}`}
                      className="block p-3 hover:bg-clinical-50 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-clinical-900">
                        {patient.name}
                      </div>
                      <div className="text-sm text-clinical-600">
                        {patient.patientCodes?.[0]?.code}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-clinical-600 text-center py-4">
                  No patients yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

function StatCard({ icon, label, value, trend }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-clinical-50 rounded-lg">{icon}</div>
        </div>
        <div className="text-2xl font-bold text-clinical-900">{value}</div>
        <div className="text-sm text-clinical-600">{label}</div>
        {trend && <div className="text-xs text-clinical-500 mt-1">{trend}</div>}
      </CardContent>
    </Card>
  );
}

export default DoctorDashboard;
