/**
 * Appointment Detail Page
 * Role-based view for managing appointment details, vitals, and clinical notes
 */

import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  FileText,
  Stethoscope,
  Edit2,
  Save,
  Printer,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Droplet,
  Eye,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  History,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { Modal, ModalFooter } from "../components/ui/Modal";
import {
  useAppointment,
  useUpdateAppointmentVitals,
  useUpdateClinicalNotes,
  useUpdateAppointmentStatus,
  useAppointments,
} from "../api/hooks/useAppointments";
import { useDeletePrescription, usePrescriptions } from "../api/hooks/usePrescriptions";
import { useUpdatePatient } from "../api/hooks/usePatients";
import { useAuth } from "../hooks/useAuth";
import { formatDate, getStatusColor } from "../utils/formatters";
import { toast } from "react-toastify";

export default function AppointmentDetailPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user, isDoctor, isClinicOwner } = useAuth();

  const { data: appointment, isLoading, error } = useAppointment(appointmentId);
  const updateVitals = useUpdateAppointmentVitals();
  const updateClinicalNotes = useUpdateClinicalNotes();
  const updateStatus = useUpdateAppointmentStatus();
  const updatePatient = useUpdatePatient();

  // Fetch past appointments for this patient (for follow-up visits)
  const { data: appointmentsData } = useAppointments({
    patient: appointment?.patient?._id,
  }, {
    enabled: !!appointment?.patient?._id && appointment?.visitType === 'follow_up'
  });

  // Fetch prescriptions for this patient
  const { data: prescriptionsData } = usePrescriptions({
    patientId: appointment?.patient?._id,
  }, {
    enabled: !!appointment?.patient?._id && appointment?.visitType === 'follow_up'
  });

  // Get prescription if exists (prescriptions array is populated from backend)
  const prescription = appointment?.prescriptions?.[0];
  const deletePrescriptionMutation = useDeletePrescription();

  // Local state for editing
  const [editingVitals, setEditingVitals] = useState(false);
  const [editingClinicalNotes, setEditingClinicalNotes] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingPatientInfo, setEditingPatientInfo] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPastVisit, setShowPastVisit] = useState(false);

  // Form state
  const [vitalsData, setVitalsData] = useState({
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    temperature: "",
    pulse: "",
    spo2: "",
    weight: "",
    height: "",
    notes: "",
  });

  const [clinicalData, setClinicalData] = useState({
    chiefComplaint: "",
    symptoms: "",
    examination: "",
    diagnosis: "",
    clinicalNotes: "",
  });

  const [selectedStatus, setSelectedStatus] = useState("scheduled");
  
  const [patientData, setPatientData] = useState({
    age: "",
    gender: "",
  });

  // Initialize form data when appointment loads
  useEffect(() => {
    if (appointment) {
      if (appointment.vitals) {
        setVitalsData({
          bloodPressureSystolic: appointment.vitals.bloodPressureSystolic || "",
          bloodPressureDiastolic:
            appointment.vitals.bloodPressureDiastolic || "",
          temperature: appointment.vitals.temperature || "",
          pulse: appointment.vitals.pulse || "",
          spo2: appointment.vitals.spo2 || "",
          weight: appointment.vitals.weight || "",
          height: appointment.vitals.height || "",
          notes: appointment.vitals.notes || "",
        });
      }
      if (appointment.clinicalNotes) {
        setClinicalData({
          chiefComplaint: appointment.clinicalNotes.chiefComplaint || "",
          symptoms: appointment.clinicalNotes.symptoms || "",
          examination: appointment.clinicalNotes.examination || "",
          diagnosis: appointment.clinicalNotes.diagnosis || "",
          clinicalNotes: appointment.clinicalNotes.additionalNotes || "",
        });
      }
      if (appointment.patient) {
        setPatientData({
          age: appointment.patient.age || "",
          gender: appointment.patient.gender || "",
        });
      }
      setSelectedStatus(appointment.status || "scheduled");
    }
  }, [appointment]);

  // Handle vitals save
  const handleSaveVitals = async () => {
    try {
      await updateVitals.mutateAsync({
        appointmentId,
        vitals: vitalsData,
      });
      toast.success(
        "Vitals saved successfully! Status changed to In Progress."
      );
      setEditingVitals(false);
    } catch (error) {
      toast.error(error.message || "Failed to save vitals");
    }
  };

  // Handle clinical notes save
  const handleSaveClinicalNotes = async () => {
    try {
      await updateClinicalNotes.mutateAsync({
        appointmentId,
        clinicalNotes: clinicalData,
      });
      toast.success("Clinical notes saved successfully!");
      setEditingClinicalNotes(false);
    } catch (error) {
      toast.error(error.message || "Failed to save clinical notes");
    }
  };

  // Handle patient info save
  const handleSavePatientInfo = async () => {
    try {
      await updatePatient.mutateAsync({
        patientId: appointment.patient._id,
        data: patientData,
      });
      toast.success("Patient information updated successfully!");
      setEditingPatientInfo(false);
    } catch (error) {
      toast.error(error.message || "Failed to update patient information");
    }
  };


  // Get last completed visit for follow-up patients
  const lastCompletedVisit = useMemo(() => {
    if (appointment?.visitType !== 'follow_up' || !appointmentsData?.appointments) {
      return null;
    }
    
    const completedVisits = appointmentsData.appointments
      .filter(apt => 
        apt.status === 'completed' && 
        apt._id !== appointmentId &&
        new Date(apt.startAt) < new Date(appointment.startAt)
      )
      .sort((a, b) => new Date(b.startAt) - new Date(a.startAt));
    
    return completedVisits[0];
  }, [appointmentsData, appointment, appointmentId]);

  // Get prescription from last visit
  const lastVisitPrescription = useMemo(() => {
    if (!lastCompletedVisit || !prescriptionsData?.prescriptions) {
      return null;
    }
    
    return prescriptionsData.prescriptions.find(rx => {
      const rxAptId = typeof rx.appointment === 'object' ? rx.appointment?._id : rx.appointment;
      return rxAptId === lastCompletedVisit._id;
    });
  }, [lastCompletedVisit, prescriptionsData]);

  // Handle status change
  const handleStatusChange = async () => {
    try {
      await updateStatus.mutateAsync({
        appointmentId,
        status: selectedStatus,
      });
      toast.success(`Status updated to ${selectedStatus}`);
      setEditingStatus(false);
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  // Calculate BMI
  const calculateBMI = () => {
    if (vitalsData.weight && vitalsData.height) {
      const heightInMeters = vitalsData.height / 100;
      const bmi = (
        vitalsData.weight /
        (heightInMeters * heightInMeters)
      ).toFixed(1);
      return bmi;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" />
        <p className="ml-4 text-gray-600">Loading appointment...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Appointment Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The appointment you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Button onClick={() => navigate("/appointments")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bmi = calculateBMI();

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/appointments")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Appointment Details
            </h1>
            <p className="text-gray-600 mt-1">
              {appointment.patient?.name || "Unknown Patient"} with Dr.{" "}
              {appointment.doctor?.name || "Unknown"}
            </p>
          </div>
        </div>

        {/* Status Badge with Edit */}
        <div className="flex items-center gap-3">
          {editingStatus ? (
            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button size="sm" onClick={handleStatusChange}>
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingStatus(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                appointment.status === 'scheduled' ? 'bg-blue-600 text-white' :
                appointment.status === 'in-progress' ? 'bg-amber-600 text-white' :
                appointment.status === 'completed' ? 'bg-green-600 text-white' :
                appointment.status === 'cancelled' ? 'bg-red-600 text-white' :
                'bg-gray-600 text-white'
              }`}>
                {appointment.status === 'in-progress' ? 'In Progress' :
                 appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || 'Scheduled'}
              </span>
              <button
                onClick={() => setEditingStatus(true)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Change status"
              >
                <Edit2 className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid - 2 Columns */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Patient Info & Appointment Details */}
        <div className="space-y-6">
          {/* Patient Summary Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Patient Information
                </h3>
                {!editingPatientInfo && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingPatientInfo(true)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" /> Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Name and Phone on same line */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">
                    {appointment.patient?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">
                    {appointment.patient?.phone || "N/A"}
                  </p>
                </div>
              </div>

              {/* Age and Gender on same line */}
              {editingPatientInfo ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Age (years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="150"
                      placeholder="Enter age"
                      value={patientData.age}
                      onChange={(e) =>
                        setPatientData({ ...patientData, age: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Gender
                    </label>
                    <select
                      value={patientData.gender}
                      onChange={(e) =>
                        setPatientData({ ...patientData, gender: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-medium">
                      {appointment.patient?.age || "N/A"} years
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium">
                      {appointment.patient?.gender === 'M' ? 'Male' :
                       appointment.patient?.gender === 'F' ? 'Female' :
                       appointment.patient?.gender === 'O' ? 'Other' : "N/A"}
                    </p>
                  </div>
                </div>
              )}

              {editingPatientInfo && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={handleSavePatientInfo}
                    loading={updatePatient.isPending}
                  >
                    <Save className="w-4 h-4 mr-1" /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingPatientInfo(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {/* Patient Code on its own line */}
              <div>
                <p className="text-sm text-gray-600">Patient Code</p>
                <p className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                  {appointment.patient?.patientCodes?.[0]?.code || "N/A"}
                </p>
              </div>

              <Link to={`/patients/${appointment.patient?._id}`}>
                <Button variant="outline" className="w-full mt-4">
                  View Full Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Appointment Details Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Appointment Details
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Date and Time on same line */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">
                    {formatDate(appointment.startAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {new Date(appointment.startAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Doctor and Visit Type on same line */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Doctor</p>
                  <p className="font-medium">
                    Dr. {appointment.doctor?.name || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Visit Type</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                    appointment.visitType === "first_visit"
                      ? "bg-purple-100 text-purple-700 border-purple-200"
                      : "bg-teal-100 text-teal-700 border-teal-200"
                  }`}>
                    {appointment.visitType === "first_visit"
                      ? "First Visit"
                      : "Follow Up"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Vitals (Staff/Doctor) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-600" />
                Vital Signs
              </h3>
              {!editingVitals && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingVitals(true)}
                >
                  <Edit2 className="w-4 h-4 mr-1" /> Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingVitals ? (
              <>
                {/* Blood Pressure and Pulse on same line */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Blood Pressure
                    </label>
                    <div className="flex gap-1.5 items-center">
                      <input
                        type="number"
                        placeholder="Sys"
                        value={vitalsData.bloodPressureSystolic}
                        onChange={(e) =>
                          setVitalsData({
                            ...vitalsData,
                            bloodPressureSystolic: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <span className="text-gray-500">/</span>
                      <input
                        type="number"
                        placeholder="Dia"
                        value={vitalsData.bloodPressureDiastolic}
                        onChange={(e) =>
                          setVitalsData({
                            ...vitalsData,
                            bloodPressureDiastolic: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                      <Heart className="w-4 h-4" /> Pulse (bpm)
                    </label>
                    <input
                      type="number"
                      placeholder="Pulse"
                      value={vitalsData.pulse}
                      onChange={(e) =>
                        setVitalsData({ ...vitalsData, pulse: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Temperature and SpO2 on same line */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                      <Thermometer className="w-4 h-4" /> Temperature (°F)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Temp"
                      value={vitalsData.temperature}
                      onChange={(e) =>
                        setVitalsData({
                          ...vitalsData,
                          temperature: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                      <Droplet className="w-4 h-4" /> SpO2 (%)
                    </label>
                    <input
                      type="number"
                      placeholder="SpO2"
                      value={vitalsData.spo2}
                      onChange={(e) =>
                        setVitalsData({ ...vitalsData, spo2: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Weight & Height */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                      <Weight className="w-4 h-4" /> Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Weight"
                      value={vitalsData.weight}
                      onChange={(e) =>
                        setVitalsData({ ...vitalsData, weight: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      placeholder="Height"
                      value={vitalsData.height}
                      onChange={(e) =>
                        setVitalsData({ ...vitalsData, height: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    value={vitalsData.notes}
                    onChange={(e) =>
                      setVitalsData({ ...vitalsData, notes: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg mt-1"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSaveVitals}
                    loading={updateVitals.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" /> Save Vitals
                  </Button>
                  <Button
                    variant="outline"
                    disabled
                    title="Coming in next sprint"
                  >
                    <FileText className="w-4 h-4 mr-2" /> Upload Lab Results
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingVitals(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Display Vitals */}
                {appointment.vitals ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Blood Pressure</p>
                      <p className="text-lg font-semibold">
                        {appointment.vitals.bloodPressureSystolic}/
                        {appointment.vitals.bloodPressureDiastolic}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Temperature</p>
                      <p className="text-lg font-semibold">
                        {appointment.vitals.temperature}°F
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pulse</p>
                      <p className="text-lg font-semibold">
                        {appointment.vitals.pulse} bpm
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">SpO2</p>
                      <p className="text-lg font-semibold">
                        {appointment.vitals.spo2}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Weight</p>
                      <p className="text-lg font-semibold">
                        {appointment.vitals.weight} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Height</p>
                      <p className="text-lg font-semibold">
                        {appointment.vitals.height} cm
                      </p>
                    </div>
                    {bmi && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">BMI</p>
                        <p className="text-lg font-semibold">{bmi}</p>
                      </div>
                    )}
                    {appointment.vitals.notes && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Notes</p>
                        <p className="text-sm">{appointment.vitals.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No vitals recorded yet. Click Edit to add vitals.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Past Visit Information - Only for Follow-up Visits */}
      {appointment?.visitType === 'follow_up' && lastCompletedVisit && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <button
              onClick={() => setShowPastVisit(!showPastVisit)}
              className="w-full flex items-center justify-between hover:bg-blue-50 p-2 rounded-lg transition-colors"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Past Visit Information
                <span className="text-sm text-gray-500 font-normal">
                  ({formatDate(lastCompletedVisit.startAt)})
                </span>
              </h3>
              {showPastVisit ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </CardHeader>
          
          {showPastVisit && (
            <CardContent className="space-y-6 pt-0">
              {/* Clinical Examination from Last Visit */}
              {lastCompletedVisit.clinicalNotes && (
                <div className="bg-white p-4 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-purple-600" />
                    Clinical Examination
                  </h4>
                  <div className="space-y-3">
                    {lastCompletedVisit.clinicalNotes.chiefComplaint && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Chief Complaint</p>
                        <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                          {lastCompletedVisit.clinicalNotes.chiefComplaint}
                        </p>
                      </div>
                    )}
                    {lastCompletedVisit.clinicalNotes.symptoms && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Symptoms</p>
                        <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                          {lastCompletedVisit.clinicalNotes.symptoms}
                        </p>
                      </div>
                    )}
                    {lastCompletedVisit.clinicalNotes.examination && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Examination</p>
                        <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                          {lastCompletedVisit.clinicalNotes.examination}
                        </p>
                      </div>
                    )}
                    {lastCompletedVisit.clinicalNotes.diagnosis && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Diagnosis</p>
                        <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap bg-amber-50 p-2 rounded border border-amber-200">
                          {lastCompletedVisit.clinicalNotes.diagnosis}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Medications from Last Visit */}
              {lastVisitPrescription && lastVisitPrescription.meds && lastVisitPrescription.meds.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    Medications Prescribed
                  </h4>
                  <div className="space-y-2">
                    {lastVisitPrescription.meds.map((med, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {med.medication?.brandName || med.medication?.genericName || med.medication?.name || 'Medication'}
                          </p>
                          <div className="flex gap-4 mt-1 text-sm text-gray-600">
                            {med.dosage && <span>Dosage: {med.dosage}</span>}
                            {med.frequency && <span>Frequency: {med.frequency}</span>}
                            {med.duration && <span>Duration: {med.duration}</span>}
                          </div>
                          {med.instructions && (
                            <p className="text-xs text-gray-500 mt-1">{med.instructions}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!lastCompletedVisit.clinicalNotes && !lastVisitPrescription && (
                <div className="text-center py-8 text-gray-500">
                  <p>No detailed information available from the last visit.</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Full Width - Clinical Examination (Doctor Only) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-purple-600" />
              Clinical Examination
            </h3>
            {(isDoctor() || isClinicOwner()) && !editingClinicalNotes && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingClinicalNotes(true)}
              >
                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingClinicalNotes ? (
            <>
              {/* Chief Complaint */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Chief Complaint
                </label>
                <input
                  type="text"
                  placeholder="Why did the patient come?"
                  value={clinicalData.chiefComplaint}
                  onChange={(e) =>
                    setClinicalData({
                      ...clinicalData,
                      chiefComplaint: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg mt-1"
                />
              </div>

              {/* Symptoms */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Symptoms
                </label>
                <textarea
                  placeholder="Detailed symptoms..."
                  value={clinicalData.symptoms}
                  onChange={(e) =>
                    setClinicalData({
                      ...clinicalData,
                      symptoms: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg mt-1"
                />
              </div>

              {/* Examination Findings */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Examination Findings
                </label>
                <textarea
                  placeholder="Physical examination findings..."
                  value={clinicalData.examination}
                  onChange={(e) =>
                    setClinicalData({
                      ...clinicalData,
                      examination: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg mt-1"
                />
              </div>

              {/* Diagnosis */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Diagnosis
                </label>
                <input
                  type="text"
                  placeholder="Primary diagnosis..."
                  value={clinicalData.diagnosis}
                  onChange={(e) =>
                    setClinicalData({
                      ...clinicalData,
                      diagnosis: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg mt-1"
                />
              </div>

              {/* Clinical Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Clinical Notes
                </label>
                <textarea
                  placeholder="Treatment plan, recommendations, and additional notes..."
                  value={clinicalData.clinicalNotes}
                  onChange={(e) =>
                    setClinicalData({
                      ...clinicalData,
                      clinicalNotes: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg mt-1"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSaveClinicalNotes}
                  loading={updateClinicalNotes.isPending}
                >
                  <Save className="w-4 h-4 mr-2" /> Save Notes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingClinicalNotes(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Display Clinical Notes */}
              {appointment.clinicalNotes ? (
                <div className="space-y-4">
                  {appointment.clinicalNotes.chiefComplaint && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Chief Complaint
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        {appointment.clinicalNotes.chiefComplaint}
                      </p>
                    </div>
                  )}
                  {appointment.clinicalNotes.symptoms && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Symptoms
                      </p>
                      <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                        {appointment.clinicalNotes.symptoms}
                      </p>
                    </div>
                  )}
                  {appointment.clinicalNotes.examination && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Examination
                      </p>
                      <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                        {appointment.clinicalNotes.examination}
                      </p>
                    </div>
                  )}
                  {appointment.clinicalNotes.diagnosis && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Diagnosis
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        {appointment.clinicalNotes.diagnosis}
                      </p>
                    </div>
                  )}
                  {appointment.clinicalNotes.additionalNotes && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Clinical Notes
                      </p>
                      <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                        {appointment.clinicalNotes.additionalNotes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No clinical notes recorded yet.
                  {(isDoctor() || isClinicOwner()) &&
                    " Click Edit to add notes."}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Prescription Section */}
      {(isDoctor() || isClinicOwner()) &&
        appointment.status !== "cancelled" && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Prescription
                </h3>
              </div>
            </CardHeader>
            <CardContent>
              {prescription ? (
                <div className="space-y-4">
                  {/* Prescription Info */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-green-900">
                          Prescription Created
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          Created on {formatDate(prescription.createdAt)}
                        </p>
                        {prescription.lastEditedAt && (
                          <p className="text-sm text-green-600 mt-1">
                            Last edited on{" "}
                            {formatDate(prescription.lastEditedAt)} at{" "}
                            {new Date(
                              prescription.lastEditedAt
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                        <p className="text-sm text-green-600 mt-2">
                          {prescription.meds?.length || 0} medication(s)
                          prescribed
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(`/prescriptions/${prescription._id}`)
                          }
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(
                              `/prescriptions/new?appointmentId=${appointmentId}&patientId=${appointment.patient?._id}&editId=${prescription._id}`
                            )
                          }
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // TODO: Implement PDF download
                            toast.info("PDF download coming soon");
                          }}
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowDeleteModal(true)}
                          title="Delete"
                          className="text-red-600 hover:text-red-700 hover:border-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-4">
                    No prescription created yet
                  </p>
                  {appointment.prescriptions?.length === 0 && (
                    <Link
                      to={`/prescriptions/new?appointmentId=${appointmentId}&patientId=${appointment.patient?._id}`}
                    >
                      <Button>
                        <FileText className="w-4 h-4 mr-2" />
                        Create Prescription
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Prescription"
      >
        <p className="text-gray-700">
          Are you sure you want to delete this prescription? This action cannot
          be undone.
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              try {
                await deletePrescriptionMutation.mutateAsync(prescription._id);
                toast.success("Prescription deleted successfully");
                setShowDeleteModal(false);
              } catch (error) {
                toast.error("Failed to delete prescription");
              }
            }}
            loading={deletePrescriptionMutation.isPending}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
