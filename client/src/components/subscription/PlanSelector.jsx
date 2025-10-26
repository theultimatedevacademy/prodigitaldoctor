/**
 * PlanSelector - Plan comparison and selection component
 */

import { PlanCard } from './PlanCard';
import { useSubscriptionPlans } from '../../api/hooks/useSubscription';
import { useAuth } from '../../hooks/useAuth';

export function PlanSelector({ onSelectPlan }) {
  const { data: plansData, isLoading: isLoadingPlans } = useSubscriptionPlans();
  const { user } = useAuth();

  const plans = plansData?.plans || [];
  const currentPlan = user?.subscription?.plan || 'free';

  if (isLoadingPlans) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl h-96"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isCurrentPlan={currentPlan === plan.id}
          isPopular={plan.popular}
          onSelect={onSelectPlan}
        />
      ))}
    </div>
  );
}
