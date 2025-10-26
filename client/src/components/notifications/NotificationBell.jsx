/**
 * NotificationBell - Bell icon with badge count in top navigation
 * Shows dropdown with recent invitations
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Bell, Mail } from "lucide-react";
import { usePendingInvitations } from "../../api/hooks/useInvitations";
import { Button } from "../ui/Button";

export function NotificationBell() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { data: invitationsData } = usePendingInvitations();

  const pendingCount = invitationsData?.total || 0;
  const invitations = invitationsData?.invitations || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleViewAll = () => {
    setIsOpen(false);
    navigate("/notifications");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {pendingCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {pendingCount > 9 ? "9+" : pendingCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
            </h3>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {invitations.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No new notifications</p>
              </div>
            ) : (
              <div className="py-2">
                {invitations.slice(0, 3).map((invitation) => (
                  <div
                    key={invitation._id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                    onClick={handleViewAll}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Clinic Invitation
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {invitation.clinic?.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Role:{" "}
                          {invitation.role === "doctor" ? "Doctor" : "Staff"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {invitations.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <Button
                onClick={handleViewAll}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                View All Notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
