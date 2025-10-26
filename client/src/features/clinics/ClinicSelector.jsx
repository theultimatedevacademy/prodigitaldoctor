/**
 * ClinicSelector Component
 * Dropdown to select active clinic with role badges
 */

import { Link } from "react-router";
import {
  Building2,
  ChevronDown,
  Plus,
  Crown,
  Stethoscope,
  Users,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useClinicContext } from "../../contexts/ClinicContext";
import { Spinner } from "../../components/ui/Spinner";

/**
 * ClinicSelector component for switching between clinics
 * Displays in the top navigation bar
 * @returns {JSX.Element} ClinicSelector component
 */
/**
 * Get role badge configuration
 */
const getRoleBadge = (role) => {
  switch (role) {
    case "clinic_owner":
      return {
        icon: Crown,
        label: "Owner",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-700",
        borderColor: "border-yellow-300",
      };
    case "doctor":
      return {
        icon: Stethoscope,
        label: "Doctor",
        bgColor: "bg-blue-100",
        textColor: "text-blue-700",
        borderColor: "border-blue-300",
      };
    case "staff":
      return {
        icon: Users,
        label: "Staff",
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
        borderColor: "border-gray-300",
      };
    default:
      return null;
  }
};

export function ClinicSelector() {
  const { user } = useAuth();
  const {
    selectedClinic,
    switchClinic,
    isLoading: isContextLoading,
  } = useClinicContext();

  const clinics = user?.clinics || [];
  const isLoading = isContextLoading;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <Spinner size="sm" />
        <span className="text-sm text-gray-600">Loading clinics...</span>
      </div>
    );
  }

  if (clinics.length === 0) {
    return null; // Will show PendingUserDashboard instead
  }

  const roleBadge = selectedClinic
    ? getRoleBadge(selectedClinic.userRole)
    : null;
  const RoleIcon = roleBadge?.icon;

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors border-2 border-transparent"
        aria-label="Select clinic"
        onClick={(e) => {
          const dropdown = e.currentTarget.nextElementSibling;
          dropdown.classList.toggle("hidden");
        }}
      >
        <Building2 className="w-5 h-5 text-blue-600" />
        <div className="text-left flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {selectedClinic?.name || "Select Clinic"}
            </span>
            {roleBadge && RoleIcon && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleBadge.bgColor} ${roleBadge.textColor}`}
              >
                <RoleIcon className="w-3 h-3 mr-1" />
                {roleBadge.label}
              </span>
            )}
          </div>
          {selectedClinic?.address?.city && (
            <div className="text-xs text-gray-500 truncate max-w-[200px]">
              {selectedClinic.address.city}
            </div>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Dropdown menu */}
      <div className="hidden absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
        <div className="p-2 max-h-96 overflow-y-auto">
          {clinics.map((clinic) => {
            const clinicBadge = getRoleBadge(clinic.userRole);
            const ClinicRoleIcon = clinicBadge?.icon;

            return (
              <button
                key={clinic._id}
                onClick={() => {
                  switchClinic(clinic);
                  // Close dropdown
                  document
                    .querySelector(".relative button")
                    .nextElementSibling.classList.add("hidden");
                }}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors border-2 ${
                  clinic._id === selectedClinic?._id
                    ? `${clinicBadge?.bgColor} ${clinicBadge?.borderColor}`
                    : "hover:bg-gray-50 border-transparent"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-sm">{clinic.name}</div>
                  {clinicBadge && ClinicRoleIcon && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${clinicBadge.bgColor} ${clinicBadge.textColor}`}
                    >
                      <ClinicRoleIcon className="w-3 h-3 mr-1" />
                      {clinicBadge.label}
                    </span>
                  )}
                </div>
                {clinic.address?.city && (
                  <div className="text-xs text-gray-600 mt-0.5">
                    {clinic.address.line1 && `${clinic.address.line1}, `}
                    {clinic.address.city}
                  </div>
                )}
                {clinic.contact?.phone && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {clinic.contact.phone}
                  </div>
                )}
              </button>
            );
          })}

          {/* Create New Clinic Button */}
          <div className="border-t border-gray-200 mt-2 pt-2">
            <Link
              to="/clinics/new"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Clinic
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
