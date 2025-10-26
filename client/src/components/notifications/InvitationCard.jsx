/**
 * InvitationCard - Display clinic invitation with accept/reject actions
 */

import { useState } from 'react';
import { Building2, User, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { ConfirmationModal } from '../ui/Modal';
import { useAcceptInvitation, useRejectInvitation } from '../../api/hooks/useInvitations';

export function InvitationCard({ invitation }) {
  const acceptMutation = useAcceptInvitation();
  const rejectMutation = useRejectInvitation();
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleAccept = () => {
    acceptMutation.mutate(invitation._id);
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    rejectMutation.mutate(invitation._id);
    setShowRejectModal(false);
  };

  const isLoading = acceptMutation.isPending || rejectMutation.isPending;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {invitation.clinic?.name || 'Unknown Clinic'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              You've been invited to join as{' '}
              <span className="font-medium text-gray-900">
                {invitation.role === 'doctor' ? 'Doctor' : 'Staff Member'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Clinic Details */}
      <div className="space-y-2 mb-4">
        {invitation.clinic?.address && (
          <div className="flex items-start text-sm text-gray-600">
            <Building2 className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0 text-gray-400" />
            <span>
              {invitation.clinic.address.line1}, {invitation.clinic.address.city}
            </span>
          </div>
        )}
        
        {invitation.clinic?.owner && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            <span>
              Invited by: <span className="font-medium">{invitation.clinic.owner.name}</span>
            </span>
          </div>
        )}

        {invitation.invitedAt && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>
              {new Date(invitation.invitedAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          onClick={handleAccept}
          disabled={isLoading}
          className="flex-1"
          size="sm"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {acceptMutation.isPending ? 'Accepting...' : 'Accept'}
        </Button>
        <Button
          onClick={handleRejectClick}
          disabled={isLoading}
          variant="outline"
          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          size="sm"
        >
          <XCircle className="w-4 h-4 mr-2" />
          {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
        </Button>
      </div>

      {/* Reject Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleConfirmReject}
        title="Reject Invitation"
        message={`Are you sure you want to reject the invitation from ${invitation.clinic?.name}? This action cannot be undone.`}
        confirmText="Reject"
        cancelText="Cancel"
        variant="danger"
        isLoading={rejectMutation.isPending}
      />
    </div>
  );
}
