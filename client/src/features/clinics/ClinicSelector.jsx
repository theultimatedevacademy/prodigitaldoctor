/**
 * ClinicSelector Component
 * Dropdown to select active clinic with role badges
 */

import { useState, useEffect, useRef } from "react";
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
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const clinics = user?.clinics || [];
  const isLoading = isContextLoading;
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

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
    <div ref={dropdownRef} className="relative w-full sm:w-auto">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors border-2 border-transparent w-full sm:w-auto"
        aria-label="Select clinic"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
        <div className="text-left flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
              {selectedClinic?.name || "Select Clinic"}
            </span>
            {roleBadge && RoleIcon && (
              <span
                className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleBadge.bgColor} ${roleBadge.textColor} flex-shrink-0`}
              >
                <RoleIcon className="w-3 h-3 mr-1" />
                {roleBadge.label}
              </span>
            )}
          </div>
          {selectedClinic?.address?.city && (
            <div className="hidden sm:block text-xs text-gray-500 truncate max-w-[200px]">
              {selectedClinic.address.city}
            </div>
          )}
        </div>
        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
      </button>

      {/* Dropdown menu */}
      <div className={`${
        isOpen ? 'block' : 'hidden'
      } fixed sm:absolute top-[60px] sm:top-full left-0 right-0 sm:left-auto sm:right-0 mt-0 sm:mt-2 mx-4 sm:mx-0 w-auto sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50`}>
        <div className="p-2 max-h-96 overflow-y-auto">
          {clinics.map((clinic) => {
            const clinicBadge = getRoleBadge(clinic.userRole);
            const ClinicRoleIcon = clinicBadge?.icon;

            return (
              <button
                key={clinic._id}
                onClick={() => {
                  switchClinic(clinic);
                  setIsOpen(false);
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
