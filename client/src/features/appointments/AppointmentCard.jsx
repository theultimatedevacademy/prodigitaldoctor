/**
 * AppointmentCard Component
 * Displays appointment information in a card format
 */

import { Card, CardContent } from "../../components/ui/Card";

/**
 * Get status badge styling based on appointment status
 */
const getStatusStyle = (status) => {
  const normalizedStatus = status?.toLowerCase() || "scheduled";

  switch (normalizedStatus) {
    case "scheduled":
      return "bg-blue-600 text-white";
    case "in-progress":
      return "bg-amber-600 text-white";
    case "completed":
      return "bg-green-600 text-white";
    case "cancelled":
      return "bg-red-600 text-white";
    default:
      return "bg-gray-600 text-white";
  }
};

/**
 * Get card background color based on appointment status
 */
const getCardBgColor = (status) => {
  const normalizedStatus = status?.toLowerCase() || "scheduled";

  switch (normalizedStatus) {
    case "scheduled":
      return "bg-blue-50";
    case "in-progress":
      return "bg-amber-50";
    case "completed":
      return "bg-green-50";
    case "cancelled":
      return "bg-red-50";
    default:
      return "bg-gray-50";
  }
};

/**
 * Format status text for display
 */
const formatStatus = (status) => {
  const normalizedStatus = status?.toLowerCase() || "scheduled";

  if (normalizedStatus === "in-progress") {
    return "In Progress";
  }

  return status?.charAt(0).toUpperCase() + status?.slice(1) || "Scheduled";
};

/**
 * Get visit type badge styling
 */
const getVisitTypeStyle = (visitType) => {
  const normalizedType = visitType?.toLowerCase() || "first_visit";
  
  switch (normalizedType) {
    case "first_visit":
      return "bg-purple-100 text-purple-700 border border-purple-200";
    case "follow_up":
      return "bg-teal-100 text-teal-700 border border-teal-200";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
};

/**
 * Format visit type text for display
 */
const formatVisitType = (visitType) => {
  const normalizedType = visitType?.toLowerCase() || "first_visit";
  
  if (normalizedType === "first_visit") {
    return "First Visit";
  } else if (normalizedType === "follow_up") {
    return "Follow Up";
  }
  
  return "Unknown";
};

/**
 * Format appointment date for display
 */
const formatAppointmentDate = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * AppointmentCard component for displaying appointment summary
 * @param {object} props - Component props
 * @param {object} props.appointment - Appointment data
 * @param {Function} props.onClick - Click handler
 * @returns {JSX.Element} AppointmentCard component
 */
export function AppointmentCard({ appointment, onClick }) {
  // Get patient code (ID)
  const patientCode =
    appointment.patient?.patientCodes?.[0]?.code ||
    appointment.patient?.id ||
    "N/A";

  return (
    <Card
      onClick={onClick}
      className={`hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer ${getCardBgColor(appointment.status)}`}
    >
      <CardContent className="p-5 pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
              {appointment.patient?.name || "Unknown Patient"}
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              Patient Code: {patientCode}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              📅 {formatAppointmentDate(appointment.startAt)}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ml-3 ${getStatusStyle(appointment.status)}`}
          >
            {formatStatus(appointment.status)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Doctor Badge */}
          {appointment.doctor && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
              <span className="text-base">👨‍⚕️</span>
              <span className="text-sm font-medium text-gray-700">
                Dr. {appointment.doctor.name}
              </span>
            </div>
          )}
          
          {/* Visit Type Badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-sm ${getVisitTypeStyle(appointment.visitType)}`}>
            <span className="text-xs font-semibold">
              {formatVisitType(appointment.visitType)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
