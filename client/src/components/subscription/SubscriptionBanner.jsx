/**
 * SubscriptionBanner - Trial reminder banner
 * Shows trial expiration and upgrade CTA
 */

import { useState } from "react";
import { useNavigate } from "react-router";
import { X, Zap } from "lucide-react";
import { Button } from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";

export function SubscriptionBanner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  const subscription = user?.subscription;

  // Only show for trial users
  if (!subscription || subscription.status !== "trial" || isDismissed) {
    return null;
  }

  // Calculate days remaining
  const trialEndsAt = new Date(subscription.trialEndsAt);
  const now = new Date();
  const daysRemaining = Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24));

  // Don't show if trial has ended
  if (daysRemaining < 0) {
    return null;
  }

  const isUrgent = daysRemaining <= 7;

  return (
    <div
      className={`no-print ${
        isUrgent
          ? "bg-gradient-to-r from-orange-500 to-red-500"
          : "bg-gradient-to-r from-blue-600 to-purple-600"
      } text-white`}
    >
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-white bg-opacity-20">
              <Zap className="h-5 w-5" />
            </span>
            <p className="ml-3 font-medium">
              {isUrgent && <span className="mr-2">⚠️</span>}
              Your free trial ends in{" "}
              <span className="font-bold">
                {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
              </span>{" "}
              — Upgrade now to continue using all features
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <Button
              onClick={() => navigate("/subscription")}
              variant="secondary"
              size="sm"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Upgrade Now
            </Button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
