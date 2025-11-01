/**
 * StaffManagementPage - Manage clinic staff (Owner only)
 * Invite, view, and remove staff members
 */

import { useState } from 'react';
import { UserPlus, Users, Crown, Stethoscope, UserX } from 'lucide-react';
import { useClinicContext } from '../contexts/ClinicContext';
import { useClinic, useRemoveStaff } from '../api/hooks/useClinics';
import { Button } from '../components/ui/Button';
import { ConfirmationModal } from '../components/ui/Modal';
import { InviteStaffModal } from '../components/staff/InviteStaffModal';
import { toast } from 'react-toastify';

export function StaffManagementPage() {
  const { selectedClinicId, userClinicRole } = useClinicContext();
  const { data: clinicData, isLoading } = useClinic(selectedClinicId);
  const { mutate: removeStaff, isPending: isRemoving } = useRemoveStaff();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [staffToRemove, setStaffToRemove] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const clinic = clinicData?.clinic || clinicData;
  const staff = clinic?.staff || [];

  // Only owners can access
  if (userClinicRole !== 'clinic_owner') {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">Only clinic owners can manage staff.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const acceptedStaff = staff.filter((s) => s.accepted);
  const pendingStaff = staff.filter((s) => !s.accepted);

  const handleRemoveClick = (member) => {
    setStaffToRemove(member);
    setShowConfirmModal(true);
  };

  const handleConfirmRemove = () => {
    if (!staffToRemove) return;

    removeStaff(
      {
        clinicId: selectedClinicId,
        staffUserId: staffToRemove.user._id,
      },
      {
        onSuccess: () => {
          toast.success('Staff member removed successfully');
          setShowConfirmModal(false);
          setStaffToRemove(null);
        },
        onError: (error) => {
          toast.error(error.data?.error || error.message || 'Failed to remove staff member');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
            Staff Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage your clinic's team members
          </p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <UserPlus className="w-5 h-5 mr-2" />
          Invite Staff
        </Button>
      </div>

      {/* Clinic Owner Card */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-300 rounded-xl p-4 sm:p-6 mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-yellow-200 rounded-full flex items-center justify-center">
            <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-700" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-yellow-900">Clinic Owner</h3>
            <p className="text-yellow-800 truncate">{clinic?.owner?.name}</p>
            <p className="text-xs sm:text-sm text-yellow-700 break-words">{clinic?.owner?.email}</p>
          </div>
        </div>
      </div>

      {/* Active Staff Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Active Staff ({acceptedStaff.length})
        </h2>
        {acceptedStaff.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No active staff members yet</p>
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              variant="secondary"
              size="sm"
              className="mt-4"
            >
              Invite Your First Staff Member
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {acceptedStaff.map((member) => (
              <div
                key={member.user?._id}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {member.role === 'doctor' ? (
                        <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      ) : (
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                      )}
                    </div>
                    <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {member.user?.name}
                      </h3>
                      <p className="text-sm text-gray-600 break-words">{member.user?.email}</p>
                      <span
                        className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                          member.role === 'doctor'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {member.role === 'doctor' ? 'Doctor' : 'Staff'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveClick(member)}
                    className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove staff member"
                  >
                    <UserX className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Invitations */}
      {pendingStaff.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Pending Invitations ({pendingStaff.length})
          </h2>
          <div className="space-y-4">
            {pendingStaff.map((member) => (
              <div
                key={member.user?._id}
                className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{member.user?.name}</p>
                    <p className="text-sm text-gray-600 break-words">{member.user?.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Invited as {member.role === 'doctor' ? 'Doctor' : 'Staff'} •{' '}
                      {new Date(member.invitedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-yellow-700 font-medium text-center sm:text-left">
                  Awaiting acceptance
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <InviteStaffModal
          clinicId={selectedClinicId}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setStaffToRemove(null);
        }}
        onConfirm={handleConfirmRemove}
        title="Remove Staff Member"
        message={`Are you sure you want to remove ${staffToRemove?.user?.name} from your clinic? This action cannot be undone.`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        isLoading={isRemoving}
      />
    </div>
  );
}
