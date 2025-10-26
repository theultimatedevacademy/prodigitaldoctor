/**
 * SubscriptionPage - Subscription management and plan selection
 */

import { CreditCard, Calendar, Building2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSubscriptionInfo, useUpgradeSubscription } from '../api/hooks/useSubscription';
import { PlanSelector } from '../components/subscription/PlanSelector';
import { toast } from 'react-toastify';

export function SubscriptionPage() {
  const { user } = useAuth();
  const { data: subscriptionData } = useSubscriptionInfo();
  const upgradeMutation = useUpgradeSubscription();

  const subscription = subscriptionData?.subscription || user?.subscription;
  const ownedClinics = user?.clinics?.filter((c) => c.userRole === 'clinic_owner') || [];

  const handleSelectPlan = async (plan) => {
    if (plan.id === 'free') {
      toast.info('You are already on the free plan');
      return;
    }

    if (plan.id === 'enterprise') {
      toast.info('Please contact sales for enterprise plan');
      return;
    }

    // TODO: Integrate payment gateway (Stripe/Razorpay)
    toast.info('Payment integration coming soon');
    
    // Placeholder for upgrade
    // await upgradeMutation.mutateAsync({ plan: plan.id, paymentToken: 'xxx' });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription</h1>
        <p className="text-gray-600">
          Manage your subscription and billing
        </p>
      </div>

      {/* Current Subscription Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Current Subscription
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Plan Info */}
          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Plan</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {subscription?.plan || 'Free'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {subscription?.status === 'trial' && 'Trial'}
                {subscription?.status === 'active' && 'Active'}
              </p>
            </div>
          </div>

          {/* Trial/Expiry Info */}
          {subscription?.trialEndsAt && subscription?.status === 'trial' && (
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Trial Ends</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(subscription.trialEndsAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.ceil(
                    (new Date(subscription.trialEndsAt) - new Date()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  days remaining
                </p>
              </div>
            </div>
          )}

          {/* Clinic Usage */}
          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Clinics</p>
              <p className="text-lg font-semibold text-gray-900">
                {ownedClinics.length} of{' '}
                {subscription?.maxClinics === 999
                  ? '∞'
                  : subscription?.maxClinics || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {subscription?.maxClinics === 0
                  ? 'Upgrade to create clinics'
                  : 'Clinics owned'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Available Plans
        </h2>
        <p className="text-gray-600 mb-6">
          Choose the plan that best fits your needs
        </p>

        <PlanSelector onSelectPlan={handleSelectPlan} />
      </div>

      {/* Payment Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Payment integration is coming soon. You can start your free trial now and upgrade later when payment processing is available.
        </p>
      </div>
    </div>
  );
}
