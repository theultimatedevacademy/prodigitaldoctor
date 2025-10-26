/**
 * PendingUserDashboard - For new users with no clinic access
 * Shows options to start trial or wait for invitation
 */

import { useNavigate } from "react-router";
import { Building2, Mail, Zap } from "lucide-react";
import { Button } from "../components/ui/Button";
import { usePendingInvitations } from "../api/hooks/useInvitations";
import { useAuth } from "../hooks/useAuth";

export function PendingUserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: invitationsData } = usePendingInvitations();

  const pendingCount = invitationsData?.total || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Welcome to Ocura360!
          </h1>
          <p className="text-xl text-gray-600">
            Let's get you started with your clinic management
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Option 1: Start Trial */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-transparent hover:border-blue-500 transition-all">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Start Your Free Trial
            </h2>
            <p className="text-gray-600 mb-6">
              Create your own clinic and start managing patients. Get 30 days
              free trial with full access to all features.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-sm text-gray-700">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                30-day free trial
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Create 1 clinic
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                No credit card required
              </li>
            </ul>
            <Button
              onClick={() => navigate("/start-trial")}
              className="w-full"
              size="lg"
            >
              Start Free Trial
            </Button>
          </div>

          {/* Option 2: Wait for Invitation */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-transparent hover:border-purple-500 transition-all">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Join an Existing Clinic
            </h2>
            <p className="text-gray-600 mb-6">
              If your clinic owner has invited you, check your pending
              invitations and accept to get started.
            </p>

            {pendingCount > 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-900 font-semibold">
                  🎉 You have {pendingCount} pending invitation
                  {pendingCount > 1 ? "s" : ""}!
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-gray-700 text-sm">
                  No pending invitations yet. Ask your clinic owner to invite
                  you using your registered email:{" "}
                  <strong>{user?.email}</strong>
                </p>
              </div>
            )}

            <Button
              onClick={() => navigate("/notifications")}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              {pendingCount > 0 ? "View Invitations" : "Check Invitations"}
            </Button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Need help? Contact our support team at{" "}
            <a
              href="mailto:support@ocura360.com"
              className="text-blue-600 hover:underline"
            >
              support@ocura360.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
