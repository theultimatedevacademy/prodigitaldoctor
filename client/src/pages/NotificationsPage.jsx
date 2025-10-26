/**
 * NotificationsPage - Full page view of all notifications
 * Shows pending invitations with accept/reject actions
 */

import { Bell, Mail } from 'lucide-react';
import { usePendingInvitations } from '../api/hooks/useInvitations';
import { InvitationCard } from '../components/notifications/InvitationCard';

export function NotificationsPage() {
  const { data: invitationsData, isLoading, error } = usePendingInvitations();

  const invitations = invitationsData?.invitations || [];
  const total = invitationsData?.total || 0;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error loading notifications: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Bell className="w-8 h-8 mr-3 text-blue-600" />
          Notifications
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your clinic invitations and notifications
        </p>
      </div>

      {/* Pending Invitations Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-blue-600" />
            Pending Invitations
            {total > 0 && (
              <span className="ml-2 px-2 py-1 text-xs font-bold bg-blue-600 text-white rounded-full">
                {total}
              </span>
            )}
          </h2>
        </div>

        {invitations.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Mail className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Pending Invitations
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              You don't have any pending clinic invitations at the moment. When someone invites you to join their clinic, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <InvitationCard
                key={invitation._id}
                invitation={invitation}
              />
            ))}
          </div>
        )}
      </div>

      {/* Future: Other notification types can be added here */}
    </div>
  );
}
