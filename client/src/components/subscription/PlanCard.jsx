/**
 * PlanCard - Individual subscription plan display card
 */

import { Check, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";

export function PlanCard({
  plan,
  isCurrentPlan,
  isPopular,
  onSelect,
  isLoading,
}) {
  const getBorderColor = () => {
    if (isCurrentPlan) return "border-blue-500";
    if (isPopular) return "border-purple-500";
    return "border-gray-200";
  };

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-lg border-2 ${getBorderColor()} p-8 transition-all hover:shadow-xl`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
            <Sparkles className="w-4 h-4 mr-1" />
            Most Popular
          </div>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute top-4 right-4">
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
            Current Plan
          </div>
        </div>
      )}

      {/* Plan Name */}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

      {/* Price */}
      <div className="mb-6">
        <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
        <span className="text-gray-600">/month</span>
        {plan.id === "basic" && (
          <div className="mt-2">
            <span className="text-sm text-green-600 font-semibold">
              30-day free trial available
            </span>
          </div>
        )}
      </div>

      {/* Clinic Limit */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">
            {plan.maxClinics === 0
              ? "Join existing clinics"
              : plan.maxClinics === 999
                ? "Unlimited clinics"
                : `${plan.maxClinics} clinic${plan.maxClinics > 1 ? "s" : ""}`}
          </span>
        </p>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span className="ml-3 text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Action Button */}
      <Button
        onClick={() => onSelect(plan)}
        disabled={isCurrentPlan || isLoading || plan.id === "enterprise"}
        className="w-full"
        variant={isPopular ? "default" : "secondary"}
      >
        {isCurrentPlan
          ? "Current Plan"
          : plan.id === "enterprise"
            ? "Contact Sales"
            : isLoading
              ? "Processing..."
              : `Select ${plan.name}`}
      </Button>

      {plan.id === "enterprise" && (
        <p className="text-center text-xs text-gray-500 mt-2">
          Email us at hello@ocura360.com
        </p>
      )}
    </div>
  );
}
