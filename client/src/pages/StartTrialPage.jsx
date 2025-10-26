/**
 * StartTrialPage - Activate 30-day free trial
 * Shows plan features and activates trial on confirmation
 */

import { useState } from "react";
import { useNavigate } from "react-router";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useStartTrial } from "../api/hooks/useSubscription";

export function StartTrialPage() {
  const navigate = useNavigate();
  const startTrialMutation = useStartTrial();
  const [agreed, setAgreed] = useState(false);

  const handleStartTrial = async () => {
    if (!agreed) return;

    await startTrialMutation.mutateAsync();

    // Redirect to clinic creation
    navigate("/clinics/new");
  };

  const features = [
    "Create and manage 1 clinic",
    "Unlimited patient records",
    "Appointment scheduling",
    "Digital prescriptions with DDI checking",
    "Staff management (invite doctors & staff)",
    "Medication database access",
    "Analytics dashboard",
    "Print & export prescriptions",
    "Mobile-responsive interface",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Start Your 30-Day Free Trial
          </h1>
          <p className="text-xl text-gray-600">
            Full access to all features. No credit card required.
          </p>
        </div>

        {/* Plan Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Badge */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 text-center">
            <p className="font-semibold">🎉 Special Offer: 30 Days FREE</p>
          </div>

          <div className="p-8">
            {/* Pricing */}
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                ₹0
                <span className="text-2xl text-gray-600 font-normal">
                  /month
                </span>
              </div>
              <p className="text-gray-600">
                Then ₹999/month after trial • Cancel anytime
              </p>
            </div>

            {/* Features List */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What's Included:
              </h3>
              <div className="grid gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="ml-3 text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="border-t pt-6 mb-6">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">
                  I agree to the{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    Privacy Policy
                  </a>
                  . I understand that my trial will automatically convert to a
                  paid subscription after 30 days unless I cancel.
                </span>
              </label>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleStartTrial}
              disabled={!agreed || startTrialMutation.isPending}
              className="w-full"
              size="lg"
            >
              {startTrialMutation.isPending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Activating Trial...
                </>
              ) : (
                <>
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>

            {/* Cancel Note */}
            <p className="text-center text-xs text-gray-500 mt-4">
              You can cancel your subscription at any time before the trial ends
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
